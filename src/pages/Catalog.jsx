import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Catalog() {
    const { addToCart } = useCart();
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState("all");
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch("http://localhost:8080/products/available")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch products");
                return res.json();
            })
            .then((data) => setProducts(data))
            .catch((err) => console.error("Error fetching products:", err));
    }, []);

    const filteredProducts = products.filter((product) => {
        const matchesCategory =
            category === "all" ||
            (product.category?.categoryName &&
                product.category.categoryName.toLowerCase() === category.toLowerCase());
        const matchesSearch = search === "" || product.name.toLowerCase().includes(search.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    return (
        <section className="container catalog-page">
            <header className="catalog-heading">
                <span className="eyebrow">The Anime Store collection</span>
                <h1>Everyday pieces, fan-made spirit</h1>
                <p>Explore anime-inspired hoodies, tees, beanies and more. Find something that feels like you.</p>
            </header>

            <div className="catalog-toolbar" role="search">
                <label className="catalog-search">
                    <i className="bi bi-search" aria-hidden="true"></i>
                    <span className="visually-hidden">Search products</span>
                    <input
                        type="search"
                        className="form-control"
                        placeholder="Search the collection"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </label>
                <label>
                    <span className="visually-hidden">Filter by category</span>
                    <select
                        className="form-select"
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                    >
                        <option value="all">All categories</option>
                        <option value="hoodie">Hoodies</option>
                        <option value="tee">Tees</option>
                        <option value="beanie">Beanies</option>
                        <option value="cap">Caps</option>
                    </select>
                </label>
            </div>

            {filteredProducts.length > 0 ? (
                <div className="row g-4">
                    {filteredProducts.map((product) => (
                        <div className="col-sm-6 col-md-4 col-lg-3" key={product.productId}>
                            <article className="card product-card">
                                <Link to={`/product/${product.productId}`} className="product-image-link">
                                    <img
                                        src={product.productImage ? `data:image/jpeg;base64,${product.productImage}` : "/img/hero1.webp"}
                                        className="product-image"
                                        alt={product.name}
                                        onError={(event) => {
                                            event.currentTarget.onerror = null;
                                            event.currentTarget.src = "/img/hero1.webp";
                                        }}
                                    />
                                </Link>
                                <div className="card-body">
                                    <h2 className="card-title">{product.name}</h2>
                                    <p className="product-price">R {product.price.toFixed(2)}</p>
                                    <p className="product-stock">
                                        <i className="bi bi-check-circle-fill me-1" aria-hidden="true"></i>
                                        In stock: {product.stock}
                                    </p>
                                    <div className="d-flex w-100 gap-2">
                                        <Link to={`/product/${product.productId}`} className="btn btn-outline-dark flex-grow-1">
                                            View
                                        </Link>
                                        <button className="btn btn-primary flex-grow-1" onClick={() => addToCart(product)}>
                                            <i className="bi bi-bag-plus me-1" aria-hidden="true"></i> Add
                                        </button>
                                    </div>
                                </div>
                            </article>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <i className="bi bi-search fs-2 text-muted" aria-hidden="true"></i>
                    <h2 className="h5 mt-3">No pieces found</h2>
                    <p className="text-muted mb-0">
                        {search || category !== "all"
                            ? "Try a different search or category."
                            : "The collection is currently out of stock. Please check back soon."}
                    </p>
                </div>
            )}
        </section>
    );
}

export default Catalog;
