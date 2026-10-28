import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

function UserDashboard() {
    const [tab, setTab] = useState("orders");
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState({
        userId: "",
        firstName: "",
        lastName: "",
        email: "",
        address: "",
        phoneNumber: "",
    });

    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");

    // 🔹 Reusable fetchProfile function
    const fetchProfile = async () => {
        try {
            console.log("Fetching profile for user ID:", userId);
            const response = await api.get(`/customer/read/${userId}`);
            console.log("Profile data:", response.data);
            setProfile(response.data);
        } catch (err) {
            console.error("Error loading profile:", err);
        }
    };

    // 🔹 Fetch profile when component mounts
    useEffect(() => {
        if (userId) fetchProfile();
    }, [userId]);

    // 🔹 Fetch orders
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                console.log("Fetching orders for user ID:", userId);
                const response = await api.get(`/orders/customer/${userId}`);
                setOrders(response.data);
            } catch (err) {
                console.error("Error loading orders:", err);
            } finally {
                setLoading(false);
            }
        };
        if (userId) fetchOrders();
    }, [userId]);

    // 🔹 Update profile (matches your backend)
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            console.log("Updating profile:", profile);

            // Include userId in the body, since backend expects it
            const response = await api.post("/customer/update", { ...profile, userId });
            console.log("Profile updated:", response.data);

            alert("Profile updated successfully!");
            await fetchProfile(); // Refresh profile data
        } catch (err) {
            console.error("Error updating profile:", err);
            alert("Failed to update profile. Please try again.");
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            CONFIRMED: { class: "bg-success", text: "Confirmed" },
            PENDING: { class: "bg-warning text-dark", text: "Pending" },
            DELIVERED: { class: "bg-success", text: "Delivered" },
            CANCELLED: { class: "bg-danger", text: "Cancelled" },
        };
        const config = statusConfig[status] || { class: "bg-secondary", text: status };
        return <span className={`badge ${config.class}`}>{config.text}</span>;
    };

    return (
        <div className="container py-5 user-dashboard-page">
            <h2 className="fw-bold mb-4">My Dashboard</h2>
            <div className="row">
                {/* Sidebar */}
                <div className="col-md-3 mb-4">
                    <div className="list-group shadow-sm">
                        <button
                            className={`list-group-item list-group-item-action ${
                                tab === "orders" ? "active" : ""
                            }`}
                            onClick={() => setTab("orders")}
                        >
                            My Orders
                        </button>
                        <button
                            className={`list-group-item list-group-item-action ${
                                tab === "profile" ? "active" : ""
                            }`}
                            onClick={() => setTab("profile")}
                        >
                            Profile Settings
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="col-md-9">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            {tab === "orders" && (
                                <>
                                    <h5 className="fw-bold mb-3">My Orders</h5>
                                    {loading ? (
                                        <div className="text-center py-4">
                                            <div className="spinner-border" role="status"></div>
                                            <p className="mt-2">Loading your orders...</p>
                                        </div>
                                    ) : orders.length > 0 ? (
                                        <div className="d-flex flex-column gap-4">
                                            {orders.map((order) => (
                                                <div key={order.orderId} className="card shadow-sm p-4">
                                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                                        <div>
                                                            <strong>
                                                                ORDER #{order.orderNumber || `#${order.orderId}`}
                                                            </strong>
                                                            <p className="text-muted mb-0">
                                                                Date:{" "}
                                                                {order.orderDate
                                                                    ? new Date(order.orderDate).toLocaleDateString()
                                                                    : "N/A"}{" "}
                                                                | Status:{" "}
                                                                {getStatusBadge(order.status || "UNKNOWN")}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="mb-3">
                                                        <p className="fw-bold mb-2">Items:</p>
                                                        {order.orderItems && order.orderItems.length > 0 ? (
                                                            <ul className="list-unstyled mb-0">
                                                                {order.orderItems.map((item, index) => (
                                                                    <li key={index}>
                                                                        {item.product?.name || "Product"} ×{item.quantity} – R{" "}
                                                                        {(item.subtotal || 0).toFixed(2)}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <p className="text-muted mb-0">No items found</p>
                                                        )}
                                                    </div>
                                                    <div className="mb-3">
                                                        <p className="fw-bold mb-1">Shipping:</p>
                                                        <p className="mb-0">
                                                            {order.shippingAddress || "No shipping address provided"}
                                                        </p>
                                                    </div>
                                                    <div className="mb-3">
                                                        <p className="fw-bold mb-1">Payment:</p>
                                                        <p className="mb-0">
                                                            {order.paymentMethod || "Not specified"} |{" "}
                                                            <strong>Total:</strong> R{" "}
                                                            {order.totalAmount?.toFixed(2) || "0.00"}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <h5>No orders yet</h5>
                                            <p className="text-muted">
                                                Start shopping to see your orders here!
                                            </p>
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => navigate("/catalog")}
                                            >
                                                Start Shopping
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}

                            {tab === "profile" && (
                                <>
                                    <h5 className="fw-bold mb-3">Profile Settings</h5>
                                    <form onSubmit={handleProfileUpdate}>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">First Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={profile.firstName || ""}
                                                    onChange={(e) =>
                                                        setProfile({
                                                            ...profile,
                                                            firstName: e.target.value,
                                                        })
                                                    }
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Last Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={profile.lastName || ""}
                                                    onChange={(e) =>
                                                        setProfile({
                                                            ...profile,
                                                            lastName: e.target.value,
                                                        })
                                                    }
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={profile.email || ""}
                                                onChange={(e) =>
                                                    setProfile({ ...profile, email: e.target.value })
                                                }
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Address</label>
                                            <textarea
                                                className="form-control"
                                                value={profile.address || ""}
                                                onChange={(e) =>
                                                    setProfile({ ...profile, address: e.target.value })
                                                }
                                                rows="3"
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Phone Number</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={profile.phoneNumber || ""}
                                                onChange={(e) =>
                                                    setProfile({ ...profile, phoneNumber: e.target.value })
                                                }
                                            />
                                        </div>

                                        <button className="btn btn-primary">Save Changes</button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserDashboard;
