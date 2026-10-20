import { LockKeyhole, Mail, UserRound } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function SignUpPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" })
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const submit = async event => {
    event.preventDefault(); setError("")
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return }
    setBusy(true)
    try { await signUp(form); navigate("/dashboard", { replace: true }) } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  return (
    <div className="auth-shell">
      <section className="auth-visual warm"><span className="eyebrow">JOIN ANIMESTORE</span><h1>Create your<br /><em>account.</em></h1><p>Shop your favourites, save your cart and keep track of your orders.</p></section>
      <form className="auth-panel" onSubmit={submit}>
        <h2>Create account</h2><p className="muted">It only takes a moment.</p>
        <label>Name<div className="input-wrap"><UserRound size={17} /><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" required /></div></label>
        <label>Email<div className="input-wrap"><Mail size={17} /><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email address" required /></div></label>
        <label>Password<div className="input-wrap"><LockKeyhole size={17} /><input type="password" minLength={8} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" required /></div></label>
        <label>Confirm password<div className="input-wrap"><LockKeyhole size={17} /><input type="password" minLength={8} value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} placeholder="Repeat password" required /></div></label>
        {error && <div className="form-alert error">{error}</div>}
        <button className="primary-button wide" disabled={busy}>{busy ? "Creating account..." : "Create account"}</button>
        <p className="auth-switch">Already registered? <Link to="/signin">Sign in</Link></p>
      </form>
    </div>
  )
}
