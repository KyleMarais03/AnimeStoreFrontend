import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";

function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // 🔹 Auto-redirect if already signed in
    useEffect(() => {
        const token = localStorage.getItem("userToken");
        const role = localStorage.getItem("userRole");

        if (token && role === "ADMIN") navigate("/admin/dashboard");
        else if (token && role === "CUSTOMER") navigate("/");
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const isAdmin = email.toLowerCase().endsWith("@animestore.co.za");
            const endpoint = isAdmin ? "/admin/signin" : "/customer/signin";

            const response = await api.post(endpoint, {
                email: email.trim(),
                password: password.trim()
            });

            if (response.data && response.data.token) {
                localStorage.setItem("userToken", response.data.token);
                localStorage.setItem("userId", response.data.userId || response.data.id || "");
                localStorage.setItem("userEmail", response.data.email || email);
                localStorage.setItem("userRole", response.data.role || (isAdmin ? "ADMIN" : "CUSTOMER"));

                if (isAdmin) {
                    localStorage.setItem("userName", response.data.name || response.data.username || email.split("@")[0]);
                    localStorage.setItem("firstName", response.data.name || response.data.username || "Admin");
                    localStorage.setItem("lastName", "");
                    navigate("/admin/dashboard"); // Admin goes to dashboard
                } else {
                    localStorage.setItem("firstName", response.data.firstName || "");
                    localStorage.setItem("lastName", response.data.lastName || "");
                    localStorage.setItem("userName", `${response.data.firstName || ""} ${response.data.lastName || ""}`.trim() || email.split("@")[0]);
                    navigate("/"); // Customer goes to Home page
                }
            } else {
                setError("Invalid response from server. Please try again.");
            }
        } catch (err) {
            console.error("Sign in error:", err);
            if (err.response) {
                if (err.response.status === 401) setError("Invalid email or password");
                else if (err.response.status === 403) setError("Access denied");
                else setError(err.response.data?.message || "Sign in failed");
            } else if (err.request) {
                setError("Cannot connect to server. Please check your connection.");
            } else {
                setError("An unexpected error occurred. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="auth-page">
            <div className="auth-card">
                <div className="text-center mb-4">
                    <img className="auth-logo" src="/img/animestorelogo.png" alt="Anime Store" />
                    <p className="eyebrow justify-content-center mt-3 mb-2">Welcome back</p>
                    <h2 className="fw-bold mb-2">Sign in to Anime Store</h2>
                    <p className="text-muted mb-0">Pick up where your fandom left off.</p>
                </div>

                {error && <div className="alert alert-danger" role="alert">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label" htmlFor="signin-email">Email address</label>
                        <input
                            id="signin-email"
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                            placeholder="you@example.com"
                            autoComplete="email"
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label" htmlFor="signin-password">Password</label>
                        <input
                            id="signin-password"
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100 mt-3" disabled={loading}>
                        {loading ? "Signing in..." : "Sign in"}
                    </button>

                    <p className="text-center mt-4 mb-0">
                        New to Anime Store? <Link to="/signup" className="fw-bold">Create an account</Link>
                    </p>
                </form>
            </div>
        </section>
    );
}

export default SignIn;
