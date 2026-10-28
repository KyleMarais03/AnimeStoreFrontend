import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

function Cart() {
    const { cart, removeFromCart, clearCart } = useCart();
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    return (
        <div className="container py-5">
            <h2 className="fw-bold mb-4"> Your Cart</h2>
            {cart.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div>
                    <ul className="list-group mb-4">
                        {cart.map((item) => (
                            <li
                                key={item.id}
                                className="list-group-item d-flex justify-content-between align-items-center"
                            >
                                <div>
                                    <strong>{item.name}</strong> (x{item.qty})
                                </div>
                                <div>
                                    R {(item.price * item.qty).toFixed(2)}
                                    <button
                                        className="btn btn-sm btn-danger ms-3"
                                        onClick={() => removeFromCart(item.id)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <h4>
                        Total:{" "}
                        <span className="text-success">R {total.toFixed(2)}</span>
                    </h4>
                    <div className="mt-3">
                        <button className="btn btn-outline-danger me-2" onClick={clearCart}>
                            Clear Cart
                        </button>
                        <Link
                            to="/checkout"
                            className="btn btn-success"
                            onClick={() => console.log("Navigating to checkout...")}
                        >
                            Checkout
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
export default Cart;
