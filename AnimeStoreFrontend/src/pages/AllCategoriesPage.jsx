import { ArrowRight, Boxes, Gamepad2, Gem, Home, Image, Shirt, Smartphone, Sparkles, Backpack, Footprints, NotebookPen, Crown, Palette } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { productApi } from "../services/api"
import { categoryCoverImage, safeArray } from "../utils/helpers"

const categoryIcons = { Clothing: Shirt, Accessories: Gem, Tech: Smartphone, Art: Palette, Collectibles: Crown, Cosplay: Sparkles, "Home & Lifestyle": Home, Bags: Backpack, Footwear: Footprints, Stationery: NotebookPen, Jewellery: Gem, Gaming: Gamepad2, "Room Decor": Image }

const fallback = [
  ["Clothing", "Everyday anime streetwear and layered essentials"], ["Accessories", "Pins, keychains, wallets and finishing details"], ["Tech", "Desk gear, phone pieces and gaming add-ons"], ["Art", "Posters, prints and visual wall pieces"], ["Collectibles", "Figures, stands and shelf-ready favourites"], ["Cosplay", "Character-inspired pieces for your next build"], ["Home & Lifestyle", "Room upgrades and daily-use pieces"], ["Bags", "Backpacks, totes and compact carry options"], ["Footwear", "Sneakers, slides and easy everyday pairs"], ["Stationery", "Notebooks, planning and desk supplies"], ["Jewellery", "Rings, charms and small statement pieces"], ["Gaming", "Controller and desk setup accessories"], ["Room Decor", "Wall art, displays and room accents"]
]

export default function AllCategoriesPage() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    let active = true
    productApi.getAll()
      .then(response => {
        if (active) setProducts(safeArray(response.data))
      })
      .catch(() => {})
    return () => { active = false }
  }, [])

  return (
    <div className="content-page">
      <section className="page-intro">
        <span className="eyebrow">CATEGORIES</span>
        <h1>Shop by category.</h1>
        <p>Find clothing, collectibles, art, accessories and more.</p>
      </section>
      <div className="category-grid">
        {fallback.map(([name, description], index) => {
          const Icon = categoryIcons[name] || Boxes
          const image = categoryCoverImage(name, products)
          return (
            <Link key={name} to={`/catalog?category=${encodeURIComponent(name)}`} className="category-card-large">
              <div className="category-card-cover">
                <img src={image} alt={`${name} product`} loading="lazy" />
              </div>
              <div className="category-index">{String(index + 1).padStart(2, "0")}</div>
              <div className="category-icon-box"><Icon size={21} /></div>
              <div className="category-card-copy">
                <span className="eyebrow tiny">CATEGORY</span>
                <h3>{name}</h3>
                <p>{description}</p>
              </div>
              <ArrowRight size={18} />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
