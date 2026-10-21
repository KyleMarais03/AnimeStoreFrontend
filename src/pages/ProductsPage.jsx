import { Search, SlidersHorizontal, Sparkles, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import ProductCard from "../components/ProductCard"
import Loading from "../components/Loading"
import { categoryApi, productApi } from "../services/api"
import { normalize, productCategoryName, safeArray } from "../utils/helpers"

const categoriesFromProducts = products => {
  const unique = new Map()
  safeArray(products).forEach(product => {
    const name = productCategoryName(product)
    if (!name) return
    const key = normalize(name)
    if (!unique.has(key)) {
      unique.set(key, {
        categoryId: product.category?.categoryId ?? key,
        name
      })
    }
  })
  return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name))
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const query = searchParams.get("q") || ""
  const category = searchParams.get("category") || "all"
  const stock = searchParams.get("stock") || "all"
  const [localSearch, setLocalSearch] = useState(query)

  useEffect(() => {
    setLocalSearch(query)
  }, [query])

  useEffect(() => {
    let active = true

    Promise.all([
      productApi.getAll().then(response => ({ products: safeArray(response.data), error: "" })).catch(err => ({ products: [], error: err.response?.data?.message || "Could not load products from the store API." })),
      categoryApi.getAll().then(response => ({ categories: safeArray(response.data) })).catch(() => ({ categories: [] }))
    ]).then(([productResult, categoryResult]) => {
      if (!active) return
      setProducts(productResult.products)
      setError(productResult.error)
      const apiCategories = categoryResult.categories
      setCategories(apiCategories.length ? apiCategories : categoriesFromProducts(productResult.products))
    }).finally(() => {
      if (active) setLoading(false)
    })

    return () => { active = false }
  }, [])

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (!value || value === "all") next.delete(key)
    else next.set(key, value)
    setSearchParams(next)
  }

  const filtered = useMemo(() => safeArray(products).filter(product => {
    const categoryName = productCategoryName(product)
    const text = normalize(`${product.name || ""} ${categoryName}`)
    const matchesSearch = !query || text.includes(normalize(query))
    const matchesCategory = category === "all" || normalize(categoryName) === normalize(category)
    const quantity = Number(product.stock ?? 0)
    const matchesStock = stock === "all" || (stock === "available" ? quantity > 0 : quantity === 0)
    return matchesSearch && matchesCategory && matchesStock
  }), [products, query, category, stock])

  return (
    <div className="content-page catalog-page">
      <section className="page-intro compact">
        <div><span className="eyebrow">CATALOG</span><h1>Find your next favourite.</h1><p>Browse the latest items in the store.</p></div>
        <div className="catalog-live"><Sparkles size={16} /> {filtered.length} products</div>
      </section>
      <section className="filter-panel">
        <div className="search-box">
          <Search size={18} />
          <input value={localSearch} onChange={event => setLocalSearch(event.target.value)} onKeyDown={event => { if (event.key === "Enter") setFilter("q", localSearch.trim()) }} placeholder="Search by product or category" />
          <button onClick={() => setFilter("q", localSearch.trim())} className="search-submit">Search</button>
          {query && <button onClick={() => { setLocalSearch(""); setFilter("q", "") }} className="clear-filter"><X size={15} /></button>}
        </div>
        <div className="filter-row">
          <div className="category-chips">
            <button className={category === "all" ? "chip active" : "chip"} onClick={() => setFilter("category", "all")}>All</button>
            {categories.map(item => (
                <button key={item.categoryId ?? item.name}
                        className={normalize(category) === normalize(item.name) ? "chip active" : "chip"}
                        onClick={() => setFilter("category", item.name)}>{item.name}</button>
            ))}
          </div>
          <label><span><SlidersHorizontal size={15} /> Stock</span><select value={stock} onChange={event => setFilter("stock", event.target.value)}><option value="all">All stock</option><option value="available">Available</option><option value="out">Out of stock</option></select></label>
        </div>
      </section>
      {error && <div className="form-alert error">{error}</div>}
      {loading ? <Loading label="Loading catalog..." /> : filtered.length ? <div className="product-grid catalog-grid">{filtered.map(product => <ProductCard key={product.productId ?? product.id ?? product.name} product={product} />)}</div> : <div className="empty-state"><Search size={38} /><h3>{error ? "Products could not be loaded" : "No products found"}</h3><p>{error ? "Check that the Spring Boot backend is running, then refresh this page." : "Try a different search or clear the filters."}</p><button className="outline-button" onClick={() => { setLocalSearch(""); setSearchParams({}) }}>Clear filters</button></div>}
    </div>
  )
}
