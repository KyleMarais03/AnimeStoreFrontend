import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Card, Spinner, Badge, Button, Modal } from "react-bootstrap";

function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Fetch all orders
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get("http://localhost:8080/orders");
                console.log(" Orders data:", response.data);

                // Filter out empty/invalid orders (like the #2 order with no customer)
                const validOrders = response.data.filter(order =>
                    order.customer &&
                    (order.customer.firstName || order.customer.lastName || order.customer.email) &&
                    order.orderItems &&
                    order.orderItems.length > 0
                );

                setOrders(validOrders);
            } catch (error) {
                console.error(" Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // Badge colors
    const getStatusBadge = (status) => {
        switch (status) {
            case "PENDING":
                return "secondary";
            case "CONFIRMED":
                return "warning";
            case "PROCESSING":
                return "primary";
            case "SHIPPED":
                return "secondary";
            case "DELIVERED":
                return "success";
            case "CANCELLED":
                return "danger";
            default:
                return "secondary";
        }
    };

    // View order details
    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedOrder(null);
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center mt-3">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    return (
        <>
            {/* Main Orders Table */}
            <Card className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4>Orders Management</h4>
                    <div>
                        <Badge bg="primary" className="me-2">
                            Total: {orders.length}
                        </Badge>
                    </div>
                </div>

                <Table striped bordered hover responsive>
                    <thead className="table-light">
                    <tr>
                        <th>ORDER #</th>
                        <th>CUSTOMER</th>
                        <th>DATE</th>
                        <th>ITEMS</th>
                        <th>TOTAL</th>
                        <th>STATUS</th>
                        <th>ACTIONS</th>
                    </tr>
                    </thead>
                    <tbody>
                    {orders.length > 0 ? (
                        orders.map((order) => (
                            <tr key={order.orderId}>
                                <td>
                                    <strong>{order.orderNumber || `#${order.orderId}`}</strong>
                                </td>
                                <td>
                                    {order.customer?.firstName} {order.customer?.lastName}
                                    {order.customer?.email && (
                                        <div>
                                            <small className="text-muted">
                                                {order.customer.email}
                                            </small>
                                        </div>
                                    )}
                                </td>
                                <td>
                                    {order.orderDate
                                        ? new Date(order.orderDate).toLocaleDateString()
                                        : "N/A"}
                                </td>
                                <td>{order.orderItems?.length || 0} items</td>
                                <td>
                                    <strong>R {order.totalAmount?.toFixed(2) || "0.00"}</strong>
                                </td>
                                <td>
                                    <Badge bg={getStatusBadge(order.status)}>
                                        {order.status || "PENDING"}
                                    </Badge>
                                </td>
                                <td>
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => handleViewOrder(order)}
                                    >
                                        View
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="text-center py-4">
                                <div className="text-muted">
                                    <h5>No orders found</h5>
                                    <p>
                                        Customer orders will appear here once they start placing
                                        orders.
                                    </p>
                                </div>
                            </td>
                        </tr>
                    )}
                    </tbody>
                </Table>
            </Card>

            {/* Modal for Order Details */}
            <Modal
                show={showModal}
                onHide={handleCloseModal}
                size="lg"
                centered
                backdrop="static"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Order Details</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {selectedOrder ? (
                        <div className="p-3">
                            <p>
                                <strong>ORDER #{selectedOrder.orderNumber}</strong>
                            </p>
                            <p>
                                Customer:{" "}
                                {selectedOrder.customer
                                    ? `${selectedOrder.customer.firstName} ${selectedOrder.customer.lastName} (${selectedOrder.customer.email})`
                                    : "N/A"}
                                <br />
                                Date:{" "}
                                {selectedOrder.orderDate
                                    ? new Date(selectedOrder.orderDate).toLocaleDateString()
                                    : "N/A"}{" "}
                                | Status:{" "}
                                <strong>{selectedOrder.status || "UNKNOWN"}</strong>
                            </p>

                            <p className="fw-bold mt-3">ITEMS:</p>
                            <ul>
                                {selectedOrder.orderItems &&
                                selectedOrder.orderItems.length > 0 ? (
                                    selectedOrder.orderItems.map((item, idx) => (
                                        <li key={idx}>
                                            • {item.product?.name || "Product"} ×{item.quantity} – R{" "}
                                            {(item.subtotal || 0).toFixed(2)}
                                        </li>
                                    ))
                                ) : (
                                    <li>No items found</li>
                                )}
                            </ul>

                            <p className="fw-bold mt-3">SHIPPING:</p>
                            <p>
                                {selectedOrder.shippingAddress || "No shipping address"} <br />
                                Phone:{" "}
                                {selectedOrder.customer?.phoneNumber ||
                                    "+27 000 000 0000"}
                            </p>

                            <p className="fw-bold mt-3">PAYMENT:</p>
                            <p>
                                {selectedOrder.paymentMethod || "N/A"} | <strong>Total:</strong>{" "}
                                R {selectedOrder.totalAmount?.toFixed(2) || "0.00"} |{" "}
                                <strong>Ref:</strong> TXN-
                                {String(selectedOrder.orderId).padStart(6, "0")}
                            </p>
                        </div>
                    ) : (
                        <p>Loading order details...</p>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Okay
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default OrdersPage;