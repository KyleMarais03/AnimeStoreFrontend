import { Plus, Tags } from "lucide-react"
import { useEffect, useState } from "react"
import { categoryApi } from "../../services/api"
import Loading from "../../components/Loading"
import { safeArray } from "../../utils/helpers"

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]); const [name, setName] = useState(""); const [busy, setBusy] = useState(false); const [error, setError] = useState("")
  const load = () => { categoryApi.getAll().then(r => setCategories(safeArray(r.data))).catch(err => setError(err.message)) }
  useEffect(() => load(), [])
  const create = async event => { event.preventDefault(); if (!name.trim()) return; setBusy(true); setError(""); try { await categoryApi.create({ name: name.trim() }); setName(""); load() } catch (err) { setError(err.response?.data?.message || "Could not create category.") } finally { setBusy(false) } }
  return <div><div className="admin-page-head"><div><span className="eyebrow">CATEGORIES</span><h1>Categories</h1><p>Add or edit product categories.</p></div><div className="catalog-live"><Tags size={16} /> {categories.length} categories</div></div>{error && <div className="form-alert error">{error}</div>}<section className="admin-grid-two"><form className="admin-panel form-card" onSubmit={create}><div className="panel-title"><Plus size={18} /><div><h3>Add category</h3><p>The current backend exposes category create and list operations.</p></div></div><label>Category name<input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Room Decor" required /></label><button className="primary-button" disabled={busy}>{busy ? "Adding..." : "Add category"}</button></form><section className="admin-panel"><div className="panel-head"><div><span className="eyebrow tiny">CATEGORIES</span><h3>Categories in the API</h3></div></div><div className="chip-list">{categories.map(category => <span key={category.categoryId}>{category.name}</span>)}</div></section></section></div>
}
