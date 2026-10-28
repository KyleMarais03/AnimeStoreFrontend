import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

function SignUp() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        address: "",
        phoneNumber: ""
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [userName, setUserName] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const storedName = localStorage.getItem("userName");
        if (storedName) setUserName(storedName);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const response = await fetch("http://localhost:8080/customer/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setSuccess("Account created successfully!");
                setFormData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    password: "",
                    address: "",
                    phoneNumber: ""
                });

                navigate("/signin");
            } else {
                let data;
                try { data = await response.json(); } catch { data = {}; }
                setError(data.message || "Registration failed");
            }
        } catch (err) {
            console.error(err);
            setError("Network error. Make sure backend is running on port 8080.");
        }
    };

    return (
        <section className="auth-page">
            <div className="auth-card">
                <div className="text-center mb-4">
                    <img className="auth-logo" src="/img/animestorelogo.png" alt="Anime Store" />
                    <p className="eyebrow justify-content-center mt-3 mb-2">Join the community</p>
                    <h2 className="fw-bold mb-2">Create your account</h2>
                    <p className="text-muted mb-0">A little more room for the things you love.</p>
                    {userName && <p className="text-muted mt-2 mb-0">Welcome, {userName}.</p>}
                </div>

                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                {success && <div className="alert alert-success" role="status">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label" htmlFor="signup-first-name">First name</label>
                            <input
                                id="signup-first-name"
                                type="text"
                                className="form-control"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                autoComplete="given-name"
                                required
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label" htmlFor="signup-last-name">Last name</label>
                            <input
                                id="signup-last-name"
                                type="text"
                                className="form-control"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                autoComplete="family-name"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label" htmlFor="signup-email">Email address</label>
                        <input
                            id="signup-email"
                            type="email"
                            className="form-control"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label" htmlFor="signup-password">Password</label>
                        <input
                            id="signup-password"
                            type="password"
                            className="form-control"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="new-password"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label" htmlFor="signup-address">Address</label>
                        <input
                            id="signup-address"
                            type="text"
                            className="form-control"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            autoComplete="street-address"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label" htmlFor="signup-phone">Phone number</label>
                        <input
                            id="signup-phone"
                            type="tel"
                            className="form-control"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            autoComplete="tel"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100 mt-2">Create account</button>

                    <p className="text-center mt-4 mb-0">
                        Already have an account? <Link to="/signin" className="fw-bold">Sign in</Link>
                    </p>
                </form>
            </div>
        </section>
    );
}

export default SignUp;

