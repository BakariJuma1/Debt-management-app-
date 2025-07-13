import React, { useState } from "react";
import { FaBars } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./mobiletopbar.css";

export default function MobileTopbar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mobile-topbar">
      <div className="topbar-header">
        <FaBars onClick={() => setOpen(!open)} className="menu-icon" />
      </div>

      {open && (
        <div className="mobile-menu">
          <Link to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
          <Link to="/debts" onClick={() => setOpen(false)}>All Debts</Link>
          <Link to="/settings" onClick={() => setOpen(false)}>Settings</Link>
        </div>
      )}
    </div>
  );
}
