import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthProvider";
import Navbar from "./components/navbar/Navbar";
import Signup from "./pages/signup/SignUp";
import Login from "./pages/login/Login";
import Home from "./pages/home/Home";
import MyDebts from "./components/mydebts/MyDebts";
import AddDebt from "./components/adddebt/AddDebt";
import CustomerDetailPage from "./components/customerdetail/CustomerDetailPage";
import VerifyEmail from "./pages/verify email/VerifyEmail";
import SettingsWrapper from "./components/settings/SettingsWrapper";
import DashboardRouter from "./components/dashboard/DashboardRouter";


function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/dashboard/*" element={<DashboardRouter />} />

          <Route path="/debts" element={<MyDebts />} />
          <Route path="/add-debt" element={<AddDebt />} />
          <Route path="/settings/*" element={<SettingsWrapper />} />
          <Route path="/customers/:customerId" element={<CustomerDetailPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
