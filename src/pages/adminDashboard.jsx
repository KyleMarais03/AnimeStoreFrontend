import React, { useState, useEffect } from "react";
import { Button, Form, Row, Col, Card } from "react-bootstrap";
import api from "../utils/api";
import ProductsPage from "./ProductsPage";
import InventoryPage from "./InventoryPage";
import OrdersPage from "./OrdersPage";

function AdminDashboard() {
  const [activePage, setActivePage] = useState("dashboard");
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    categoryName: "",
    productImage: null,
  });

  // Fetch categories
  const fetchCategories = async () => {
    try {
      console.log("🟡 Fetching categories...");
      const response = await api.get("/categories");
      console.log(" Categories fetched:", response.data);
      setCategories(response.data);
    } catch (err) {
      console.error(" Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "productImage") {
      setFormData({ ...formData, productImage: files[0] });
    } else if (name === "stock") {
      // Prevent negative values for stock
      const stockValue = Math.max(0, value);
      setFormData({ ...formData, [name]: stockValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Submit product form
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🟡 Form submission started...");

    if (!formData.name || !formData.price || !formData.stock || !formData.categoryName) {
      setError("Please fill in all required fields.");
      return;
    }

    // Additional validation for stock
    if (formData.stock < 0) {
      setError("Stock cannot be negative.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log("🟡 Step 1: Starting product creation process...");
      console.log("Form data:", formData);

      // Find or create category
      let categoryId;
      const existingCategory = categories.find(
          (cat) => cat.categoryName.toLowerCase() === formData.categoryName.toLowerCase()
      );

      if (existingCategory) {
        categoryId = existingCategory.categoryId;
        console.log(" Step 2: Using existing category ID:", categoryId);
      } else {
        console.log("🟡 Step 2: Creating new category...");
        try {
          const categoryResponse = await api.post("/categories", {
            categoryName: formData.categoryName,
          });
          console.log(" Category creation response:", categoryResponse);
          categoryId = categoryResponse.data.categoryId;
          console.log(" Step 2: Created new category ID:", categoryId);
          await fetchCategories();
        } catch (categoryError) {
          console.error(" Category creation failed:", categoryError);
          throw new Error(`Category creation failed: ${categoryError.response?.data?.message || categoryError.message}`);
        }
      }

      // Create product with image
      const productFormData = new FormData();
      productFormData.append("name", formData.name);
      productFormData.append("price", formData.price);
      productFormData.append("stock", formData.stock);
      productFormData.append("category_Id", categoryId);

      if (formData.productImage) {
        productFormData.append("productImage", formData.productImage);
        console.log("🟡 Image attached to form data");
      }

      console.log("🟡 Step 3: Sending product to backend...");
      console.log("Product form data entries:");
      for (let [key, value] of productFormData.entries()) {
        console.log(`  ${key}:`, value);
      }

      // Create product first
      let productResponse;
      try {
        productResponse = await api.post("/products", productFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log(" Step 4: Product created successfully:", productResponse.data);
      } catch (productError) {
        console.error(" Product creation failed:", productError);
        throw new Error(`Product creation failed: ${productError.response?.data?.message || productError.message}`);
      }

      const newProduct = productResponse.data;

      // Create inventory record - backend will auto-calculate status
      const inventoryData = {
        product: {
          productId: newProduct.productId
        }
      };

      console.log("🟡 Step 5: Creating inventory record...");
      console.log("Inventory data:", inventoryData);

      try {
        await api.post("/inventory/create", inventoryData);
        console.log(" Step 6: Inventory created successfully");
      } catch (inventoryError) {
        console.error(" Inventory creation failed:", inventoryError);
        // Don't throw error here - product was created successfully
        console.log(" Product was created but inventory creation failed");
      }

      // Reset form
      setFormData({
        name: "",
        price: "",
        stock: "",
        categoryName: "",
        productImage: null,
      });

      alert("Product created successfully!");

    } catch (err) {
      console.error(" FINAL ERROR DETAILS:");
      console.error("Error object:", err);
      console.error("Error response:", err.response);
      console.error("Error message:", err.message);
      console.error("Error config:", err.config);

      let errorMessage = "Failed to save product. ";

      if (err.response) {
        // Server responded with error status
        errorMessage += `Server error: ${err.response.status} - ${err.response.statusText}`;
        if (err.response.data) {
          errorMessage += ` - ${JSON.stringify(err.response.data)}`;
        }
      } else if (err.request) {
        // Request was made but no response received
        errorMessage += "No response from server. Check if backend is running.";
      } else {
        // Something else happened
        errorMessage += err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="d-flex admin-dashboard">
        {/* Sidebar */}
        <div className="bg-light p-3" style={{ minWidth: "220px", height: "100vh" }}>
          <h5 className="mb-4">ANIME CLOTHING</h5>
          <ul className="list-unstyled">
            <li
                className={`mb-2 fw-bold admin-sidebar-item ${activePage === "dashboard" ? "is-active" : ""}`}
                onClick={() => setActivePage("dashboard")}
                style={{ cursor: "pointer" }}
            >
              Dashboard
            </li>
            <li
                className={`mb-2 admin-sidebar-item ${activePage === "products" ? "is-active fw-bold" : ""}`}
                onClick={() => setActivePage("products")}
                style={{ cursor: "pointer" }}
            >
              Products
            </li>
            <li
                className={`mb-2 admin-sidebar-item ${activePage === "orders" ? "is-active fw-bold" : ""}`}
                onClick={() => setActivePage("orders")}
                style={{ cursor: "pointer" }}
            >
              Orders
            </li>
            <li
                className={`mb-2 admin-sidebar-item ${activePage === "inventory" ? "is-active fw-bold" : ""}`}
                onClick={() => setActivePage("inventory")}
                style={{ cursor: "pointer" }}
            >
              Inventory
            </li>
          </ul>
        </div>

        {/* Content Area */}
        <div className="flex-grow-1 p-4">
          {activePage === "dashboard" && (
              <Card className="p-4">
                <h4 className="mb-3">Add New Product</h4>
                {/*<p className="text-muted mb-3">*/}
                {/*  <strong>Status is automatically calculated:</strong><br/>*/}
                {/*  • 0 stock → OUT_OF_STOCK<br/>*/}
                {/*  • 1-10 stock → FEW_IN_STOCK<br/>*/}
                {/*  • 11+ stock → IN_STOCK*/}
                {/*</p>*/}

                {error && (
                    <div className="alert alert-danger">
                      <strong>Error:</strong> {error}
                    </div>
                )}

                <Form onSubmit={handleSubmit} encType="multipart/form-data">
                  {/* Product Name + Price */}
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Product Name</Form.Label>
                        <Form.Control
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Price</Form.Label>
                        <Form.Control
                            name="price"
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Stock + Category */}
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Stock Quantity</Form.Label>
                        <Form.Control
                            name="stock"
                            type="number"
                            min="0"
                            value={formData.stock}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                        <Form.Text className="text-muted">
                          Minimum value: 0
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Category</Form.Label>
                        <Form.Select
                            name="categoryName"
                            value={formData.categoryName}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        >
                          <option value="">Select a category</option>
                          <option value="Beanie">Beanie</option>
                          <option value="Cap">Cap</option>
                          <option value="Hoodie">Hoodie</option>
                          <option value="Tee">Tee</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Image only */}
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Product Image</Form.Label>
                        <Form.Control
                            type="file"
                            name="productImage"
                            accept="image/*"
                            onChange={handleChange}
                            disabled={loading}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving...
                        </>
                    ) : (
                        "Save Product"
                    )}
                  </Button>

                  {loading && (
                      <div className="mt-3">
                        <small className="text-muted">Creating product... Check browser console for details.</small>
                      </div>
                  )}
                </Form>
              </Card>
          )}

          {activePage === "products" && <ProductsPage />}
          {activePage === "orders" && <OrdersPage />}
          {activePage === "inventory" && <InventoryPage />}
        </div>
      </div>
  );
}

export default AdminDashboard;