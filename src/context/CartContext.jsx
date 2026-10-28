import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [orders, setOrders] = useState([]); // 👈 store completed orders

    // Add product to cart
    const addToCart = (product) => {
        setCart((prev) => {
            // Normalize product ID (handle both productId and id)
            const productId = product.productId || product.id;

            const exists = prev.find((item) => item.id === productId);
            if (exists) {
                return prev.map((item) =>
                    item.id === productId ? { ...item, qty: item.qty + 1 } : item
                );
            }

            // Add new product with a normalized id field
            return [...prev, { ...product, id: productId, qty: 1 }];
        });
    };
    // Remove product from cart
    const removeFromCart = (id) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    // Clear entire cart
    const clearCart = () => setCart([]);

    // Checkout → move cart to orders
    const checkout = () => {
        if (cart.length === 0) return;
        const newOrder = {
            id: Date.now(),
            items: cart,
            total: cart.reduce((sum, item) => sum + item.price * item.qty, 0),
            date: new Date().toLocaleString(),
        };
        setOrders((prev) => [...prev, newOrder]);
        setCart([]); // empty cart after checkout
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, orders, checkout }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
