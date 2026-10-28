import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Form, Row, Col, Card } from "react-bootstrap";

function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState(null);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState("");
    const [updateLoading, setUpdateLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        price: "",
        stock: "",
        categoryName: "",
        status: "",
        productImage: null,
    });

    // Fetch products and categories
    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const [productsResponse, categoriesResponse] = await Promise.all([
                    axios.get("http://localhost:8080/products"),
                    axios.get("http://localhost:8080/categories")
                ]);

                if (isMounted) {
                    console.log("Products data:", productsResponse.data);
                    setProducts(productsResponse.data);
                    setCategories(categoriesResponse.data);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    // Handle input changes for update form
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "productImage") {
            setFormData({ ...formData, productImage: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // Handle update button click
    const handleUpdateClick = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name || "",
            price: product.price || "",
            stock: product.stock || "",
            categoryName: product.category?.categoryName || "",
            status: product.status || "",
            productImage: null, // Reset image, admin can choose to keep or change
        });
        setError("");
    };

    // Cancel update
    const handleCancelUpdate = () => {
        setEditingProduct(null);
        setFormData({
            name: "",
            price: "",
            stock: "",
            categoryName: "",
            status: "",
            productImage: null,
        });
        setError("");
    };

    // Submit update form
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.price || !formData.stock || !formData.categoryName) {
            setError("Please fill in all required fields.");
            return;
        }

        try {
            setUpdateLoading(true);
            setError("");

            // Find or create category
            let categoryId;
            const existingCategory = categories.find(
                (cat) => cat.categoryName.toLowerCase() === formData.categoryName.toLowerCase()
            );

            if (existingCategory) {
                categoryId = existingCategory.categoryId;
            } else {
                const categoryResponse = await axios.post("http://localhost:8080/categories", {
                    categoryName: formData.categoryName,
                });
                categoryId = categoryResponse.data.categoryId;
                // Refresh categories
                const categoriesResponse = await axios.get("http://localhost:8080/categories");
                setCategories(categoriesResponse.data);
            }

            // Update product
            const productFormData = new FormData();
            productFormData.append("name", formData.name);
            productFormData.append("price", formData.price);
            productFormData.append("stock", formData.stock);
            productFormData.append("category_Id", categoryId);
            productFormData.append("status", formData.status);

            if (formData.productImage) {
                productFormData.append("productImage", formData.productImage);
            }

            await axios.put(`http://localhost:8080/products/${editingProduct.productId}`, productFormData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // Refresh products list
            const productsResponse = await axios.get("http://localhost:8080/products");
            setProducts(productsResponse.data);

            // Reset form and exit edit mode
            setEditingProduct(null);
            setFormData({
                name: "",
                price: "",
                stock: "",
                categoryName: "",
                status: "",
                productImage: null,
            });

            alert("Product updated successfully!");

        } catch (err) {
            console.error(err);
            setError("Failed to update product. " + (err.response?.data?.message || err.message));
        } finally {
            setUpdateLoading(false);
        }
    };
    // Handle delete product
    const handleDelete = async (productId) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await axios.delete(`http://localhost:8080/products/${productId}`);
                // Refresh products list
                const productsResponse = await axios.get("http://localhost:8080/products");
                setProducts(productsResponse.data);
                alert("Product deleted successfully!");
            } catch (error) {
                console.error("Error deleting product:", error);
                alert("Failed to delete product.");
            }
        }
    };

    if (loading) {
        return (
            <div className="container py-4">
                <div className="d-flex justify-content-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <h2 className="fw-bold mb-3">Products</h2>

            {/* Update Form - Shows when editing a product */}
            {editingProduct && (
                <Card className="p-4 mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4>Update Product: {editingProduct.name}</h4>
                        <Button variant="outline-secondary" onClick={handleCancelUpdate}>
                            Cancel Update
                        </Button>
                    </div>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <Form onSubmit={handleUpdateSubmit} encType="multipart/form-data">
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
                                        value={formData.price}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Stock + Category */}
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Stock</Form.Label>
                                    <Form.Control
                                        name="stock"
                                        type="number"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        required
                                    />
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

                        {/* Status + Image */}
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Choose Status</option>
                                        <option value="IN_STOCK">IN_STOCK</option>
                                        <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
                                        <option value="FEW_IN_STOCK">FEW_IN_STOCK</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Product Image (Leave empty to keep current)</Form.Label>
                                    <Form.Control
                                        type="file"
                                        name="productImage"
                                        accept="image/*"
                                        onChange={handleChange}
                                    />
                                    {editingProduct.productImage && (
                                        <small className="text-muted">
                                            Current image will be kept if no new image is selected.
                                        </small>
                                    )}
                                </Form.Group>
                            </Col>
                        </Row>

                        <Button variant="primary" type="submit" disabled={updateLoading}>
                            {updateLoading ? "Updating..." : "Update Product"}
                        </Button>
                    </Form>
                </Card>
            )}

            {/* Products Table */}
            <table className="table table-bordered text-center">
                <thead className="table-light">
                <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {products.length > 0 ? (
                    products.map((product) => (
                        <tr key={product.productId}>
                            <td>
                                {product.productImage ? (
                                    <img
                                        src={`data:image/jpeg;base64,${product.productImage}`}
                                        alt={product.name}
                                        style={{
                                            width: "60px",
                                            height: "60px",
                                            objectFit: "cover",
                                            borderRadius: "8px",
                                        }}
                                        onError={(e) => {
                                            e.target.src = "/placeholder.png";
                                        }}
                                    />
                                ) : (
                                    "No image"
                                )}
                            </td>
                            <td>{product.name}</td>
                            <td>R {product.price}</td>
                            <td>{product.category?.categoryName || 'No category'}</td>
                            <td>
                                <button
                                    className="btn btn-warning btn-sm me-2"
                                    onClick={() => handleUpdateClick(product)}
                                >
                                    Update
                                </button>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleDelete(product.productId)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="5">No products available</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
}
export default ProductsPage;