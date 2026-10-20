import { ChevronDown, ChevronRight, ClipboardCheck, Package, Truck } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { orderApi, orderItemApi } from "../services/api"
import { useAuth } from "../context/AuthContext"
import Loading from "../components/Loading"
import EmptyState from "../components/EmptyState"
import { money, safeArray, statusClass } from "../utils/helpers"

const statusIcon = status => { const key = String(status || "").toUpperCase(); if (key === "DELIVERED") return Truck; if (key === "PLACED" || key === "PROCESSING") return ClipboardCheck; return Package }

export default function OrdersPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [orders, setOrders] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(null)

  useEffect(() => { Promise.all([orderApi.getAll(), orderItemApi.getAll()]).then(([ordersResponse, itemsResponse]) => { setOrders(safeArray(ordersResponse.data).filter(order => order.userId === user.userId).sort((a,b) => String(b.orderDate).localeCompare(String(a.orderDate)))); setItems(safeArray(itemsResponse.data)) }).catch(() => {}).finally(() => setLoading(false)) }, [user.userId])

  if (loading) return <div className="content-page"><Loading label="Loading your orders..." /></div>
  if (!orders.length) return <div className="content-page narrow"><EmptyState title="No orders yet." text="Your completed checkout orders will appear here." action={<Link to="/catalog" className="primary-button">Start shopping</Link>} /></div>

  const placed = searchParams.get("placed")
  return <div className="content-page"><section className="page-intro compact"><span className="eyebrow">ORDER HISTORY</span><h1>Keep an eye on your orders.</h1><p>{orders.length} order{orders.length === 1 ? "" : "s"} linked to your customer account.</p></section>{placed && <div className="form-alert success">Order <b>{placed}</b> was created successfully. Your order has been placed successfully.</div>}<div className="order-list">{orders.map(order => { const Icon = statusIcon(order.status); const orderItems = items.filter(item => item.order?.orderId === order.orderId); const isOpen = open === order.orderId; return <article className="order-card" key={order.orderId}><button className="order-card-head" onClick={() => setOpen(isOpen ? null : order.orderId)}><div className="order-id"><span className="order-icon"><Icon size={18} /></span><div><span className="eyebrow tiny">ORDER</span><h3>#{order.orderId}</h3><p>{order.orderDate ? new Date(order.orderDate).toLocaleString() : "Date not provided"}</p></div></div><div className="order-head-right"><span className={`status-badge ${statusClass(order.status)}`}>{order.status || "PROCESSING"}</span><strong>{money(order.orderTotalAmount)}</strong>{isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</div></button>{isOpen && <div className="order-card-detail"><div><span className="eyebrow tiny">DELIVERY</span><p>{order.shippingAddress}</p></div>{orderItems.length ? <div className="order-item-list">{orderItems.map(item => <div key={item.orderItemId}><span>{item.itemDescription}</span><span>× {item.itemQuantity}</span><strong>{money(Number(item.unitPrice) * Number(item.itemQuantity))}</strong></div>)}</div> : <div className="muted">Your items are listed with this order.</div>}<div className="payment-receipt"><span className="eyebrow tiny">PAYMENT</span><b>{localStorage.getItem(`animestore-payment-${order.orderId}`) ? JSON.parse(localStorage.getItem(`animestore-payment-${order.orderId}`)).method : "Checkout confirmed"}</b><small>Payment method selected at checkout.</small></div></div>}</article> })}</div></div>
}
