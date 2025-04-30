import { Link } from "react-router-dom";
import "../sidebar/sidebar.css";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-content">
        <h2 className="sidebar-title">Debt Management</h2>
        <nav className="sidebar-nav">
          <ul className="sidebar-list">
            <li className="sidebar-item">
              <Link to="/dashboard" className="sidebar-link">
                <span className="sidebar-icon"></span>
                Dashboard
              </Link>
            </li>
            <li className="sidebar-item">
              <Link to="/debts" className="sidebar-link">
                <span className="sidebar-icon"></span>
                My Debts
              </Link>
            </li>
            <li className="sidebar-item">
              <Link to="/add-debt" className="sidebar-link">
                <span className="sidebar-icon"></span>
                Add New Debt
              </Link>
            </li>
            <li className="sidebar-item">
              <Link to="/settings" className="sidebar-link">
                <span className="sidebar-icon"></span>
                Settings
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
