import { Menu, ShieldCheck, UserRound, X } from "lucide-react"
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import CartIcon from "../components/CartIcon"

const linkClass = ({ isActive }) => isActive ? "nav-link active" : "nav-link"

export default function CustomerLayout() {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const close = () => setOpen(false)
  const logout = () => { signOut(); close(); navigate("/") }

  return (
    <div className="site-shell">
      <header className="site-header">
        <Link to="/" className="brand-mark" onClick={close} aria-label="AnimeStore home">
          <img src="/products/brand-icon.png" alt="AnimeStore logo" className="brand-logo-image" />
          <span className="brand-name"><strong>AnimeStore</strong><small>Anime &amp; Collectibles</small></span>
        </Link>

        <button className="mobile-menu" onClick={() => setOpen(value => !value)} aria-label="Toggle navigation">
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>

        <nav className={open ? "site-nav open" : "site-nav"}>
          <NavLink to="/" className={linkClass} onClick={close}>Home</NavLink>
          <NavLink to="/catalog" className={linkClass} onClick={close}>Shop</NavLink>
          <NavLink to="/all-categories" className={linkClass} onClick={close}>Categories</NavLink>
          {user && <NavLink to="/orders" className={linkClass} onClick={close}>Orders</NavLink>}
          {user?.role === "ADMIN" && <NavLink to="/admin/dashboard" className={linkClass} onClick={close}><ShieldCheck size={15} /> Admin</NavLink>}
          <div className="nav-right-mobile">
            <CartIcon />
            {user ? (
              <button className="ghost-button" onClick={logout}>Sign out</button>
            ) : (
              <div className="mobile-auth-links">
                <Link to="/signin" className="outline-button" onClick={close}>Sign in</Link>
                <Link to="/signup" className="primary-button compact" onClick={close}>Sign up</Link>
              </div>
            )}
          </div>
        </nav>

        <div className="header-actions">
          <CartIcon />
          {user ? (
            <div className="account-menu">
              <Link to={user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"} className="account-link">
                <UserRound size={17} />
                <span>{user.name}</span>
              </Link>
              <button className="ghost-button desktop-only" onClick={logout}>Sign out</button>
            </div>
          ) : (
            <div className="auth-actions">
              <Link to="/signin" className="header-signin desktop-only">Sign in</Link>
              <Link to="/signup" className="primary-button compact desktop-only">Sign up</Link>
            </div>
          )}
        </div>
      </header>

      <main className="page-content"><Outlet /></main>

      <footer className="site-footer">
        <div><strong>AnimeStore</strong><p>Anime-inspired clothing, collectibles and accessories.</p></div>
        <div className="footer-links"><Link to="/catalog">Shop</Link><Link to="/all-categories">Categories</Link>{user && <Link to="/orders">Orders</Link>}<Link to={user ? "/account" : "/signin"}>Account</Link></div>
        <span>© 2026 AnimeStore</span>
      </footer>
    </div>
  )
}
