// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "./api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState({
    user: null,
    token: null,
    loading: true
  });

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      if (token && user) {
        try {
          const response = await axios.get(`${API_BASE_URL}/verify`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          const verifiedUser = processUserData(response.data.user, response.data.business);
          persistAuthState(verifiedUser, token);
        } catch (error) {
          console.error("Session verification failed:", error);
          logout();
        }
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    initializeAuth();
  }, []);

  // Process user data with business info
  const processUserData = (userData, businessData) => {
    return {
      ...userData,
      hasBusiness: userData.role === 'owner' 
        ? businessData !== null
        : !!userData.business_id,
      business: businessData || null
    };
  };

  // Persist auth state to context and localStorage
  const persistAuthState = (userData, token) => {
    setAuthState({
      user: userData,
      token,
      loading: false
    });
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  // Manual login - critical for post-signup/post-verification flow
  const manualLogin = (userData, token, businessData = null) => {
    const processedUser = processUserData(userData, businessData);
    persistAuthState(processedUser, token);
    return processedUser;
  };

  // Regular login
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
      return manualLogin(response.data.user, response.data.access_token, response.data.business);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  // Update user with business awareness
  const updateUser = (updatedData) => {
    setAuthState(prev => {
      const updatedUser = {
        ...prev.user,
        ...updatedData,
        hasBusiness: updatedData.role === 'owner'
          ? updatedData.owned_businesses?.length > 0 || prev.user?.hasBusiness
          : !!updatedData.business_id || prev.user?.hasBusiness
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return { ...prev, user: updatedUser };
    });
  };

  // Specialized business update
  const updateBusiness = (businessData) => {
    setAuthState(prev => {
      const updatedUser = {
        ...prev.user,
        hasBusiness: true,
        ...(prev.user.role === 'owner' && {
          owned_businesses: [businessData]
        }),
        business: businessData
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return { ...prev, user: updatedUser };
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common['Authorization'];
    setAuthState({
      user: null,
      token: null,
      loading: false
    });
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        isAuthenticated: !!authState.token,
        login,
        manualLogin, // Essential for immediate post-signup/login
        logout,
        updateUser,
        updateBusiness,
        signup: async (formData) => {
          const response = await axios.post(`${API_BASE_URL}/register`, formData);
          return response.data;
        }
      }}
    >
      {!authState.loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);