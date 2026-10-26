import { ArrowRight, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { productApi } from "../services/api"
import ProductCard from "../components/ProductCard"
import Loading from "../components/Loading"
import { safeArray } from "../utils/helpers"
import { categoryCoverImage } from "../utils/categoryCovers"

const categoryMeta = [
  ["Clothing", "Everyday anime streetwear and layered essentials"],
  ["Accessories", "Pins, keychains, wallets and finishing details"],
  ["Tech", "Desk gear, phone pieces and gaming add-ons"],
  ["Art", "Posters, prints and visual wall pieces"],
  ["Collectibles", "Figures, stands and shelf-ready favourites"]
]

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadProducts = async () => {
      try {
        const response = await productApi.getAvailable()
        if (active) setProducts(safeArray(response.data))
      } catch {
        try {
          const response = await productApi.getAll()
          if (active) setProducts(safeArray(response.data))
        } catch {
          if (active) setProducts([])
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadProducts()
    return () => { active = false }
  }, [])

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">ANIME &amp; COLLECTIBLES</span>
          <h1>Find something <span>you'll love.</span></h1>
          <p>Clothing, collectibles and accessories for every fan.</p>
          <div className="hero-actions">
            <Link to="/catalog" className="primary-button">Shop now <ArrowRight size={18} /></Link>
            <Link to="/all-categories" className="ghost-link">Browse categories <ChevronRight size={16} /></Link>
          </div>
        </div>
        <div className="hero-product-showcase" aria-label="Featured AnimeStore products">
          <div className="hero-product hero-product-main"><img src="/products/gojo-blue-tee.png" alt="Gojo Blue Graphic Tee" /></div>
          <div className="hero-product hero-product-top"><img src="/products/dbz-hoodie.png" alt="Dragon Ball Z Hoodie" /></div>
          <div className="hero-product hero-product-bottom"><img src="/products/sukuna-graphic-tee.png" alt="Sukuna Graphic Tee" /></div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-head">
          <div><span className="eyebrow">SHOP</span><h2>Popular categories</h2></div>
          <Link to="/all-categories" className="text-link">View all <ArrowRight size={16} /></Link>
        </div>
        <div className="category-grid">
          {categoryMeta.map(([name, description]) => (
            <Link className="category-card-large" key={name} to={`/catalog?category=${encodeURIComponent(name)}`}>
              <div className="category-card-cover">
                <img
                  src={categoryCoverImage(name, products)}
                  alt={name}
                  loading="lazy"
                  decoding="async"
                  onError={event => {
                    if (event.currentTarget.dataset.fallback === "true") return
                    event.currentTarget.dataset.fallback = "true"
                    event.currentTarget.src = "/products/brand-logo.png"
                  }}
                />
              </div>
              <div className="category-card-copy">
                <h3>{name}</h3>
                <p>{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-block soft">
        <div className="section-head">
          <div><span className="eyebrow">FEATURED</span><h2>Popular picks</h2></div>
          <Link to="/catalog" className="text-link">Shop all <ArrowRight size={16} /></Link>
        </div>
        {loading ? <Loading label="Loading products..." /> : <div className="product-grid">{products.slice(0, 3).map(product => <ProductCard key={product.productId ?? product.id ?? product.name} product={product} />)}</div>}
      </section>
    </div>
  )
}
