import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { NavLink, useNavigate, Outlet, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useState, useEffect } from "react";
import ChatbotWidget from "../components/ChatbotWidget";

function MainLayout() {
    const { cart } = useCart();
    const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
    const navigate = useNavigate();
    const location = useLocation();
    const [userName, setUserName] = useState(localStorage.getItem("userName"));
    const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));
    const isUser = !!localStorage.getItem("userToken");

    const handleLogout = () => {
        localStorage.removeItem("userToken");
        localStorage.removeItem("userName");
        localStorage.removeItem("userRole");
        setUserName(null);
        setUserRole(null);
        navigate("/signin");
    };

    useEffect(() => {
        setUserName(localStorage.getItem("userName"));
        setUserRole(localStorage.getItem("userRole"));
    }, [location]);

    const isAdmin = !!userRole && userRole.toString().toLowerCase() === "admin";
    const dashboardPath = isAdmin ? "/admin/dashboard" : "/dashboard";

    return (
        <div className="site-shell">
            <div className="announcement-bar">
                <div className="container announcement-inner">
                    <span>Anime-inspired pieces for everyday wear</span>
                    <span>Made for fans across South Africa</span>
                </div>
            </div>

            <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top site-nav">
                <div className="container">
                    <NavLink className="navbar-brand" to="/" aria-label="Anime Store home">
                        <img className="brand-logo" src="/img/animestorelogo.png" alt="Anime Store" />
                    </NavLink>

                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarNav"
                        aria-controls="navbarNav"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto align-items-lg-center">
                            <li className="nav-item">
                                <NavLink to="/" end className="nav-link">
                                    <i className="bi bi-house-door me-1" aria-hidden="true"></i> Home
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink to="/catalog" className="nav-link">
                                    <i className="bi bi-bag me-1" aria-hidden="true"></i> Catalog
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink to="/cart" className="nav-link">
                                    <i className="bi bi-basket2 me-1" aria-hidden="true"></i> Cart
                                    {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                                </NavLink>
                            </li>

                            {isUser && isAdmin && (
                                <li className="nav-item">
                                    <NavLink to="/admin/dashboard" className="nav-link">
                                        <i className="bi bi-grid me-1" aria-hidden="true"></i> Dashboard
                                    </NavLink>
                                </li>
                            )}

                            {!isUser && (
                                <>
                                    <li className="nav-item">
                                        <NavLink to="/signin" className="btn btn-primary btn-sm nav-auth-link">
                                            Sign in
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink to="/signup" className="btn btn-primary btn-sm nav-auth-link">
                                            Create account
                                        </NavLink>
                                    </li>
                                </>
                            )}

                            {isUser && (
                                <>
                                    <li className="nav-item">
                                        <NavLink to={dashboardPath} className="btn btn-outline-primary btn-sm user-account-link">
                                            <i className="bi bi-person-circle me-1" aria-hidden="true"></i>
                                            {userName || "My account"}
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <button className="btn btn-link btn-sm text-muted" onClick={handleLogout}>
                                            Sign out
                                        </button>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>

            <main className="site-main">
                <Outlet />
            </main>

            <footer className="site-footer">
                <div className="container site-footer-inner">
                    <img className="footer-logo" src="/img/animestorelogo.png" alt="Anime Store" />
                    <span>Everyday comfort, with a little anime spirit.</span>
                </div>
            </footer>

            <ChatbotWidget />
        </div>
    );
}

export default MainLayout;
