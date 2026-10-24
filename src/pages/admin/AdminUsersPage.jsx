import { Search, ShieldCheck, Trash2, UserCog } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { userApi } from "../../services/api"
import Loading from "../../components/Loading"
import { safeArray } from "../../utils/helpers"

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]); const [query, setQuery] = useState(""); const [loading, setLoading] = useState(true); const [error, setError] = useState("")
  const load = () => { setLoading(true); userApi.getAll().then(r => setUsers(safeArray(r.data))).catch(err => setError(err.response?.data?.message || "Could not load users.")).finally(() => setLoading(false)) }
  useEffect(() => { if (!query.trim()) { load(); return } if (query.trim().length < 2) return; userApi.searchPattern(query.trim()).then(r => setUsers(safeArray(r.data))).catch(err => setError(err.response?.data?.message || "Search failed.")) }, [query])
  useEffect(() => { load() }, [])
  const filtered = useMemo(() => users.filter(user => `${user.userName} ${user.email} ${user.role}`.toLowerCase().includes(query.toLowerCase())), [users, query])
  const updateRole = async (user, role) => { try { await userApi.update(user.userId, { ...user, role, password: "" }); load() } catch (err) { setError(err.response?.data?.message || "Could not update role.") } }
  const remove = async user => { if (!window.confirm(`Delete ${user.userName}?`)) return; try { await userApi.delete(user.userId); load() } catch (err) { setError(err.response?.data?.message || "Could not delete user.") } }
  if (loading) return <Loading label="Loading customers..." />
  return <div><div className="admin-page-head"><div><span className="eyebrow">CUSTOMERS</span><h1>Customers</h1><p>View customer accounts.</p></div><div className="catalog-live"><UserCog size={16} /> {users.length} records</div></div>{error && <div className="form-alert error">{error}</div>}<div className="inventory-toolbar"><div className="search-box compact"><Search size={17} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search username, email or role" /></div></div><section className="admin-panel"><div className="table-wrap"><table><thead><tr><th>User</th><th>Email</th><th>Role</th><th>User ID</th><th></th></tr></thead><tbody>{filtered.map(user => <tr key={user.userId}><td><div className="table-user"><span className="profile-avatar">{String(user.userName || "U").slice(0,1).toUpperCase()}</span><b>{user.userName}</b></div></td><td>{user.email}</td><td><select className="status-select" value={user.role || "USER"} onChange={e => updateRole(user, e.target.value)}><option value="USER">USER</option><option value="ADMIN">ADMIN</option></select></td><td><span className="muted">{user.userId}</span></td><td><button className="icon-button danger-icon" onClick={() => remove(user)}><Trash2 size={16} /></button></td></tr>)}</tbody></table></div></section><div className="admin-note"><ShieldCheck size={16} /> New registrations are always created as USER. Promote a trusted backend user to ADMIN here for a role-based admin login.</div></div>
}
