import React, { useState } from "react";
import Layout from "../../layout/Layout";
import BusinessInfoForm from "./BusinessInfoForm";
import ManagerOnboarding from "./ManagerOnboarding";
import SalesPersonOnboarding from "./SalesPersonOnboarding";
import UserManagement from "./UserManagement";
import MyProfile from "./MyProfile";

function OwnerSettings() {
  const [activeTab, setActiveTab] = useState("business");

  const tabs = [
    { id: "my-profile", label: "My Profile" }, 
    { id: "business", label: "Business Info" },
    { id: "managers", label: "Onboard Manager" },
    { id: "salespeople", label: "Onboard Salespeople" },
    { id: "users", label: "User Management" },
  
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case "my-profile":
        return <MyProfile />;  
      case "business":
        return <BusinessInfoForm />;
      case "managers":
        return <ManagerOnboarding />;
      case "salespeople":
        return <SalesPersonOnboarding />;
      case "users":
        return <UserManagement />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Owner Settings</h1>

        <div className="flex space-x-4 border-b mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 ${
                activeTab === tab.id
                  ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                  : "text-gray-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div>{renderActiveTab()}</div>
      </div>
    </Layout>
  );
}

export default OwnerSettings;
