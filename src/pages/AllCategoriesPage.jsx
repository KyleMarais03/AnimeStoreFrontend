import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { productApi } from "../services/api"
import { safeArray } from "../utils/helpers"
import { categoryCoverImage } from "../utils/categoryCovers"

const categories = [
  ["Clothing", "Everyday anime streetwear and layered essentials"],
  ["Accessories", "Pins, keychains, wallets and finishing details"],
  ["Tech", "Desk gear, phone pieces and gaming add-ons"],
  ["Art", "Posters, prints and visual wall pieces"],
  ["Collectibles", "Figures, stands and shelf-ready favourites"],
  ["Cosplay", "Character-inspired pieces for your next build"],
  ["Home & Lifestyle", "Room upgrades and daily-use pieces"],
  ["Bags", "Backpacks, totes and compact carry options"],
  ["Footwear", "Sneakers, slides and easy everyday pairs"],
  ["Stationery", "Notebooks, planning and desk supplies"],
  ["Jewellery", "Rings, charms and small statement pieces"],
  ["Gaming", "Controller and desk setup accessories"],
  ["Room Decor", "Wall art, displays and room accents"]
]

export default function AllCategoriesPage() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    let active = true
    productApi.getAll()
      .then(response => {
        if (active) setProducts(safeArray(response.data))
      })
      .catch(() => {
        if (active) setProducts([])
      })

    return () => { active = false }
  }, [])

  return (
    <div className="content-page category-page">
      <section className="page-intro">
        <div>
          <span className="eyebrow">CATEGORIES</span>
          <h1>Shop by category.</h1>
          <p>Find clothing, collectibles, art, accessories and more.</p>
        </div>
      </section>

      <div className="category-grid">
        {categories.map(([name, description]) => (
          <Link
            key={name}
            to={`/catalog?category=${encodeURIComponent(name)}`}
            className="category-card-large"
          >
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
    </div>
  )
}
