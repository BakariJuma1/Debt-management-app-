import React from "react";
import "./signup.css";

export default function SignUp() {
  return (
    <div className="signup-container">
      <form className="sign-up-form">
        <h1 className="form-title">Sign Up</h1>

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
          />
        </div>

        <button type="submit" className="submit-btn">
          Sign Up
        </button>

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
