import React, { useState, useEffect } from "react";
import "./login.css";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../AuthProvider";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // animate form fade-in
    setTimeout(() => setShowForm(true), 100);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    fetch(
      `https://debt-backend-lj7p.onrender.com/api/users?email=${email}&password=${password}`
    )
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
        if (data.length > 0) {
          const user = data[0];
          setMessage("Login successful!");
          login(user);
          navigate("/dashboard");
        } else {
          setMessage("Invalid email or password.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoading(false);
        setMessage("An error occurred. Please try again.");
      });
  }

  return (
    <div className="login-container">
      <form
        className={`login-form ${showForm ? "fade-in" : ""}`}
        onSubmit={handleSubmit}
      >
        <h1 className="login-title">Login</h1>

        <div className="form-group">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            id="email"
            required
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            id="password"
            required
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="login-btn"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {message && <p className="message">{message}</p>}

        <p className="redirect-text">
          Don't have an account?{" "}
          <Link to="/signup" className="redirect-link">Sign Up</Link>
        </p>
      </form>
    </div>
  );
}
