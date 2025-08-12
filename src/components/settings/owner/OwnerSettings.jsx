import React, { useState } from "react";
import { 
  FiInfo, 
  FiDollarSign, 
  FiUsers,
  FiUserPlus,
  FiUserCheck
} from "react-icons/fi";
import Layout from "../../layout/Layout";
import BusinessInfoForm from "./BusinessInfoForm";
import FinanceSettings from "./FinanceSettings";
import TeamManagement from "./TeamManagement";

function OwnerSettings() {
  const [activeTab, setActiveTab] = useState("business");

  const tabs = [
    { 
      id: "business", 
      label: "Business Info",
      icon: <FiInfo className="mr-2" />
    },
    { 
      id: "finance", 
      label: "Finance",
      icon: <FiDollarSign className="mr-2" />
    },
    { 
      id: "team", 
      label: "Team Management",
      icon: <FiUsers className="mr-2" />
    },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case "business":
        return <BusinessInfoForm />;
      case "finance":
        return <FinanceSettings />;
      case "team":
        return <TeamManagement />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-gray-800">Manage Your Experience</h1>

        {/* Tab Navigation */}
        <div className="flex space-x-1 border-b border-gray-200 mb-8">
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

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {renderActiveTab()}
        </div>
      </div>
    </Layout>
  );
}

export default OwnerSettings;