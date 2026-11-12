import { Edit3, Images, Plus, Trash2, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { categoryApi, productApi } from "../../services/api"
import { productCatalog } from "../../data/productCatalog.js"
import { money, normalize, safeArray, resolveImage } from "../../utils/helpers"
import Loading from "../../components/Loading"

const blank = { name: "", price: "", stock: "10", categoryId: "", image: null, generatedImagePath: "" }
const categoryKey = value => normalize(value).replace(/[^a-z0-9]+/g, " ").trim()

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(blank)
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(null)
  const [importResult, setImportResult] = useState("")
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    setError("")
    try {
      const [productResponse, categoryResponse] = await Promise.all([productApi.getAll(), categoryApi.getAll()])
      setProducts(safeArray(productResponse.data))
      setCategories(safeArray(categoryResponse.data))
    } catch (err) {
      setError(err.response?.data?.message || "Could not load products. Check that the Spring Boot backend is running.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const sortedImageOptions = useMemo(() => [...productCatalog].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)), [])

  const openCreate = () => {
    setEditing(null)
    setForm(blank)
    setShowForm(true)
    setError("")
  }

  const openEdit = product => {
    setEditing(product)
    setForm({ name: product.name || "", price: product.price, stock: product.stock, categoryId: product.category?.categoryId || "", image: null, generatedImagePath: "" })
    setShowForm(true)
    setError("")
  }

  const imageFileForPath = async imagePath => {
    const response = await fetch(imagePath)
    if (!response.ok) throw new Error(`Could not read image ${imagePath}.`)
    const blob = await response.blob()
    const filename = imagePath.split("/").pop() || "animestore-product.webp"
    return new File([blob], filename, { type: blob.type || "image/webp" })
  }

  const submit = async event => {
    event.preventDefault()
    setBusy(true)
    setError("")
    try {
      if (editing) {
        await productApi.update(editing.productId, {
          productId: editing.productId,
          name: form.name,
          price: Number(form.price),
          stock: Number(form.stock),
          category: { categoryId: Number(form.categoryId) }
        })
      } else {
        const data = new FormData()
        data.append("name", form.name.trim())
        data.append("price", String(Number(form.price)))
        data.append("stock", String(Number(form.stock)))
        data.append("category_Id", String(Number(form.categoryId)))
        let imageFile = form.image
        if (!imageFile && form.generatedImagePath) imageFile = await imageFileForPath(form.generatedImagePath)
        if (imageFile) data.append("productImage", imageFile)
        await productApi.create(data)
      }
      setShowForm(false)
      setForm(blank)
      await load()
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Could not save the product.")
    } finally {
      setBusy(false)
    }
  }

  const importGeneratedCatalogue = async () => {
    const confirmed = window.confirm(
      `Import the ${productCatalog.length} generated image products into the store?\n\n` +
      "Missing categories will be created automatically. Existing products with the same names will be skipped. " +
      "New products receive example prices and 10 units of stock; you can edit those later in Admin > Products. " +
      "This will write product records to your connected backend database."
    )
    if (!confirmed) return

    setImporting(true)
    setError("")
    setImportResult("")
    setImportProgress({ current: 0, total: productCatalog.length, imported: 0, skipped: 0, failed: 0, currentName: "Preparing categories..." })

    let imported = 0
    let skipped = 0
    const failures = []

    try {
      let [productResponse, categoryResponse] = await Promise.all([productApi.getAll(), categoryApi.getAll()])
      const existingNames = new Set(safeArray(productResponse.data).map(product => categoryKey(product.name)))
      let currentCategories = safeArray(categoryResponse.data)
      const neededCategories = [...new Set(productCatalog.map(item => item.category))]

      for (const categoryName of neededCategories) {
        const found = currentCategories.some(category => categoryKey(category.name) === categoryKey(categoryName))
        if (found) continue
        try {
          await categoryApi.create({ name: categoryName })
        } catch (createError) {
          // Refresh before treating this as a hard failure; another attempt may have already created it.
          const refreshed = await categoryApi.getAll()
          currentCategories = safeArray(refreshed.data)
          if (!currentCategories.some(category => categoryKey(category.name) === categoryKey(categoryName))) {
            throw new Error(`Could not create the category “${categoryName}”: ${createError.response?.data?.message || createError.message}`)
          }
        }
        const refreshed = await categoryApi.getAll()
        currentCategories = safeArray(refreshed.data)
      }

      const categoriesByName = new Map(currentCategories.map(category => [categoryKey(category.name), category]))

      for (let index = 0; index < productCatalog.length; index += 1) {
        const item = productCatalog[index]
        setImportProgress({ current: index, total: productCatalog.length, imported, skipped, failed: failures.length, currentName: item.name })
        const key = categoryKey(item.name)
        if (existingNames.has(key)) {
          skipped += 1
          setImportProgress({ current: index + 1, total: productCatalog.length, imported, skipped, failed: failures.length, currentName: item.name })
          continue
        }

        const category = categoriesByName.get(categoryKey(item.category))
        if (!category?.categoryId) {
          failures.push(`${item.name}: category “${item.category}” is missing from the API`)
          setImportProgress({ current: index + 1, total: productCatalog.length, imported, skipped, failed: failures.length, currentName: item.name })
          continue
        }

        try {
          const imageFile = await imageFileForPath(item.imagePath)
          const data = new FormData()
          data.append("name", item.name)
          data.append("price", String(item.price))
          data.append("stock", String(item.stock))
          data.append("category_Id", String(category.categoryId))
          data.append("productImage", imageFile)
          await productApi.create(data)
          imported += 1
          existingNames.add(key)
        } catch (createError) {
          failures.push(`${item.name}: ${createError.response?.data?.message || createError.message || "API rejected the product"}`)
        }

        setImportProgress({ current: index + 1, total: productCatalog.length, imported, skipped, failed: failures.length, currentName: item.name })
      }

      const summary = `Import finished: ${imported} products created, ${skipped} existing products skipped, ${failures.length} failed.`
      setImportResult(failures.length ? `${summary} First failures: ${failures.slice(0, 4).join(" | ")}` : summary)
      await load()
    } catch (err) {
      setError(err.response?.data?.message || err.message || "The image catalogue import could not be completed.")
    } finally {
      setImporting(false)
    }
  }

  const remove = async product => {
    if (!window.confirm(`Remove ${product.name}?`)) return
    try {
      await productApi.delete(product.productId)
      await load()
    } catch (err) {
      setError(err.response?.data?.message || "Could not remove product.")
    }
  }

  if (loading) return <Loading label="Loading products..." />

  const progressPercent = importProgress ? Math.round((importProgress.current / importProgress.total) * 100) : 0

  return (
    <div>
      <div className="admin-page-head">
        <div><span className="eyebrow">PRODUCTS</span><h1>Products</h1><p>Add, edit or remove products.</p></div>
        <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap", alignItems: "center" }}>
          <button className="outline-button" onClick={importGeneratedCatalogue} disabled={importing}>
            <Images size={17} /> {importing ? "Importing images..." : `Import ${productCatalog.length} image products`}
          </button>
          <button className="primary-button" onClick={openCreate} disabled={importing}><Plus size={17} /> Add product</button>
        </div>
      </div>

      <p className="muted" style={{ marginTop: "-0.5rem", marginBottom: "1rem" }}>
        The image import uses the files already stored in <code>public/products</code>, creates any missing categories, and uploads each selected image with its product record.
      </p>

      {error && <div className="form-alert error">{error}</div>}
      {importResult && <div className={importResult.includes("failed.") && !importResult.endsWith("0 failed.") ? "form-alert error" : "form-alert success"}>{importResult}</div>}
      {importing && importProgress && (
        <div className="admin-panel" style={{ padding: "1rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginBottom: "0.5rem" }}>
            <b>Importing image catalogue</b><span>{importProgress.current}/{importProgress.total} ({progressPercent}%)</span>
          </div>
          <div style={{ height: 8, background: "var(--border, #243244)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: `${progressPercent}%`, height: "100%", background: "var(--accent, #45cbd8)", transition: "width 180ms ease" }} />
          </div>
          <p className="muted" style={{ marginTop: "0.6rem", marginBottom: 0 }}>{importProgress.currentName || "Preparing..."} · {importProgress.imported} created · {importProgress.skipped} skipped · {importProgress.failed} failed</p>
        </div>
      )}

      {showForm && (
        <div className="drawer-panel">
          <div className="drawer-head">
            <div><span className="eyebrow tiny">{editing ? "EDIT PRODUCT" : "NEW PRODUCT"}</span><h3>{editing ? editing.name : "Add to catalogue"}</h3></div>
            <button className="icon-button" onClick={() => setShowForm(false)}><X size={18} /></button>
          </div>
          <form className="form-grid" onSubmit={submit}>
            <label>Name<input value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} required /></label>
            <label>Price (R)<input type="number" step="0.01" min="0" value={form.price} onChange={event => setForm({ ...form, price: event.target.value })} required /></label>
            <label>Stock<input type="number" min="0" value={form.stock} onChange={event => setForm({ ...form, stock: event.target.value })} required /></label>
            <label>Category<select value={form.categoryId} onChange={event => setForm({ ...form, categoryId: event.target.value })} required><option value="">Select category</option>{categories.map(category => <option key={category.categoryId} value={category.categoryId}>{category.name}</option>)}</select></label>
            {!editing && (
              <>
                <label className="full"><span>Choose an existing generated image</span>
                  <select value={form.generatedImagePath} onChange={event => setForm({ ...form, generatedImagePath: event.target.value, image: null })}>
                    <option value="">Select an image (optional)</option>
                    {sortedImageOptions.map(item => <option key={item.imagePath} value={item.imagePath}>{item.category} — {item.name}</option>)}
                  </select>
                  <small className="muted">All 90 images in public/products are available here. Selecting one uploads it to the backend with the product.</small>
                </label>
                {form.generatedImagePath && <div className="full" style={{ display: "flex", alignItems: "center", gap: "1rem" }}><img src={form.generatedImagePath} alt="Selected product preview" style={{ width: 120, height: 120, objectFit: "contain", background: "#fff", borderRadius: 10, padding: 6 }} /><span className="muted">Selected generated image preview</span></div>}
                <label className="full"><span>Or upload another product image</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => setForm({ ...form, image: event.target.files?.[0] || null, generatedImagePath: "" })} /><small className="muted">A file selected here takes priority over the generated image selector.</small></label>
              </>
            )}
            {editing && <p className="muted full">Product images for existing records are controlled by the backend. To assign one of the generated images to a new product, choose it when creating the product.</p>}
            <div className="drawer-actions"><button type="button" className="outline-button" onClick={() => setShowForm(false)}>Cancel</button><button className="primary-button" disabled={busy || importing}>{busy ? "Saving..." : editing ? "Save changes" : "Create product"}</button></div>
          </form>
        </div>
      )}

      <section className="admin-panel"><div className="table-wrap"><table><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr></thead><tbody>
        {products.map(product => <tr key={product.productId}><td><div className="table-product"><img src={resolveImage(product)} alt={product.name} /><span><b>{product.name}</b><small>#{product.productId}</small></span></div></td><td>{product.category?.name || "—"}</td><td>{money(product.price)}</td><td><span className={Number(product.stock) === 0 ? "stock-warning" : Number(product.stock) <= 10 ? "stock-watch" : "stock-good"}>{product.stock}</span></td><td><div className="row-actions"><button className="icon-button" onClick={() => openEdit(product)} aria-label={`Edit ${product.name}`}><Edit3 size={16} /></button><button className="icon-button danger-icon" onClick={() => remove(product)} aria-label={`Remove ${product.name}`}><Trash2 size={16} /></button></div></td></tr>)}
      </tbody></table></div></section>
    </div>
  )
}
