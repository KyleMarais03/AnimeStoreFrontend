import { ShoppingCart } from "lucide-react"
import { Link } from "react-router-dom"
import { useCart } from "../context/CartContext"

export default function CartIcon() {
  const { itemCount } = useCart()
  return (
    <Link to="/cart" className="icon-button cart-nav" aria-label="Shopping cart">
      <ShoppingCart size={19} />
      {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
    </Link>
  )
}
