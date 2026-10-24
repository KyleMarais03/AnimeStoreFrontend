import { BarChart3, Boxes, FolderKanban, LayoutDashboard, LogOut, Menu, PackageCheck, ShieldCheck, Users, X, Store, Tags } from "lucide-react"
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useAuth } from "../context/AuthContext"

const links = [
  ["/admin/dashboard", "Overview", LayoutDashboard],
  ["/admin/products", "Products", Boxes],
  ["/admin/inventory", "Inventory", PackageCheck],
  ["/admin/orders", "Orders", FolderKanban],
  ["/admin/users", "Customers", Users],
  ["/admin/categories", "Categories", Tags]
]

const navClass = ({ isActive }) => isActive ? "admin-nav-link active" : "admin-nav-link"

export default function AdminLayout() {
  const { user, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  const logout = () => { signOut(); navigate("/") }

  return (
    <div className="admin-shell">
      <aside className={mobileOpen ? "admin-sidebar open" : "admin-sidebar"}>
        <div className="admin-brand"><span className="brand-square">AS</span><div><strong>AnimeStore</strong><small>Admin</small></div><button className="sidebar-close mobile-menu" onClick={() => setMobileOpen(false)}>{mobileOpen ? <X size={18} /> : null}</button></div>
        <nav className="admin-nav">
          {links.map(([path, label, Icon]) => <NavLink key={path} to={path} className={navClass} onClick={() => setMobileOpen(false)}><Icon size={18} /><span>{label}</span></NavLink>)}
        </nav>
        <div className="admin-sidebar-bottom"><Link to="/" className="admin-nav-link"><Store size={18} /><span>Storefront</span></Link><button onClick={logout} className="admin-nav-link danger"><LogOut size={18} /><span>Sign out</span></button></div>
      </aside>
      <section className="admin-main">
        <header className="admin-topbar"><button className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={21} /></button><div><span className="eyebrow">ANIMESTORE</span><strong>Administration</strong></div><div className="admin-user"><span className="admin-dot"><ShieldCheck size={15} /></span><div><b>{user?.name}</b><small>{user?.email}</small></div><button onClick={logout} className="ghost-button desktop-only">Sign out</button></div></header>
        <div className="admin-content"><Outlet /></div>
      </section>
    </div>
  )
}
