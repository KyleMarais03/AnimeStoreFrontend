import { LockKeyhole, Mail } from "lucide-react"
import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function SignInPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const submit = async event => {
    event.preventDefault()
    setError("")
    setBusy(true)
    try {
      const nextUser = await signIn(form)
      const from = location.state?.from?.pathname
      navigate(nextUser.role === "ADMIN" ? "/admin/dashboard" : (from || "/dashboard"), { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-shell">
      <section className="auth-visual">
        <img src="/products/brand-icon.png" alt="AnimeStore" className="auth-brand-icon" />
        <span className="eyebrow">ANIMESTORE</span>
        <h1>Welcome<br /><em>back.</em></h1>
        <p>Sign in to your account.</p>
      </section>
      <form className="auth-panel" onSubmit={submit}>
        <h2>Sign in</h2>
        <p className="muted">Use your AnimeStore account.</p>
        <label>Email<div className="input-wrap"><Mail size={17} /><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email address" required /></div></label>
        <label>Password<div className="input-wrap"><LockKeyhole size={17} /><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Password" required /></div></label>
        {error && <div className="form-alert error">{error}</div>}
        <button className="primary-button wide" disabled={busy}>{busy ? "Signing in..." : "Sign in"}</button>
        <p className="auth-switch">Don't have an account? <Link to="/signup">Create account</Link></p>
      </form>
    </div>
  )
}
