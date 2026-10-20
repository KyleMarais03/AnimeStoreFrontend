import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export function ProtectedRoute({ roles }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/signin" replace state={{ from: location }} />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

export function GuestRoute() {
  const { user } = useAuth()
  if (user) return <Navigate to={user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"} replace />
  return <Outlet />
}
