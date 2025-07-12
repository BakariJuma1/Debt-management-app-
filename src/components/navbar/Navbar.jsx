import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthProvider";
import "./navbar.css"; 

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/" className="nav-brand">Paysync</Link>
        </div>

        {isMobile && (
          <button
            className={`hamburger ${isOpen ? "open" : ""}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        )}

        <ul className={`navbar-links ${isOpen ? "active" : ""}`}>
          <li><Link to="/" className="nav-link" onClick={() => isMobile && setIsOpen(false)}>Home</Link></li>

          {user ? (
            <>
              <li><Link to="/dashboard" className="nav-link" onClick={() => isMobile && setIsOpen(false)}>Dashboard</Link></li>
              <li><button onClick={handleLogout} className="nav-button">Logout</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login" className="nav-link" onClick={() => isMobile && setIsOpen(false)}>Login</Link></li>
              <li><Link to="/signup" className="nav-button" onClick={() => isMobile && setIsOpen(false)}>Sign Up</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
