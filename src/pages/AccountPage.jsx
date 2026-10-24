import { Save, UserRound } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"

export default function AccountPage() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ name: user.name, email: user.email, password: "" })
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  useEffect(() => setForm({ name: user.name, email: user.email, password: "" }), [user.name, user.email])
  const  submit = async event => { event.preventDefault(); setBusy(true); setError(""); setMessage(""); try { await updateUser(form); setMessage("Account details updated.") } catch (err) { setError(err.response?.data?.message || err.message) } finally { setBusy(false) } }
  return <div className="content-page narrow"><section className="page-intro compact"><span className="eyebrow">ACCOUNT</span><h1>Your profile.</h1><p>Update your account details.</p></section><form className="panel-card form-card" onSubmit={submit}><div className="profile-head"><span className="profile-avatar large"><UserRound size={22} /></span><div><b>{user.role === "ADMIN" ? "Administrator" : "Customer"}</b><small>{user.email}</small></div></div><label>Username<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></label><label>Email<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></label><label>New password<input type="password" minLength={6} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Leave empty to keep the current password" /></label>{error && <div className="form-alert error">{error}</div>}{message && <div className="form-alert success">{message}</div>}<button className="primary-button" disabled={busy}><Save size={17} />{busy ? "Saving..." : "Save changes"}</button></form></div>
}
