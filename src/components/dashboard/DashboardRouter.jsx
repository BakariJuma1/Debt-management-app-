import React from "react";
import { useAuth } from "../../AuthProvider";
import useIsMobile from "../../hooks/useIsMobile";
import { Navigate } from "react-router-dom";

import OwnerDashboardDesktop from "../../pages/dashboard/OwnerDashboardDesktop";
import OwnerDashboardMobile from "../../pages/dashboard/OwnerDashboardMobile";
import SalesmanDashboardDesktop from "../../pages/dashboard/SalesmanDashboardDesktop";
import SalesmanDashboardMobile from "../../pages/dashboard/SalesmanDashboardMobile";
import AdminDashboardDesktop from "../../pages/dashboard/AdminDashboardDesktop";
import AdminDashboardMobile from "../../pages/dashboard/AdminDashboardMobile";

const DashboardRouter = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  if (!user) return <p>Loading...</p>;

  const role = user.role;

  // Redirect owner without business info
  if (role === "owner" && !user.hasBusiness) {
    return <Navigate to="/settings/business" replace />;
  }

  if (role === "owner") {
    return isMobile ? <OwnerDashboardMobile /> : <OwnerDashboardDesktop />;
  } else if (role === "salesman") {
    return isMobile ? <SalesmanDashboardMobile /> : <SalesmanDashboardDesktop />;
  } else if (role === "admin") {
    return isMobile ? <AdminDashboardMobile /> : <AdminDashboardDesktop />;
  } else {
    return <p>Unauthorized</p>;
  }
};

export default DashboardRouter;
