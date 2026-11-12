import { useEffect, useMemo, useState } from "react";
import { orderApi, productApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

const idOf = product => product?.productId ?? product?.id;
const imageOf = product => product?.productImage ?? product?.product_image ?? product?.imageUrl ?? "";

const emptyItem = () => ({
    orderItemId: crypto.randomUUID(),
    productId: "",
    itemDescription: "",
    itemQuantity: 1,
    unitPrice: 0,
    availableStock: 0
});

const emptyOrder = userId => ({
    orderId: crypto.randomUUID(),
    userId: userId || "",
    orderDate: new Date().toISOString(),
    orderTotalAmount: 0,
    status: "PLACED",
    shippingAddress: "",
    orderItems: [emptyItem()]
});

export default function OrdersPage() {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [form, setForm] = useState(() => emptyOrder(user?.userId));
    const [editing, setEditing] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showOrders, setShowOrders] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const total = useMemo(() => form.orderItems.reduce(
        (sum, item) => sum + Number(item.unitPrice || 0) * Number(item.itemQuantity || 0), 0
    ), [form.orderItems]);

    useEffect(() => {
        loadProducts();
    }, []);

    const clearMessages = () => {
        setMessage("");
        setError("");
    };

    const loadProducts = async () => {
        try {
            let response;
            try {
                response = await productApi.getAvailable();
            } catch {
                response = await productApi.getAll();
            }
            setProducts(Array.isArray(response.data) ? response.data : []);
        } catch (e) {
            console.error("PRODUCT GET ERROR", e);
            setProducts([]);
            setError("Products could not be loaded from the Product REST API.");
        }
    };

    const loadOrders = async () => {
        clearMessages();
        setLoading(true);
        try {
            const response = await orderApi.getAll();
            setOrders(Array.isArray(response.data) ? response.data : []);
            setShowOrders(true);
        } catch (e) {
            console.error("ORDER GET ERROR", e);
            setError("Orders could not be loaded.");
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        clearMessages();
        setEditing(false);
        setForm(emptyOrder(user?.userId));
        setShowForm(true);
    };

    const changeOrderField = event => {
        const { name, value } = event.target;
        setForm(previous => ({ ...previous, [name]: value }));
    };

    const selectProduct = (index, productId) => {
        const product = products.find(value => String(idOf(value)) === String(productId));
        setForm(previous => ({
            ...previous,
            orderItems: previous.orderItems.map((item, itemIndex) => itemIndex === index
                ? {
                    ...item,
                    productId: productId,
                    itemDescription: product?.name || "",
                    unitPrice: Number(product?.price || 0),
                    availableStock: Number(product?.stock || 0)
                }
                : item)
        }));
    };

    const changeQuantity = (index, value) => {
        setForm(previous => ({
            ...previous,
            orderItems: previous.orderItems.map((item, itemIndex) => itemIndex === index
                ? { ...item, itemQuantity: value }
                : item)
        }));
    };

    const addItem = () => setForm(previous => ({
        ...previous,
        orderItems: [...previous.orderItems, emptyItem()]
    }));

    const removeItem = index => {
        if (form.orderItems.length === 1) {
            setError("Every order must have at least one OrderItem.");
            return;
        }
        setForm(previous => ({
            ...previous,
            orderItems: previous.orderItems.filter((_, itemIndex) => itemIndex !== index)
        }));
    };

    const validate = () => {
        clearMessages();
        if (!form.shippingAddress.trim()) {
            setError("Enter a shipping address.");
            return false;
        }
        for (const item of form.orderItems) {
            if (!item.productId) {
                setError("Select a product for every OrderItem.");
                return false;
            }
            const quantity = Number(item.itemQuantity);
            if (quantity < 1) {
                setError("OrderItem quantity must be at least 1.");
                return false;
            }
            if (item.availableStock > 0 && quantity > item.availableStock) {
                setError(`${item.itemDescription} only has ${item.availableStock} item(s) in stock.`);
                return false;
            }
        }
        return true;
    };

    const requestBody = () => ({
        ...form,
        userId: user?.userId || form.userId,
        orderTotalAmount: total,
        orderItems: form.orderItems.map(item => ({
            orderItemId: item.orderItemId || crypto.randomUUID(),
            itemDescription: item.itemDescription,
            itemQuantity: Number(item.itemQuantity),
            unitPrice: Number(item.unitPrice)
        }))
    });

    const submitOrder = async event => {
        event.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const response = editing
                ? await orderApi.update(requestBody())
                : await orderApi.create(requestBody());
            setMessage(`Order ${response.data.orderId} was ${editing ? "updated" : "created"} successfully.`);
            setShowForm(false);
            setEditing(false);
            await loadOrders();
        } catch (e) {
            console.error("ORDER SAVE ERROR", e);
            setError("The order could not be saved. Check the Spring Boot console.");
        } finally {
            setLoading(false);
        }
    };

    const editOrder = order => {
        const restoredItems = (order.orderItems || []).map(item => {
            const product = products.find(value => value.name === item.itemDescription);
            return {
                ...item,
                productId: product ? String(idOf(product)) : "",
                availableStock: Number(product?.stock || 0)
            };
        });
        setForm({ ...order, orderItems: restoredItems.length ? restoredItems : [emptyItem()] });
        setEditing(true);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const deleteOrder = async orderId => {
        if (!window.confirm(`Delete order ${orderId}?`)) return;
        try {
            await orderApi.delete(orderId);
            setOrders(current => current.filter(order => order.orderId !== orderId));
            setMessage(`Order ${orderId} was deleted.`);
        } catch (e) {
            console.error("ORDER DELETE ERROR", e);
            setError("The order could not be deleted.");
        }
    };

    return (
        <div className="content-page">
            <section className="page-intro">
                <span className="eyebrow">REST API DEMONSTRATION</span>
                <h1>Orders Management</h1>
                <p>Select products retrieved from the Product API and save them as OrderItems.</p>
            </section>

            <div className="rest-api-actions">
                <button className="primary-button" type="button" onClick={openCreate}>Create Order (POST)</button>
                <button className="outline-button" type="button" onClick={loadOrders}>Show All Orders (GET)</button>
            </div>

            {message && <div className="form-alert success">{message}</div>}
            {error && <div className="form-alert error">{error}</div>}
            {loading && <div className="api-loading">Processing REST API request...</div>}

            {showForm && (
                <section className="order-form-panel">
                    <h2>{editing ? "Update Order (PUT)" : "Create Order (POST)"}</h2>
                    <form onSubmit={submitOrder}>
                        <div className="order-form-grid">
                            <label><span>Order ID</span><input name="orderId" value={form.orderId} readOnly /></label>
                            <label><span>User ID</span><input value={user?.userId || form.userId} readOnly /></label>
                            <label><span>Order Date</span><input type="datetime-local" name="orderDate" value={form.orderDate?.slice(0, 16) || ""} onChange={changeOrderField} /></label>
                            <label><span>Status</span><select name="status" value={form.status} onChange={changeOrderField}><option>PLACED</option><option>PROCESSING</option><option>SHIPPED</option><option>DELIVERED</option><option>CANCELLED</option></select></label>
                        </div>

                        <label className="full-field"><span>Shipping Address</span><textarea name="shippingAddress" value={form.shippingAddress} onChange={changeOrderField} required /></label>

                        <section className="order-items-editor">
                            <div className="order-section-heading">
                                <div><span className="eyebrow">PRODUCTS FROM DATABASE</span><h3>OrderItems</h3></div>
                                <button type="button" className="outline-button" onClick={addItem}>Add Product</button>
                            </div>

                            {form.orderItems.map((item, index) => {
                                const product = products.find(value => String(idOf(value)) === String(item.productId));
                                return (
                                    <div className="order-item-editor" key={item.orderItemId}>
                                        <div className="order-item-number">OrderItem #{index + 1}</div>
                                        <label>
                                            <span>Product</span>
                                            <select value={item.productId} onChange={event => selectProduct(index, event.target.value)} required>
                                                <option value="">Select product</option>
                                                {products.map(value => (
                                                    <option key={idOf(value)} value={idOf(value)} disabled={Number(value.stock) <= 0}>
                                                        {value.name} - R{Number(value.price).toFixed(2)} - Stock: {value.stock ?? "N/A"}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                        <label><span>Quantity</span><input type="number" min="1" max={item.availableStock || undefined} value={item.itemQuantity} onChange={event => changeQuantity(index, event.target.value)} /></label>
                                        <div className="selected-product-summary">
                                            {product && imageOf(product) && <img src={imageOf(product)} alt={product.name} />}
                                            <strong>{item.itemDescription || "No product selected"}</strong>
                                            <span>Unit price: R{Number(item.unitPrice || 0).toFixed(2)}</span>
                                            <span>Subtotal: R{(Number(item.unitPrice || 0) * Number(item.itemQuantity || 0)).toFixed(2)}</span>
                                        </div>
                                        <button type="button" className="danger-button" onClick={() => removeItem(index)}>Remove</button>
                                    </div>
                                );
                            })}
                        </section>

                        <div className="order-total-box"><span>Order Total</span><strong>R{total.toFixed(2)}</strong></div>
                        <div className="order-form-actions">
                            <button className="primary-button" type="submit">{editing ? "Update Order (PUT)" : "Create Order (POST)"}</button>
                            <button className="outline-button" type="button" onClick={() => setShowForm(false)}>Cancel</button>
                        </div>
                    </form>
                </section>
            )}

            {showOrders && (
                <section className="orders-results">
                    <h2>Previously Created Orders</h2>
                    {!orders.length ? <div className="empty-orders">No orders found.</div> : (
                        <div className="order-list">{orders.map(order => (
                            <article className="order-card" key={order.orderId}>
                                <div className="order-card-top"><h3>#{order.orderId}</h3><span className="order-status">{order.status}</span></div>
                                <p>{order.shippingAddress}</p>
                                <strong>R{Number(order.orderTotalAmount || 0).toFixed(2)}</strong>
                                <div className="card-order-items">{(order.orderItems || []).map(item => (
                                    <div className="card-order-item" key={item.orderItemId}><span>{item.itemDescription}</span><span>Qty: {item.itemQuantity}</span><span>R{Number(item.unitPrice).toFixed(2)}</span></div>
                                ))}</div>
                                <div className="order-card-actions">
                                    <button className="edit-button" type="button" onClick={() => editOrder(order)}>Update (PUT)</button>
                                    <button className="danger-button" type="button" onClick={() => deleteOrder(order.orderId)}>Delete</button>
                                </div>
                            </article>
                        ))}</div>
                    )}
                </section>
            )}
        </div>
    );
}
