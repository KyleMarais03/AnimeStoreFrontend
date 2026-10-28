import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../utils/api";

function OrderDetails() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/orders/${orderId}`);
                console.log("Order details:", response.data);
                setOrder(response.data);
            } catch (err) {
                console.error("Error fetching order details:", err);
                setError("Failed to load order details");
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    if (loading) {
        return (
            <div className="container py-5">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="container py-5">
                <div className="text-center">
                    <h2 className="text-danger">Order Not Found</h2>
                    <p className="text-muted">{error || "The order you're looking for doesn't exist."}</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate("/dashboard")}
                    >
                        Back to My Orders
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold">Order Details</h2>
                    <p className="text-muted">Order #{order.orderNumber || order.orderId}</p>
                </div>
                <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/dashboard")}
                >
                    ← Back to My Orders
                </button>
            </div>

            <div className="row">
                {/* Order Summary */}
                <div className="col-lg-8">
                    <div className="card shadow-sm mb-4">
                        <div className="card-header bg-dark text-white">
                            <h5 className="mb-0"> Order Items</h5>
                        </div>
                        <div className="card-body">
                            {order.orderItems && order.orderItems.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table">
                                        <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Price</th>
                                            <th>Quantity</th>
                                            <th>Subtotal</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {order.orderItems.map((item, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        {item.product?.productImage ? (
                                                            <img
                                                                src={`data:image/jpeg;base64,${item.product.productImage}`}
                                                                alt={item.product.name}
                                                                className="me-3"
                                                                style={{
                                                                    width: "50px",
                                                                    height: "50px",
                                                                    objectFit: "cover",
                                                                    borderRadius: "8px"
                                                                }}
                                                            />
                                                        ) : (
                                                            <div
                                                                className="me-3 d-flex align-items-center justify-content-center bg-light rounded"
                                                                style={{
                                                                    width: "50px",
                                                                    height: "50px"
                                                                }}
                                                            >
                                                                <i className="fas fa-box text-muted"></i>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <strong>{item.product?.name || "Product"}</strong>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>R {item.unitPrice?.toFixed(2) || "0.00"}</td>
                                                <td>{item.quantity}</td>
                                                <td>
                                                    <strong>R {item.subtotal?.toFixed(2) || "0.00"}</strong>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                        <tfoot>
                                        <tr className="table-light">
                                            <td colSpan="3" className="text-end fw-bold">Total:</td>
                                            <td className="fw-bold fs-5">R {order.totalAmount?.toFixed(2) || "0.00"}</td>
                                        </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-muted">No items found in this order.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Order Information */}
                <div className="col-lg-4">
                    {/* Order Status */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-header bg-light">
                            <h6 className="mb-0"> Order Information</h6>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <strong>Order Number:</strong>
                                <div>{order.orderNumber || `#${order.orderId}`}</div>
                            </div>
                            <div className="mb-3">
                                <strong>Order Date:</strong>
                                <div>{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "N/A"}</div>
                            </div>
                            <div className="mb-3">
                                <strong>Status:</strong>
                                <div>
                                    <span className={`badge ${
                                        order.status === 'CONFIRMED' ? 'bg-success' :
                                            order.status === 'PENDING' ? 'bg-warning' :
                                                'bg-secondary'
                                    }`}>
                                        {order.status || 'UNKNOWN'}
                                    </span>
                                </div>
                            </div>
                            <div className="mb-3">
                                <strong>Payment Method:</strong>
                                <div>{order.paymentMethod || "Not specified"}</div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Information */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-header bg-light">
                            <h6 className="mb-0"> Shipping Information</h6>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <strong>Shipping Address:</strong>
                                <div>{order.shippingAddress || "No address provided"}</div>
                            </div>
                            {order.customer && (
                                <>
                                    <div className="mb-3">
                                        <strong>Customer:</strong>
                                        <div>
                                            {order.customer.firstName} {order.customer.lastName}
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <strong>Email:</strong>
                                        <div>{order.customer.email}</div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="card shadow-sm">
                        <div className="card-header bg-light">
                            <h6 className="mb-0">⚡ Actions</h6>
                        </div>
                        <div className="card-body">
                            <button
                                className="btn btn-outline-primary w-100 mb-2"
                                onClick={() => window.print()}
                            >
                                Print Receipt
                            </button>
                            <Link
                                to="/catalog"
                                className="btn btn-primary w-100"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderDetails;