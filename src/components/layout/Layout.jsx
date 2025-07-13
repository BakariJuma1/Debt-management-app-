// Layout.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../sidebar/Sidebar";
import MobileTopbar from "../mobiletopbar/MobileTopbar";
import "./layout.css"; 

export default function Layout({ children }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="dashboard-container">
      {!isMobile && <Sidebar />}
      {isMobile && <MobileTopbar />}
      <div className="dashboard-content">{children}</div>
    </div>
  );
}
