import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Cart from "./pages/Cart";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Checkout from "./pages/Checkout";
import Designs from "./pages/Designs";
import ProductDetail from "./pages/ProductDetail";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/adminDashboard";
import OrderSuccess from "./pages/OrderSuccess";
import OrderDetails from "./pages/OrderDetails";

function PrivateRoute({ children }) {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("userToken");
            const role = localStorage.getItem("userRole");
            if (token && (role === "CUSTOMER" || role === "ADMIN")) {
                setIsAuthenticated(true);
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/signin" replace />;
}


// Admin-only route
function AdminRoute({ children }) {
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("userToken");
        const role = localStorage.getItem("userRole");

        console.log("AdminRoute check - Token:", !!token, "Role:", role); // Debug log

        // Check for ADMIN role (uppercase - matching backend response)
        if (token && role === "ADMIN") {
            setIsAdmin(true);
        }
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
            <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>;
    }

    return isAdmin ? children : <Navigate to="/signin" replace />;
}

// Redirect signed-in users away from sign-in/sign-up pages
function AuthRoute({ children }) {
    const [isLoading, setIsLoading] = useState(true);
    const [shouldRedirect, setShouldRedirect] = useState(false);
    const [redirectPath, setRedirectPath] = useState("/");

    useEffect(() => {
        const token = localStorage.getItem("userToken");
        const role = localStorage.getItem("userRole");

        if (token) {
            setShouldRedirect(true);
            if (role === "ADMIN") {
                setRedirectPath("/admin/dashboard");
            } else if (role === "CUSTOMER") {
                setRedirectPath("/dashboard");
            }
        }
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
            <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>;
    }

    return shouldRedirect ? <Navigate to={redirectPath} replace /> : children;
}

function App() {
    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="catalog" element={<Catalog />} />
                <Route path="cart" element={<Cart />} />

                {/* Auth routes - redirect if already signed in */}
                <Route path="signin" element={
                    <AuthRoute>
                        <SignIn />
                    </AuthRoute>
                } />
                <Route path="signup" element={
                    <AuthRoute>
                        <SignUp />
                    </AuthRoute>
                } />

                {/* Protected routes */}
                <Route path="checkout" element={
                    <PrivateRoute>
                        <Checkout />
                    </PrivateRoute>
                } />

                {/* Order Success Page */}
                <Route path="order-success" element={
                    <PrivateRoute>
                        <OrderSuccess />
                    </PrivateRoute>
                } />

                {/* Order Details Page */}
                <Route path="order-details/:orderId" element={
                    <PrivateRoute>
                        <OrderDetails />
                    </PrivateRoute>
                } />

                <Route path="designs" element={<Designs />} />
                <Route path="product/:id" element={<ProductDetail />} />

                {/* Protected route for logged-in customers */}
                <Route
                    path="dashboard"
                    element={
                        <PrivateRoute>
                            <UserDashboard />
                        </PrivateRoute>
                    }
                />

                {/* Protected route for Admin only */}
                <Route
                    path="admin/dashboard"
                    element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    }
                />
            </Route>

            {/* Redirect unknown routes to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;