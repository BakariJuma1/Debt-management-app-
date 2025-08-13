import React from "react";
import { useAuth } from "../../AuthProvider";
import useIsMobile from "../../hooks/useIsMobile";
import { Navigate, useLocation } from "react-router-dom"; // Added useLocation import

// Import dashboard components
import OwnerDashboardDesktop from "../../pages/dashboard/OwnerDashboardDesktop";
import OwnerDashboardMobile from "../../pages/dashboard/OwnerDashboardMobile";
import SalesmanDashboardDesktop from "../../pages/dashboard/SalesmanDashboardDesktop";
import SalesmanDashboardMobile from "../../pages/dashboard/SalesmanDashboardMobile";
import AdminDashboardDesktop from "../../pages/dashboard/AdminDashboardDesktop";
import AdminDashboardMobile from "../../pages/dashboard/AdminDashboardMobile";
import { useEffect } from "react";

const DashboardRouter = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();

  useEffect(() => {
  console.log('Dashboard mounted. Location state:', location.state);
  
  if (location.state?.fromBusinessCreation) {
    console.log('Coming from business creation - verifying state...');
    console.log('Current user:', user);
    
    if (user?.role === 'owner' && !user?.hasBusiness) {
      console.warn('State mismatch! Expected hasBusiness: true');
      // Force state refresh as last resort
      window.location.reload();
    }
  }
}, [location.state, user]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const { role, hasBusiness } = user;

  // Redirect unregistered owners
  if (role === "owner" && !hasBusiness) {
    return <Navigate to="/settings/business" replace />;
  }

  // Return appropriate dashboard
  switch (role) {
    case "owner":
      return isMobile ? <OwnerDashboardMobile /> : <OwnerDashboardDesktop />;
    case "salesman":
      return isMobile ? <SalesmanDashboardMobile /> : <SalesmanDashboardDesktop />;
    case "admin":
      return isMobile ? <AdminDashboardMobile /> : <AdminDashboardDesktop />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
};

export default DashboardRouter;