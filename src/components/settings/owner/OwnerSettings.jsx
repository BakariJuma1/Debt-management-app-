import React, { useState } from "react";
import { 
  FiInfo, 
  FiDollarSign, 
  FiUsers,
  FiMenu,
  FiX
} from "react-icons/fi";
import Layout from "../../layout/Layout";
import BusinessInfoForm from "./BusinessInfoForm";
import FinanceSettings from "./FinanceSettings";
import TeamManagement from "./TeamManagement";

function OwnerSettings() {
  const [activeTab, setActiveTab] = useState("business");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { 
      id: "business", 
      label: "Business Info",
      icon: <FiInfo className="md:mr-2" />,
      component: <BusinessInfoForm />
    },
    { 
      id: "finance", 
      label: "Finance",
      icon: <FiDollarSign className="md:mr-2" />,
      component: <FinanceSettings />
    },
    { 
      id: "team", 
      label: "Team",
      icon: <FiUsers className="md:mr-2" />,
      component: <TeamManagement />
    },
  ];

  return (
    <Layout>
      <div className="p-4 md:p-8 lg:p-16 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Manage Your Experience</h1>
          
          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {/* Tab Navigation - Desktop */}
        <div className="hidden md:flex space-x-1 border-b border-gray-200 mb-6 md:mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-white border-t border-r border-l border-gray-200 text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Navigation - Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden mb-4 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3 text-left text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.icon}
                <span className="ml-2">{tab.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {tabs.find(tab => tab.id === activeTab)?.component}
        </div>
      </div>
    </Layout>
  );
}

export default OwnerSettings;