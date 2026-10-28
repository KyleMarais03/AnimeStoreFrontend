import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Home() {
    const { addToCart } = useCart();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:8080/products/available")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch products");
                return res.json();
            })
            .then((data) => {
                setProducts(data.slice(0, 12));
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching products:", err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="home-page">
            <section className="home-hero">
                <div className="container hero-grid">
                    <div className="hero-copy">
                        <span className="eyebrow">
                            <i className="bi bi-stars" aria-hidden="true"></i>
                            Anime inspired. Everyday ready.
                        </span>
                        <h1 className="hero-title">
                            A little anime.<br />
                            <span>A lot of style.</span>
                        </h1>
                        <p className="hero-description">
                            Find comfortable streetwear inspired by the stories and characters you love.
                            Made to fit naturally into your everyday rotation.
                        </p>
                        <div className="hero-actions">
                            <Link to="/catalog" className="btn btn-primary btn-lg">
                                Explore the collection <i className="bi bi-arrow-right ms-2" aria-hidden="true"></i>
                            </Link>
                            <Link to="/catalog" className="btn btn-outline-dark btn-lg">
                                Browse all pieces
                            </Link>
                        </div>
                    </div>

                    <div
                        className="hero-art"
                        style={{ backgroundImage: "url('/img/anime5.png')" }}
                        role="img"
                        aria-label="Anime-inspired clothing collection"
                    >
                        <div className="hero-note">
                            <div>
                                <strong>Made for your everyday</strong>
                                <small>Comfortable pieces with a fan-first point of view</small>
                            </div>
                            <span className="hero-note-icon" aria-hidden="true">
                                <i className="bi bi-heart"></i>
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="container section-space">
                <div className="section-heading">
                    <div>
                        <span className="eyebrow">A few fan favorites</span>
                        <h2>Find your next favorite</h2>
                    </div>
                    <Link to="/catalog" className="section-link">
                        View the catalog <i className="bi bi-arrow-right" aria-hidden="true"></i>
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-5" role="status" aria-live="polite">
                        <div className="spinner-border" aria-hidden="true"></div>
                        <p className="mt-3 mb-0 text-muted">Finding the latest pieces...</p>
                    </div>
                ) : products.length > 0 ? (
                    <div className="row g-4">
                        {products.map((product) => (
                            <div className="col-sm-6 col-lg-4" key={product.productId}>
                                <article className="card product-card">
                                    <Link to={`/product/${product.productId}`} className="product-image-link">
                                        <img
                                            src={product.productImage ? `data:image/jpeg;base64,${product.productImage}` : "/img/hero1.webp"}
                                            alt={product.name}
                                            className="product-image"
                                            onError={(event) => {
                                                event.currentTarget.onerror = null;
                                                event.currentTarget.src = "/img/hero1.webp";
                                            }}
                                        />
                                    </Link>
                                    <div className="card-body">
                                        <h3 className="card-title">{product.name}</h3>
                                        <p className="product-price">R {product.price.toFixed(2)}</p>
                                        <p className="product-stock">
                                            <i className="bi bi-check-circle-fill me-1" aria-hidden="true"></i>
                                            In stock: {product.stock}
                                        </p>
                                        <button className="btn btn-primary" onClick={() => addToCart(product)}>
                                            <i className="bi bi-bag-plus me-1" aria-hidden="true"></i> Add to bag
                                        </button>
                                    </div>
                                </article>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <i className="bi bi-box-seam fs-2 text-muted" aria-hidden="true"></i>
                        <h3 className="h5 mt-3">New pieces are on the way</h3>
                        <p className="text-muted mb-3">Check back soon, or explore the catalog for available items.</p>
                        <Link to="/catalog" className="btn btn-outline-primary">Browse catalog</Link>
                    </div>
                )}
            </section>

            <section className="trust-strip">
                <div className="container trust-grid">
                    <div className="trust-item">
                        <span className="trust-icon" aria-hidden="true"><i className="bi bi-stars"></i></span>
                        <div>
                            <strong>Fan-inspired details</strong>
                            <p>Pieces shaped by the worlds and characters you love.</p>
                        </div>
                    </div>
                    <div className="trust-item">
                        <span className="trust-icon" aria-hidden="true"><i className="bi bi-heart"></i></span>
                        <div>
                            <strong>Comfort comes first</strong>
                            <p>Easy-to-wear styles for everyday outfits.</p>
                        </div>
                    </div>
                    <div className="trust-item">
                        <span className="trust-icon" aria-hidden="true"><i className="bi bi-truck"></i></span>
                        <div>
                            <strong>South African store</strong>
                            <p>Shop local and have your favorites delivered to you.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
