import React, { useState } from "react";
import "./signup.css";
import { useAuth } from "../../AuthProvider";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const { login } = useAuth(); // Access the login function from context
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "https://debt-backend-lj7p.onrender.com/api/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ firstName, lastName, email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Sign up successful!");
        login(); // Call the login function from context
        navigate("/dashboard"); // Redirect to dashboard
      } else {
        setMessage(data.message || "Sign up failed.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="signup-container">
      <form className="sign-up-form" onSubmit={handleSubmit}>
        <h1 className="form-title">Sign Up</h1>

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            First Name
          </label>
          <input
            type="text"
            // placeholder="First Name"
            value={firstName}
            className="form-input"
            required
            onChange={(e) => setFirstName(e.target.value)}
          />
          <label htmlFor="email" className="form-label">
            Last Name
          </label>
          <input
            type="text"
            // placeholder="Last Name"
            value={lastName}
            className="form-input"
            required
            onChange={(e) => setLastName(e.target.value)}
          />
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

        <button type="submit" className="submit-btn">
          Sign Up
        </button>
        {message && <p className="message">{message}</p>}
        <p className="redirect-text">
          Already have an account?{" "}
          <a href="/login" className="redirect-link">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}
