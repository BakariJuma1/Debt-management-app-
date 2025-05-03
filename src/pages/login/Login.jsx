import React, { useState } from "react";
import "./login.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthProvider";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    fetch(
      `https://debt-backend-lj7p.onrender.com/api/users?email=${email}&password=${password}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.length > 0) {
          const user = data[0];
          setMessage("Login successful!");
          login(user); // Call your login function
          navigate("/dashboard"); // Navigate to dashboard
        } else {
          setMessage("Invalid email or password.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setMessage("An error occurred. Please try again.");
      });
  }
  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1 className="login-title">Login</h1>

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="form-input"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="form-input"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="login-btn">
          Login
        </button>
        {message && <p className="message">{message}</p>}
        <p className="redirect-text">
          Don't have an account?{" "}
          <a href="/signup" className="redirect-link">
            Sign Up
          </a>
        </p>
      </form>
    </div>
  );
}
