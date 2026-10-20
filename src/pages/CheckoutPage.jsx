import { Check, ChevronLeft, CreditCard, MapPin, ShieldCheck, ShoppingBag, Smartphone } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { orderApi, productApi } from "../services/api"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import { money, resolveImage, safeArray, uuid } from "../utils/helpers"

const methods = [["DEBIT_CARD", "Debit card", CreditCard], ["CREDIT_CARD", "Credit card", CreditCard], ["EFT", "EFT / bank transfer", Smartphone], ["PAYPAL", "PayPal", Smartphone]]

export default function CheckoutPage() {
  const { user } = useAuth()
  const { cart, total, clearCart } = useCart()
  const navigate = useNavigate()
  const [address, setAddress] = useState({ line1: "", city: "Cape Town", province: "Western Cape", postalCode: "" })
  const [method, setMethod] = useState("DEBIT_CARD")
  const [step, setStep] = useState(1)
  const [products, setProducts] = useState({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const items = safeArray(cart?.items)
    if (!items.length) return
    Promise.all(items.map(item => productApi.getById(item.productId).then(response => [String(item.productId), response.data]).catch(() => null))).then(results => { const next = {}; results.filter(Boolean).forEach(([id, product]) => { next[id] = product }); setProducts(next) })
  }, [cart?.cartId, cart?.items?.length])

  if (!cart || !safeArray(cart.items).length) return <div className="content-page narrow"><div className="empty-state"><h3>Nothing to checkout.</h3><p>Build your cart first, then come back here.</p><Link to="/catalog" className="primary-button">Browse catalog</Link></div></div>

  const items = safeArray(cart.items)
  const shippingAddress = `${address.line1}, ${address.city}, ${address.province}, ${address.postalCode}`

  const review = () => {
    if (!address.line1 || !address.city || !address.province || !address.postalCode) { setError("Please complete the delivery address."); return }
    setError(""); setStep(2)
  }

  const placeOrder = async () => {
    setError(""); setBusy(true)
    try {
      for (const item of items) {
        const response = await productApi.checkAvailability(item.productId, Number(item.quantity))
        if (!response.data) throw new Error(`Not enough stock for ${products[String(item.productId)]?.name || "one of your items"}.`)
      }
      const orderId = uuid()
      const orderItems = items.map(item => {
        const product = products[String(item.productId)]
        return { orderItemId: uuid(), itemDescription: product?.name || `Product ${item.productId}`, itemQuantity: Number(item.quantity), unitPrice: Number(product?.price || item.lineTotal / Math.max(item.quantity, 1)) }
      })
      const response = await orderApi.create({ orderId, userId: user.userId, orderDate: new Date().toISOString(), orderTotalAmount: Number(total.toFixed(2)), status: "PLACED", shippingAddress, orderItems })
      for (const item of items) await productApi.decreaseStock(item.productId, Number(item.quantity))
      localStorage.setItem(`animestore-payment-${response.data?.orderId || orderId}`, JSON.stringify({ method, amount: total, status: "CONFIRMED", timestamp: new Date().toISOString() }))
      await clearCart()
      navigate(`/orders?placed=${response.data?.orderId || orderId}`, { replace: true })
    } catch (err) { setError(err.response?.data?.message || err.message || "Could not place the order.") } finally { setBusy(false) }
  }

  return (
    <div className="content-page checkout-page"><section className="page-intro compact"><span className="eyebrow">CHECKOUT</span><h1>Finish your order.</h1><div className="stepper"><span className={step === 1 ? "active" : "done"}><b>1</b> Delivery</span><span className={step === 2 ? "active" : ""}><b>2</b> Payment & review</span></div></section>{error && <div className="form-alert error">{error}</div>}<div className="checkout-layout"><section className="checkout-main">{step === 1 ? <div className="panel-card"><div className="panel-title"><MapPin size={18} /><div><h3>Delivery details</h3><p>Where should we send your order?</p></div></div><div className="form-grid"><label>Address line<input value={address.line1} onChange={e => setAddress({ ...address, line1: e.target.value })} placeholder="House / street / unit" /></label><label>City<input value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} /></label><label>Province<input value={address.province} onChange={e => setAddress({ ...address, province: e.target.value })} /></label><label>Postal code<input value={address.postalCode} onChange={e => setAddress({ ...address, postalCode: e.target.value })} /></label></div><button className="primary-button" onClick={review}>Continue to payment <ChevronLeft size={17} className="rotate-180" /></button></div> : <><div className="panel-card"><div className="panel-title"><CreditCard size={18} /><div><h3>Payment method</h3><p>Select your preferred payment method.</p></div></div><div className="method-grid">{methods.map(([value, label, Icon]) => <button key={value} onClick={() => setMethod(value)} className={method === value ? "method-card active" : "method-card"}><span className="method-icon"><Icon size={18} /></span><div><b>{label}</b><small>Confirm at checkout</small></div>{method === value && <Check size={17} />}</button>)}</div><div className="demo-payment-note"><ShieldCheck size={17} /><span>Choose a payment method to continue.</span></div></div><div className="panel-card"><div className="panel-title"><ShoppingBag size={18} /><div><h3>Review</h3><p>{items.length} item{items.length === 1 ? "" : "s"}</p></div></div><div className="review-list">{items.map(item => <div key={item.cartItemId}><img src={resolveImage(products[String(item.productId)])} alt={products[String(item.productId)]?.name || "Product"} /><span>{products[String(item.productId)]?.name || "Product"}<small>Qty {item.quantity}</small></span><strong>{money(item.lineTotal)}</strong></div>)}</div><div className="checkout-actions"><button className="outline-button" onClick={() => setStep(1)}>Back</button><button className="primary-button" onClick={placeOrder} disabled={busy}>{busy ? "Placing order..." : `Place order · ${money(total)}`}</button></div></div></>}</section><aside className="summary-card checkout-summary"><span className="eyebrow">TOTAL</span><div className="summary-line"><span>Items</span><strong>{money(total)}</strong></div><div className="summary-total"><span>Pay now</span><strong>{money(total)}</strong></div><p className="muted tiny">Your order will be checked for availability before it is placed.</p></aside></div></div>
  )
}
