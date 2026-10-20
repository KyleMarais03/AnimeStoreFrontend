import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { productApi } from "../services/api"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import Loading from "../components/Loading"
import EmptyState from "../components/EmptyState"
import { money, resolveImage, safeArray } from "../utils/helpers"

export default function CartPage() {
  const { user } = useAuth()
  const { cart, loading, error, total, updateQuantity, removeItem, clearCart } = useCart()
  const [products, setProducts] = useState({})
  const [actionError, setActionError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const items = safeArray(cart?.items)
    if (!items.length) { setProducts({}); return }
    Promise.all(items.map(item => productApi.getById(item.productId).then(response => [String(item.productId), response.data]).catch(() => null))).then(results => {
      const next = {}; results.filter(Boolean).forEach(([id, product]) => { next[id] = product }); setProducts(next)
    })
  }, [cart?.cartId, cart?.items?.length])

  if (!user) return <div className="content-page narrow"><div className="empty-state"><h3>Sign in to use your cart</h3><p>Your shopping cart is connected to your customer account in the backend.</p><Link to="/signin" className="primary-button">Sign in</Link></div></div>
  if (loading && !cart) return <div className="content-page narrow"><Loading label="Loading your cart..." /></div>
  if (!cart || !safeArray(cart.items).length) return <div className="content-page narrow"><EmptyState title="Your cart is clear." text="Add something from the catalog and it will be stored in your ShoppingCart REST resource." action={<Link to="/catalog" className="primary-button">Browse products</Link>} /></div>

  const items = safeArray(cart.items)
  const changeQty = async (item, delta) => {
    try { setActionError(""); const product = products[String(item.productId)]; await updateQuantity(item.cartItemId, Number(item.quantity) + delta, product) } catch (err) { setActionError(err.message) }
  }

  return (
    <div className="content-page cart-page"><section className="page-intro compact"><span className="eyebrow">SHOPPING CART</span><h1>Your cart</h1><p>{items.length} line item{items.length === 1 ? "" : "s"}</p></section>{(error || actionError) && <div className="form-alert error">{actionError || error}</div>}<div className="cart-layout"><section className="cart-items">{items.map(item => { const product = products[String(item.productId)]; return <article className="cart-row" key={item.cartItemId}><img src={resolveImage(product)} alt={product?.name || "Product"} /><div className="cart-row-info"><span className="eyebrow tiny">{product?.category?.name || "Product"}</span><h3>{product?.name || `Product ${item.productId}`}</h3><strong>{money(product?.price || item.lineTotal / Math.max(item.quantity, 1))}</strong></div><div className="qty-control small"><button onClick={() => changeQty(item, -1)} disabled={Number(item.quantity) <= 1}><Minus size={15} /></button><span>{item.quantity}</span><button onClick={() => changeQty(item, 1)} disabled={product && Number(item.quantity) >= Number(product.stock)}><Plus size={15} /></button></div><div className="cart-line-total">{money(item.lineTotal)}</div><button className="icon-button danger-icon" onClick={() => removeItem(item.cartItemId)} aria-label="Remove item"><Trash2 size={17} /></button></article> })}<button className="text-button danger-text" onClick={clearCart}>Clear cart</button></section><aside className="summary-card"><span className="eyebrow">ORDER SUMMARY</span><div className="summary-line"><span>Subtotal</span><strong>{money(total)}</strong></div><div className="summary-line"><span>Delivery</span><span>Calculated at checkout</span></div><div className="summary-total"><span>Total</span><strong>{money(total)}</strong></div><button className="primary-button wide" onClick={() => navigate("/checkout")}><span>Continue to checkout</span><ArrowRight size={17} /></button><Link to="/catalog" className="outline-button wide">Keep shopping</Link></aside></div></div>
  )
}
