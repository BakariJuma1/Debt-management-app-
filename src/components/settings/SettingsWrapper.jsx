import React from "react";
import { useAuth } from "../../AuthProvider";
import { Navigate, Routes, Route } from "react-router-dom";

import OwnerSettings from "./owner/OwnerSettings";
import ManagerSettings from "./manager/ManagerSettings";
import SalesPersonSettings from "./salesperson/SalesPersonSettings";
import BusinessInfoForm from "./owner/BusinessInfoForm";

export default function SettingsWrapper() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect logic based on role and business status
  const getInitialRoute = () => {
    if (user.role === "owner") {
      return user.hasBusiness ? "owner" : "business";
    }
    if (user.role === "manager") return "manager";
    if (user.role === "salesperson") return "salesperson";
    return null;
  };

  const initialRoute = getInitialRoute();

  return (
    <Routes>
      {/* Automatic redirection based on role */}
      <Route
        index
        element={
          initialRoute ? (
            <Navigate to={initialRoute} replace />
          ) : (
            <div>Unauthorized access</div>
          )
        }
      />

      {/* Owner routes */}
      {user.role === "owner" && (
        <>
          <Route path="owner" element={<OwnerSettings />} />
          <Route path="business" element={<BusinessInfoForm />} />
        </>
      )}

      {/* Manager route */}
      {user.role === "manager" && (
        <Route path="manager" element={<ManagerSettings />} />
      )}

      {/* Salesperson route */}
      {user.role === "salesperson" && (
        <Route path="salesperson" element={<SalesPersonSettings />} />
      )}

      {/* Fallback */}
      <Route path="*" element={<div>Unauthorized access</div>} />
    </Routes>
  );
}