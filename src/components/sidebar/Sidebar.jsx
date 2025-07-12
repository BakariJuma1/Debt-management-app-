import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiList,
  FiPlusCircle,
  FiSettings
} from "react-icons/fi";
import "../sidebar/sidebar.css";

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: <FiHome /> },
    { to: "/debts", label: "My Debts", icon: <FiList /> },
    { to: "/add-debt", label: "Add New Debt", icon: <FiPlusCircle /> },
    { to: "/settings", label: "Settings", icon: <FiSettings /> }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <h2 className="sidebar-title">Paysync</h2>
        <nav className="sidebar-nav">
          <ul className="sidebar-list">
            {navItems.map(({ to, label, icon }) => (
              <li key={to} className="sidebar-item">
                <Link
                  to={to}
                  className={`sidebar-link ${
                    location.pathname === to ? "active" : ""
                  }`}
                >
                  <span className="sidebar-icon">{icon}</span>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
