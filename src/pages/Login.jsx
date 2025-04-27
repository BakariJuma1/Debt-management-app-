import React from "react";
import './login.css';

export default function Login() {
  return (
    <div className="login-container">
      <form className="login-form">
        <h1 className="login-title">Login</h1>
        
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className="form-input"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            className="form-input"
            required
          />
        </div>
        
        <button type="submit" className="login-btn">
          Login
        </button>
        
        <p className="redirect-text">
          Don't have an account?{' '}
          <a href="/signup" className="redirect-link">Sign Up</a>
        </p>
      </form>
    </div>
  );
}