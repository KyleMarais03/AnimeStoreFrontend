import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Card, Spinner } from "react-bootstrap";

function InventoryPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios
            .get("http://localhost:8080/products") // Use PRODUCTS endpoint, not inventory
            .then((response) => {
                setProducts(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching products:", error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <Spinner animation="border" className="mt-3" />;
    }

    return (
        <Card className="p-3">
            <h4 className="mb-3">Inventory</h4>
            <Table striped bordered hover responsive>
                <thead className="table-light">
                <tr>
                    <th>Product</th>
                    <th>Stock</th>
                    <th>Status</th>
                </tr>
                </thead>
                <tbody>
                {products.length > 0 ? (
                    products.map((product) => (
                        <tr key={product.productId}>
                            <td>{product.name}</td>
                            <td>{product.stock}</td>
                            <td>
                                {product.stock <= 0 ? "OUT_OF_STOCK" :
                                    product.stock <= 10 ? "FEW_IN_STOCK" : "IN_STOCK"}
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="3" className="text-center">
                            No inventory data available
                        </td>
                    </tr>
                )}
                </tbody>
            </Table>
        </Card>
    );
}

export default InventoryPage;