import React, { useState } from "react";
import { useAuth } from "../../AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../api";

export default function SignUp() {
  const { login } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Send signup data to your API
      console.log("Signup URL being called:", `${API_BASE_URL}/register`);

      const response = await axios.post(`${API_BASE_URL}/register`, {
        name: `${firstName} ${lastName}`,
        email: email.trim(),
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        // Don't login automatically - wait for verification
        setMessage("Registration successful! Please check your email for verification instructions.");

        // Redirect to verification page with email info
        setTimeout(() => navigate("/verify-email", { state: { email } }), 2000);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      let errorMessage = "Sign up failed. Please try again.";

      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = error.response.data?.message || "Validation error";
            break;
          case 409:
            errorMessage = "Email already exists";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      }

      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="text-center mb-5">
              <h1 className="text-xl font-bold text-gray-900 mb-1">Create an account</h1>
              <p className="text-xs text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </div>

            {message && (
              <div
                className={`mb-4 p-2 rounded text-xs ${
                  message.includes("success") 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}
              >
                <p className="font-medium">{message}</p>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="block text-xs font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className="w-full px-3 py-2 text-sm rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition-colors"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-xs font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className="w-full px-3 py-2 text-sm rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition-colors"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-3 py-2 text-sm rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition-colors"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="w-full px-3 py-2 text-sm rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition-colors"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded shadow-sm hover:shadow transition-all duration-200 flex justify-center items-center ${
                  loading ? "opacity-80 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </>
                ) : (
                  "Sign up"
                )}
              </button>
            </form>
          </div>
          
          <div className="bg-gray-50 px-6 py-4 text-center">
            <p className="text-xs text-gray-600">
              By signing up, you agree to our{" "}
              <a href="#" className="text-blue-600 hover:text-blue-500 font-medium">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 hover:text-blue-500 font-medium">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}