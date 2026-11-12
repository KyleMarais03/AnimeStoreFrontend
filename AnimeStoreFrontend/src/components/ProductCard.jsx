import { ArrowUpRight, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { money, resolveImage } from "../utils/helpers";
export default function ProductCard({ product }) {
  const { user } = useAuth(); const { addToCart } = useCart(); const navigate = useNavigate();
  const [busy,setBusy]=useState(false), [message,setMessage]=useState("");
  const add=async e=>{e.preventDefault();e.stopPropagation();if(!user){navigate('/signin',{state:{from:{pathname:'/catalog'}}});return}if(user.role!=="SHOPPER"){setMessage("Only shoppers can add products to a cart.");return}try{setBusy(true);await addToCart(product,1);setMessage("Added to cart");setTimeout(()=>setMessage(""),1500)}catch(err){setMessage(err.message)}finally{setBusy(false)}};
  return <article className="product-card">
    <Link className="product-card-link" to={`/products/${product.productId}`}>
      <div className="product-media"><img src={resolveImage(product)} alt={product.name}/><span className={Number(product.stock)>0?"stock-pill":"stock-pill out"}>{Number(product.stock)>0?`${product.stock} available`:"Out of stock"}</span><span className="product-float"><ArrowUpRight size={16}/></span></div>
      <div className="product-card-body"><div className="product-card-topline"><span>{product.category?.name||product.category||"Anime"}</span></div><h3>{product.name}</h3><div className="product-card-bottom"><strong>{money(product.price)}</strong><span>View item</span></div></div>
    </Link>
    <button type="button" className="primary-button wide" disabled={busy||Number(product.stock)<=0} onClick={add}><ShoppingCart size={16}/>{busy?"Adding...":"Add to cart"}</button>
    {message&&<small className="product-card-message">{message}</small>}
  </article>;
}
