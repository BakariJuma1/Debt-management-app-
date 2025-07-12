import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthProvider";
import Navbar from "./components/navbar/Navbar";
import Signup from "./pages/signup/SignUp";
import Login from "./pages/login/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Home from "./pages/home/Home";
import MyDebts from "./components/mydebts/MyDebts";
import AddDebt from "./components/adddebt/AddDebt";
import Settings from "./components/settings/settings";
import CustomerDetailPage from "./components/customerdetail/CustomerDetailPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/debts" element={<MyDebts/>}/>
          <Route path="/add-debt" element={<AddDebt/>}   />
          <Route path="/settings" element={<Settings/>}  />
          <Route path="/customers/:customerId" element={<CustomerDetailPage />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
