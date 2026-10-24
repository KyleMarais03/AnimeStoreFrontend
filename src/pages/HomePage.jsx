import { ArrowRight, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { productApi } from "../services/api"
import ProductCard from "../components/ProductCard"
import Loading from "../components/Loading"
import { categoryCoverImage, safeArray } from "../utils/helpers"

const categoryMeta = [
  ["Clothing", "T-shirts, hoodies and everyday wear"],
  ["Collectibles", "Figures and favourites for your shelf"],
  ["Art", "Posters and prints for your space"],
  ["Accessories",  "Small extras for every fan"]


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
        <div className="category-strip">
          {categoryMeta.map(([name, description], index) => (
            <Link className="category-tile" key={name} to={`/catalog?category=${encodeURIComponent(name)}`}>
              <span className="tile-number">0{index + 1}</span>
              <div className="category-tile-cover"><img src={categoryCoverImage(name, products)} alt={`${name} product`} loading="lazy" /></div>
              <div className="category-tile-copy"><h3>{name}</h3><p>{description}</p></div>
              <ChevronRight size={19} />
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
