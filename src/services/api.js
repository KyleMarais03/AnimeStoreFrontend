import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 12000
})

const unwrap = response => response

export const userApi = {
  register: user => api.post("/api/users", user),
  login: (email, password) => api.post("/api/users/login", { email, password }),
  getById: id => api.get(`/api/users/${id}`),
  getAll: () => api.get("/api/users"),
  update: (id, user) => api.put(`/api/users/${id}`, user),
  delete: id => api.delete(`/api/users/${id}`),
  searchUserName: name => api.get(`/api/users/search/username/${encodeURIComponent(name)}`),
  searchEmail: email => api.get(`/api/users/search/email/${encodeURIComponent(email)}`),
  searchPattern: pattern => api.get("/api/users/search/pattern", { params: { pattern } })
}

export const productApi = {
  getAll: () => api.get("/products"),
  getById: id => api.get(`/products/${id}`),
  create: formData => api.post("/products", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id, product) => api.put(`/products/${id}`, product),
  delete: id => api.delete(`/products/${id}`),
  getAvailable: () => api.get("/products/available"),
  getOutOfStock: () => api.get("/products/out-of-stock"),
  getLowStock: threshold => api.get("/products/low-stock", { params: { threshold } }),
  checkAvailability: (id, quantity) => api.get(`/products/${id}/availability`, { params: { quantity } }),
  getStock: id => api.get(`/products/${id}/stock`),
  updateStock: (id, stock) => api.put(`/products/${id}/stock`, null, { params: { stock } }),
  decreaseStock: (id, quantity) => api.put(`/products/${id}/decrease-stock`, null, { params: { quantity } }),
  increaseStock: (id, quantity) => api.put(`/products/${id}/increase-stock`, null, { params: { quantity } })
}

export const categoryApi = {
  getAll: () => api.get("/categories"),
  getById: id => api.get(`/categories/${id}`),
  create: category => api.post("/categories", category)
}

export const cartApi = {
  create: cart => api.post("/shopping-carts/create", cart),
  getById: id => api.get(`/shopping-carts/${id}`),
  getByUserId: userId => api.get(`/shopping-carts/user/${userId}`),
  getAll: () => api.get("/shopping-carts/all"),
  getByStatus: status => api.get("/shopping-carts/status", { params: { status } }),
  update: cart => api.put("/shopping-carts/update", cart),
  delete: id => api.delete(`/shopping-carts/delete/${id}`)
}

export const cartItemApi = {
  create: cartItem => api.post("/cart-items/create", cartItem),
  getById: id => api.get(`/cart-items/${id}`),
  getAll: () => api.get("/cart-items/all"),
  update: cartItem => api.put("/cart-items/update", cartItem),
  delete: id => api.delete(`/cart-items/delete/${id}`)
}

export const orderApi = {
  create: order => api.post("/api/orders/create", order),
  getById: id => api.get(`/api/orders/${id}`),
  getAll: () => api.get("/api/orders/all"),
  getByStatus: status => api.get(`/api/orders/status/${encodeURIComponent(status)}`),
  update: order => api.put("/api/orders/update", order),
  delete: id => api.delete(`/api/orders/${id}`)
}

export const orderItemApi = {
  create: item => api.post("/api/orderitems/create", item),
  getById: id => api.get(`/api/orderitems/${id}`),
  getAll: () => api.get("/api/orderitems/all"),
  searchDescription: description => api.get("/api/orderitems/search", { params: { description } }),
  update: item => api.put("/api/orderitems/update", item),
  delete: id => api.delete(`/api/orderitems/${id}`)
}

export default api
