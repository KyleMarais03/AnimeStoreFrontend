import { createContext, useContext, useMemo, useState } from "react"
import { userApi } from "../services/api"

const AuthContext = createContext(null)
const STORAGE_KEY = "animestore-session"

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null
  } catch {
    return null
  }
}

const mapUser = user => ({
  userId: user?.userId || "",
  name: user?.userName || user?.name || "Customer",
  email: user?.email || "",
  role: String(user?.role || "USER").toUpperCase()
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)

  const signIn = async credentials => {
    try {
      const response = await userApi.login(credentials.email.trim(), credentials.password)
      const nextUser = mapUser(response.data)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
      setUser(nextUser)
      return nextUser
    } catch (error) {
      if (error.response?.status === 401) throw new Error("Incorrect email or password.")
      throw new Error("Unable to sign in. Check that the backend is running on port 8080.")
    }
  }

  const signUp = async values => {
    const email = values.email.trim().toLowerCase()
    const newUser = {
      userId: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      userName: values.name.trim(),
      email,
      password: values.password,
      role: "Customer"
    }
    try {
      await userApi.register(newUser)
      return signIn({ email, password: values.password })
    } catch (error) {
      if (error.response?.status === 409) throw new Error("That email is already registered.")
      throw new Error(error.response?.data?.message || "Unable to create the account.")
    }
  }

  const refreshUser = async () => {
    if (!user?.userId) return null
    const response = await userApi.getById(user.userId)
    const freshUser = mapUser(response.data)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(freshUser))
    setUser(freshUser)
    return freshUser
  }

  const updateUser = async values => {
    if (!user?.userId) throw new Error("No signed-in user.")
    const response = await userApi.update(user.userId, {
      userId: user.userId,
      userName: values.name,
      email: values.email,
      password: values.password || "",
      role: user.role
    })
    const nextUser = mapUser(response.data)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
    return nextUser
  }

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  const value = useMemo(() => ({ user, signIn, signUp, signOut, refreshUser, updateUser }), [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used inside AuthProvider")
  return context
}
