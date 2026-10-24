import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { cartApi } from "../services/api"
import { money, safeArray, uuid } from "../utils/helpers"
import { useAuth } from "./AuthContext"

const CartContext = createContext(null)

const calculateTotal = items => items.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const refreshCart = async () => {
    if (!user?.userId) {
      setCart(null)
      return null
    }
    setLoading(true)
    setError("")
    try {
      const response = await cartApi.getByUserId(user.userId)
      const carts = safeArray(response.data)
      const active = carts.find(item => String(item.status || "").toUpperCase() === "ACTIVE") || carts[0] || null
      const normalized = active ? { ...active, items: safeArray(active.items) } : null
      setCart(normalized)
      return normalized
    } catch (err) {
      setError(err.response?.data?.message || "Could not load your shopping cart.")
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refreshCart() }, [user?.userId])

  const saveCart = async nextCart => {
    const payload = {
      cartId: nextCart.cartId || uuid(),
      userId: user.userId,
      items: nextCart.items,
      totalAmount: calculateTotal(nextCart.items),
      status: "ACTIVE"
    }
    const response = nextCart.cartId ? await cartApi.update(payload) : await cartApi.create(payload)
    const saved = { ...response.data, items: safeArray(response.data?.items || payload.items) }
    setCart(saved)
    window.dispatchEvent(new Event("animestore-cart-updated"))
    return saved
  }

  const addToCart = async (product, quantity = 1) => {
    if (!user) throw new Error("Please sign in before adding items to the cart.")
    const current = cart || { cartId: "", userId: user.userId, items: [] }
    const items = [...safeArray(current.items)]
    const index = items.findIndex(item => String(item.productId) === String(product.productId))
    const currentQty = index >= 0 ? Number(items[index].quantity || 0) : 0
    const nextQty = currentQty + Number(quantity)
    if (nextQty > Number(product.stock || 0)) throw new Error(`Only ${product.stock} item(s) are available.`)
    const nextItem = {
      cartItemId: index >= 0 ? items[index].cartItemId : uuid(),
      productId: String(product.productId),
      quantity: nextQty,
      lineTotal: Number(product.price || 0) * nextQty
    }
    if (index >= 0) items[index] = nextItem
    else items.push(nextItem)
    return saveCart({ ...current, items })
  }

  const updateQuantity = async (cartItemId, quantity, product) => {
    const qty = Number(quantity)
    if (qty < 1) return cart
    if (product && qty > Number(product.stock || 0)) throw new Error(`Only ${product.stock} item(s) are available.`)
    const items = safeArray(cart?.items).map(item => item.cartItemId === cartItemId
      ? { ...item, quantity: qty, lineTotal: Number(product?.price ?? item.lineTotal / Math.max(item.quantity, 1)) * qty }
      : item)
    return saveCart({ ...cart, items })
  }

  const removeItem = async cartItemId => {
    if (!cart) return null
    const items = safeArray(cart.items).filter(item => item.cartItemId !== cartItemId)
    if (!items.length) return clearCart()
    return saveCart({ ...cart, items })
  }

  const clearCart = async () => {
    if (cart?.cartId) await cartApi.delete(cart.cartId)
    setCart(null)
    window.dispatchEvent(new Event("animestore-cart-updated"))
  }

  const itemCount = safeArray(cart?.items).reduce((sum, item) => sum + Number(item.quantity || 0), 0)
  const total = calculateTotal(safeArray(cart?.items))

  const value = useMemo(() => ({ cart, loading, error, itemCount, total, refreshCart, addToCart, updateQuantity, removeItem, clearCart, money }), [cart, loading, error, itemCount, total])
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used inside CartProvider")
  return context
}
