import { useCart } from "../context/CartContext";

function AdminOrders() {
    const { orders } = useCart();

    return (
        <div className="container py-5">
            <h2 className="fw-bold mb-4">📦 Admin Orders</h2>
            {orders.length === 0 ? (
                <p>No orders placed yet.</p>
            ) : (
                <div className="list-group">
                    {orders.map((order) => (
                        <div key={order.id} className="list-group-item mb-3 shadow-sm">
                            <h5>Order #{order.id}</h5>
                            <p className="text-muted">Date: {order.date}</p>
                            <ul>
                                {order.items.map((item) => (
                                    <li key={item.id}>
                                        {item.name} (x{item.qty}) — R {(item.price * item.qty).toFixed(2)}
                                    </li>
                                ))}
                            </ul>
                            <h6>Total: <span className="text-success">R {order.total.toFixed(2)}</span></h6>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AdminOrders;
