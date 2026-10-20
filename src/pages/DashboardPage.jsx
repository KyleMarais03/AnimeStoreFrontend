import { ArrowRight, Package, UserRound } from "lucide-react"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { orderApi } from "../services/api"
import { useAuth } from "../context/AuthContext"
import { money, safeArray } from "../utils/helpers"

export default function DashboardPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  useEffect(() => { orderApi.getAll().then(response => setOrders(safeArray(response.data).filter(order => order.userId === user.userId))).catch(() => {}) }, [user.userId])
  const latest = [...orders].sort((a,b) => String(b.orderDate).localeCompare(String(a.orderDate)))[0]
  return <div className="content-page dashboard-page"><section className="dashboard-welcome"><div><span className="eyebrow">MY ACCOUNT</span><h1>Welcome, {user.name}.</h1><p>View your orders and account details.</p></div><Link to="/catalog" className="primary-button">Continue shopping <ArrowRight size={17} /></Link></section><div className="customer-stats"><div className="stat-card"><span><Package size={19} /></span><div><small>Total orders</small><b>{orders.length}</b></div></div><div className="stat-card"><span><UserRound size={19} /></span><div><small>Account</small><b>Customer</b></div></div></div><div className="customer-grid"><section className="panel-card"><div className="panel-title"><Package size={18} /><div><h3>Latest order</h3><p>Your most recent purchase.</p></div></div>{latest ? <div className="latest-order"><div><span className="eyebrow tiny">#{latest.orderId}</span><h3>{latest.status}</h3><p>{latest.shippingAddress}</p></div><strong>{money(latest.orderTotalAmount)}</strong><Link to="/orders" className="text-link">View orders <ArrowRight size={15} /></Link></div> : <div className="muted">No orders yet. Start shopping to place your first order.</div>}</section><section className="panel-card"><div className="panel-title"><UserRound size={18} /><div><h3>Account details</h3><p>Update your personal information.</p></div></div><div className="profile-summary"><span className="profile-avatar">{user.name.slice(0,1).toUpperCase()}</span><div><b>{user.name}</b><span>{user.email}</span></div></div><Link to="/account" className="outline-button">Manage account</Link></section></div></div>
}
