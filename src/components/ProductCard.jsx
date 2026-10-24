import { ShoppingBag } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import { money, productCategoryName, resolveImage } from "../utils/helpers"

export default function ProductCard({ product }) {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { addToCart } = useCart()
    const id = product.productId ?? product.id
    const stock = Number(product.stock ?? 0)

    const quickAdd = async () => {
        if (!user) { navigate("/signin", { state: { from: { pathname: "/catalog" } } }); return }
        try { await addToCart(product, 1) } catch { /* cart shows its own error */ }
    }

    return (
        <article className="product-card">
            <Link to={`/products/${id}`} className="product-card-link">
                <div className="product-media">
                    <img src={resolveImage(product)} alt={product.name} loading="lazy" />
                    <span className={stock > 0 ? "stock-pill" : "stock-pill out"}>
            {stock > 0 ? `${stock} in stock` : "Out of stock"}
          </span>
                </div>
                <div className="product-card-body">
                    <div className="product-card-topline"><span>{productCategoryName(product) || "Anime gear"}</span></div>
                    <h3>{product.name}</h3>
                    <div className="product-card-bottom">
                        <strong>{money(product.price)}</strong>
                        <span className="product-action-text">View details</span>
                    </div>
                </div>
            </Link>
            <button className="quick-add" onClick={quickAdd} disabled={stock <= 0}>
                <ShoppingBag size={14} /> Add to cart
            </button>
        </article>
    )
}