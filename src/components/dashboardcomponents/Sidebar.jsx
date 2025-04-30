import { Link } from "react-router-dom";
import "./dashboard.css";

export default function Sidebar() {
  return (
    <div>
      <div>
        <h2>Debt Management</h2>
        <nav>
          <ul>
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link to="/debts">My Debts</Link>
            </li>
            <li>
              <Link to="/add-debt">Add New Debt</Link>
            </li>
            <li>
              <Link to="/settings">Settings</Link>
            </li>
            
          </ul>
        </nav>
      </div>
    </div>
  );
}
