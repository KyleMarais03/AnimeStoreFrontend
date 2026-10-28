import { useParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";

function ProductDetail() {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    // ✅ Fetch from /products/{id}
    useEffect(() => {
        fetch(`http://localhost:8080/products/${id}`)
            .then((res) => {
                if (!res.ok) throw new Error("Product not found");
                return res.json();
            })
            .then((data) => setProduct(data))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return <div className="container py-5 text-center">Loading product...</div>;
    }

    if (!product) {
        return (
            <div className="container py-5 text-center">
                <h2>Product not found</h2>
                <Link to="/catalog" className="btn btn-primary mt-3">
                    Back to Catalog
                </Link>
            </div>
        );
    }

    return (
        <section className="container section-space product-detail-page">
            <Link to="/catalog" className="section-link mb-4 d-inline-flex">
                <i className="bi bi-arrow-left" aria-hidden="true"></i> Back to collection
            </Link>
            <div className="row g-4 g-lg-5 align-items-center">
                <div className="col-md-6">
                    <div className="product-detail-visual">
                        <img
                            src={product.productImage ? `data:image/jpeg;base64,${product.productImage}` : "/img/hero1.webp"}
                            alt={product.name}
                            className="product-detail-image"
                            onError={(event) => {
                                event.currentTarget.onerror = null;
                                event.currentTarget.src = "/img/hero1.webp";
                            }}
                        />
                    </div>
                </div>
                <div className="col-md-6 product-detail-copy">
                    <span className="eyebrow">{product.category?.categoryName || "Anime-inspired collection"}</span>
                    <h1>{product.name}</h1>
                    <p className="product-detail-price">R {product.price.toFixed(2)}</p>
                    <p className="product-detail-description">
                        {product.desc || "A fan-inspired piece designed to fit into your everyday rotation."}
                    </p>
                    {product.stock > 0 ? (
                        <p className="product-stock">
                            <i className="bi bi-check-circle-fill me-1" aria-hidden="true"></i>
                            In stock and ready to add to your collection
                        </p>
                    ) : (
                        <p className="text-muted">Currently out of stock</p>
                    )}

                    <button
                        className="btn btn-primary btn-lg mt-2"
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                    >
                        <i className="bi bi-bag-plus me-1" aria-hidden="true"></i> Add to bag
                    </button>
                </div>
            </div>
        </section>
    );
}

export default ProductDetail;
