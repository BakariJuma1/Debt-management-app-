// MobileTopBar.jsx
import React, { useState } from "react";
import { FiMenu, FiRefreshCw, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";

const defaultMenuItems = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/settings", label: "Settings" },
  {path: "/debts",label:"All Debts"},
  {path: "/add-debt",label:"Add New Debt"}
];

export default function MobileTopBar({ 
  title = "Debt dashboard", 
  isLoading = false, 
  onRefresh = () => window.location.reload(),
  menuItems = defaultMenuItems,
  showMenu = true,
  className = "",
  children
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="pt-25"></div>
      
      <div className={`bg-white shadow-sm p-4 sticky top-0 z-40 ${className}`}>
        <div className="flex justify-between items-center max-w-screen-md mx-auto">
          <div className="flex items-center">
            {showMenu && (
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="mr-4 text-gray-700 focus:outline-none"
                aria-label="Toggle menu"
              >
                {menuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            )}
            <h1 className="text-xl font-bold text-gray-800">{title}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {children}
            
            {onRefresh && (
              <button 
                onClick={onRefresh}
                disabled={isLoading}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Refresh"
              >
                <FiRefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {showMenu && menuOpen && (
          <div className="absolute left-0 right-0 mt-2 mx-4 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50">
            {menuItems.map((item, index) => (
              <Link 
                key={index}
                to={item.path} 
                className="block px-4 py-2 text-gray-800 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}