import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../utils/api";

function OrderSuccess() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [payment, setPayment] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    console.log("🟡 OrderSuccess state:", state); // Debug log

    useEffect(() => {
        const fetchOrderData = async () => {
            try {
                setLoading(true);

                // If we have state with order data, use it
                if (state && state.order) {
                    console.log(" Using order data from state:", state.order);
                    setOrder(state.order);
                    setPayment(state.payment);
                    setCustomer(state.customer);
                    setLoading(false);
                    return;
                }

                // If we have orderId in state but no full order data
                if (state && state.orderId) {
                    console.log(" Fetching order by ID from state:", state.orderId);
                    const orderResponse = await api.get(`/orders/${state.orderId}`);
                    setOrder(orderResponse.data);

                    // Try to fetch payment data
                    try {
                        const paymentResponse = await api.get(`/payment/order/${state.orderId}`);
                        setPayment(paymentResponse.data);
                    } catch (paymentError) {
                        console.log("Payment data not available");
                    }

                    setLoading(false);
                    return;
                }

                // If no state at all, try to get the latest order for the user
                const userId = localStorage.getItem("userId");
                if (userId) {
                    console.log(" Fetching latest orders for user:", userId);
                    const ordersResponse = await api.get(`/orders/customer/${userId}`);
                    const orders = ordersResponse.data;

                    if (orders && orders.length > 0) {
                        // Get the most recent order
                        const latestOrder = orders[0];
                        console.log(" Latest order found:", latestOrder);
                        setOrder(latestOrder);

                        // Try to fetch payment data for the latest order
                        try {
                            const paymentResponse = await api.get(`/payment/order/${latestOrder.orderId}`);
                            setPayment(paymentResponse.data);
                        } catch (paymentError) {
                            console.log("Payment data not available for latest order");
                        }

                        // Fetch customer data
                        try {
                            const customerResponse = await api.get(`/customer/read/${userId}`);
                            setCustomer(customerResponse.data);
                        } catch (customerError) {
                            console.log("Customer data not available");
                        }
                    }
                }

            } catch (err) {
                console.error(" Error fetching order data:", err);
                setError("Failed to load order details");
            } finally {
                setLoading(false);
            }
        };

        fetchOrderData();
    }, [state]);

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <h3>Loading Order Details...</h3>
                <p className="text-muted">Please wait while we fetch your order information.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-5 text-center">
                <div className="text-danger mb-3">
                    <i className="fas fa-exclamation-triangle fa-3x"></i>
                </div>
                <h2 className="fw-bold mb-3">Error Loading Order</h2>
                <p>{error}</p>
                <div className="d-flex justify-content-center gap-3 mt-4">
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate("/dashboard")}
                    >
                        View My Orders
                    </button>
                    <Link to="/catalog" className="btn btn-outline-secondary">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container py-5 text-center">
                <div className="text-warning mb-3">
                    <i className="fas fa-exclamation-circle fa-3x"></i>
                </div>
                <h2 className="fw-bold mb-3">Order Processing</h2>
                <p>Your order has been placed successfully!</p>
                <p className="text-muted">You can view your order details in your dashboard.</p>
                <div className="d-flex justify-content-center gap-3 mt-4">
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate("/dashboard")}
                    >
                        View My Orders
                    </button>
                    <Link to="/catalog" className="btn btn-outline-secondary">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    {/* Success Header */}
                    <div className="text-center mb-4">
                        <div className="text-success mb-3">
                            <i className="fas fa-check-circle fa-4x"></i>
                        </div>
                        <h1 className="fw-bold text-success">Order Placed Successfully!</h1>
                        <p className="text-muted">
                            Thank you for your purchase{customer?.firstName ? `, ${customer.firstName}` : ''}!
                        </p>
                    </div>

                    {/* Order Details Card */}
                    <div className="card shadow-sm p-4 mb-4">
                        <h5 className="mb-3 border-bottom pb-2"> Order Details</h5>
                        <div className="row">
                            <div className="col-md-6">
                                <p><strong>Order Number:</strong> {order.orderNumber || `#${order.orderId}`}</p>
                                <p><strong>Order Date:</strong> {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'Today'}</p>
                                <p><strong>Total Amount:</strong> R {order.totalAmount?.toFixed(2) || '0.00'}</p>
                                {order.shippingAddress && (
                                    <p><strong>Shipping Address:</strong> {order.shippingAddress}</p>
                                )}
                            </div>
                            <div className="col-md-6">
                                <p><strong>Payment Method:</strong> {order.paymentMethod || 'Not specified'}</p>
                                <p><strong>Status:</strong> <span className="badge bg-success">{order.status || 'CONFIRMED'}</span></p>
                                {customer?.email && (
                                    <p><strong>Email Sent To:</strong> {customer.email}</p>
                                )}
                            </div>
                        </div>

                        {/* Order Items */}
                        {order.orderItems && order.orderItems.length > 0 && (
                            <div className="mt-4">
                                <h6>Items Ordered:</h6>
                                {order.orderItems.map((item, index) => (
                                    <div key={index} className="d-flex justify-content-between border-bottom py-2">
                                        <span>
                                            {item.product?.name || 'Product'} × {item.quantity}
                                        </span>
                                        <span>R {((item.unitPrice || 0) * (item.quantity || 0)).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Payment Information - Only show if payment data exists */}
                    {payment && payment.paymentId && (
                        <div className="card shadow-sm p-4 mb-4">
                            <h5 className="mb-3 border-bottom pb-2"> Payment Information</h5>
                            <div className="row">
                                <div className="col-md-6">
                                    <p><strong>Payment ID:</strong> {payment.paymentId}</p>
                                    {payment.transactionReference && (
                                        <p><strong>Transaction Reference:</strong> {payment.transactionReference}</p>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <p><strong>Amount Paid:</strong> R {payment.amount?.toFixed(2) || '0.00'}</p>
                                    <p><strong>Payment Status:</strong> <span className="badge bg-success">{payment.status || 'COMPLETED'}</span></p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="text-center">
                        <button
                            className="btn btn-primary me-3"
                            onClick={() => navigate("/catalog")}
                        >
                            Continue Shopping
                        </button>
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => navigate("/dashboard")}
                        >
                            View My Orders
                        </button>
                    </div>

                    {/*/!* Debug info - remove in production *!/*/}
                    {/*<div className="mt-4 p-3 bg-light rounded small">*/}
                    {/*    <strong>Debug Info:</strong>*/}
                    {/*    <div>Order ID: {order.orderId}</div>*/}
                    {/*    <div>Order Number: {order.orderNumber}</div>*/}
                    {/*    <div>Has State: {state ? 'Yes' : 'No'}</div>*/}
                    {/*    <div>State Keys: {state ? Object.keys(state).join(', ') : 'None'}</div>*/}
                    {/*</div>*/}
                </div>
            </div>
        </div>
    );
}

export default OrderSuccess;