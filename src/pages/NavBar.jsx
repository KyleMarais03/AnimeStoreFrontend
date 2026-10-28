import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
    const [userName, setUserName] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedName = localStorage.getItem("userName");
        if (storedName) setUserName(storedName);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("userToken");
        localStorage.removeItem("userName");
        setUserName(null);
        navigate("/signin");
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light px-3">
            <Link className="navbar-brand" to="/">Anime Store</Link>

            <div className="ms-auto">
                {userName ? (
                    <>
                        <span className="me-3 fw-bold">Hello, {userName}</span>
                        <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link className="btn btn-outline-primary me-2" to="/signin">Sign In</Link>
                        <Link className="btn btn-primary" to="/signup">Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;

