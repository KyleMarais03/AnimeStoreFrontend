import { ArrowLeft, CheckCircle2, Minus, Plus, ShieldCheck, ShoppingBag, Truck } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { productApi } from "../services/api"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import Loading from "../components/Loading"
import { money, resolveImage } from "../utils/helpers"

export default function ProductDetailsPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    setLoading(true); setError("")
    productApi.getById(productId).then(response => setProduct(response.data)).catch(err => setError(err.response?.status === 404 ? "Product not found." : "Could not load product.")).finally(() => setLoading(false))
  }, [productId])

  const add = async () => {
    if (!user) { navigate("/signin", { state: { from: { pathname: `/products/${productId}` } } }); return }
    try { setBusy(true); setError(""); await addToCart(product, quantity); setMessage("Added to your cart."); setTimeout(() => navigate("/cart"), 700) } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  if (loading) return <div className="content-page"><Loading label="Loading product..." /></div>
  if (error && !product) return <div className="content-page"><div className="form-alert error">{error}</div><Link to="/catalog" className="outline-button">Back to catalog</Link></div>
  if (!product) return null

  const stock = Number(product.stock || 0)
  return (
    <div className="content-page product-detail-page"><Link to="/catalog" className="back-link"><ArrowLeft size={16} /> Back to catalog</Link><div className="detail-layout"><div className="detail-media"><img src={resolveImage(product)} alt={product.name} /></div><div className="detail-copy"><span className="eyebrow">{product.category?.name || "ANIME GEAR"}</span><h1>{product.name}</h1><div className="detail-price">{money(product.price)}</div><p className="detail-description">A fan-ready piece from the AnimeStore collection.</p><div className="detail-stock"><span className={stock > 0 ? "stock-dot live" : "stock-dot"}></span>{stock > 0 ? `${stock} units available` : "Currently out of stock"}</div><div className="qty-control"><button onClick={() => setQuantity(value => Math.max(1, value - 1))} disabled={stock <= 0}><Minus size={17} /></button><span>{quantity}</span><button onClick={() => setQuantity(value => Math.min(stock, value + 1))} disabled={stock <= 0}><Plus size={17} /></button></div><button className="primary-button wide" onClick={add} disabled={busy || stock <= 0}><ShoppingBag size={18} />{busy ? "Adding..." : "Add to cart"}</button>{message && <div className="form-alert success">{message}</div>}{error && <div className="form-alert error">{error}</div>}<div className="detail-points"><span><Truck size={17} /><b>Delivery</b><small>Fast and simple checkout.</small></span><span><CheckCircle2 size={17} /><b>Availability</b><small>Stock is checked before checkout.</small></span><span><ShieldCheck size={17} /><b>Quality</b><small>Clear product details and easy shopping.</small></span></div></div></div></div>
  )
}
