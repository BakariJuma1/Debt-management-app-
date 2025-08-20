import { Link, useLocation } from "react-router-dom";
import { FiHome, FiList, FiPlusCircle, FiSettings, FiUsers } from "react-icons/fi";

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: <FiHome className="w-5 h-5" /> },
    { to: "/debts", label: "My Debts", icon: <FiList className="w-5 h-5" /> },
    { to: "/add-debt", label: "Add New Debt", icon: <FiPlusCircle className="w-5 h-5" /> },
    { to: "/customers", label: "Customers", icon: <FiUsers className="w-5 h-5" /> },
    { to: "/settings", label: "Settings", icon: <FiSettings className="w-5 h-5" /> }
  ];

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 fixed left-0 top-5 flex flex-col ">
      <div className="p-6 flex-1 flex flex-col">
        {/* Logo/Brand */}
        <h2 className="text-2xl font-bold text-indigo-600 mb-8"></h2>
        
        {/* Navigation */}
        <nav className="flex-1">
          <ul className="space-y-2">
            {navItems.map(({ to, label, icon }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                    location.pathname === to 
                      ? "bg-indigo-50 text-indigo-600 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className={`mr-3 ${
                    location.pathname === to ? "text-indigo-500" : "text-gray-400"
                  }`}>
                    {icon}
                  </span>
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