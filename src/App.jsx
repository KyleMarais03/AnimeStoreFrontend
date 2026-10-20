import "./App.css"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { CartProvider } from "./context/CartContext"
import { GuestRoute, ProtectedRoute } from "./routing/RouteGuards"
import CustomerLayout from "./layout/CustomerLayout"
import AdminLayout from "./layout/AdminLayout"
import HomePage from "./pages/HomePage"
import ProductsPage from "./pages/ProductsPage"
import ProductDetailsPage from "./pages/ProductDetailsPage"
import AllCategoriesPage from "./pages/AllCategoriesPage"
import CartPage from "./pages/CartPage"
import CheckoutPage from "./pages/CheckoutPage"
import OrdersPage from "./pages/OrdersPage"
import DashboardPage from "./pages/DashboardPage"
import AccountPage from "./pages/AccountPage"
import SignInPage from "./pages/SignInPage"
import SignUpPage from "./pages/SignUpPage"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminProductsPage from "./pages/admin/AdminProductsPage"
import AdminInventoryPage from "./pages/admin/AdminInventoryPage"
import AdminOrdersPage from "./pages/admin/AdminOrdersPage"
import AdminUsersPage from "./pages/admin/AdminUsersPage"
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage"

function AuthenticatedProviders({ children }) {
  return <CartProvider>{children}</CartProvider>
}

function RootRedirect() {
  const { user } = useAuth()
  return <Navigate to={user?.role === "ADMIN" ? "/admin/dashboard" : "/"} replace />
}

export default function App() {
  return <BrowserRouter><AuthProvider><AuthenticatedProviders><Routes><Route element={<CustomerLayout />}><Route path="/" element={<HomePage />} /><Route path="/catalog" element={<ProductsPage />} /><Route path="/all-categories" element={<AllCategoriesPage />} /><Route path="/products/:productId" element={<ProductDetailsPage />} /><Route path="/cart" element={<CartPage />} /><Route element={<GuestRoute />}><Route path="/signin" element={<SignInPage />} /><Route path="/signup" element={<SignUpPage />} /></Route><Route element={<ProtectedRoute roles={["CUSTOMER", "ADMIN"]} />}><Route path="/dashboard" element={<DashboardPage />} /><Route path="/orders" element={<OrdersPage />} /><Route path="/checkout" element={<CheckoutPage />} /><Route path="/account" element={<AccountPage />} /></Route></Route><Route element={<ProtectedRoute roles={["ADMIN"]} />}><Route path="/admin" element={<AdminLayout />}><Route index element={<Navigate to="dashboard" replace />} /><Route path="dashboard" element={<AdminDashboard />} /><Route path="products" element={<AdminProductsPage />} /><Route path="inventory" element={<AdminInventoryPage />} /><Route path="orders" element={<AdminOrdersPage />} /><Route path="users" element={<AdminUsersPage />} /><Route path="categories" element={<AdminCategoriesPage />} /></Route></Route><Route path="*" element={<RootRedirect />} /></Routes></AuthenticatedProviders></AuthProvider></BrowserRouter>
}
