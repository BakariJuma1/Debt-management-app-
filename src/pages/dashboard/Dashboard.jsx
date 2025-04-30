import React from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import "../dashboard/dashboard.css";

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <h1 className="dashboard-title">Track Your Stats</h1>

        <div className="stats-grid">
          <div className="stat-card total-debts">
            <h3>Total Debts</h3>
            <div className="stat-value">ksh50,000</div>
            <div className="stat-meta">Due by 2025</div>
          </div>

          <div className="stat-card paid-debts">
            <h3>Paid Debts</h3>
            <div className="stat-value">ksh15,000</div>
            <div className="stat-meta">30% of total</div>
          </div>

          <div className="stat-card overdue-debts">
            <h3>Overdue Debts</h3>
            <div className="stat-value">ksh5,000</div>
            <div className="stat-meta">2 debts</div>
          </div>

          <div className="stat-card upcoming-debts">
            <h3>Upcoming Due Debts</h3>
            <div className="stat-value">ksh10,000</div>
            <div className="stat-meta">Due in 30 days</div>
          </div>
        </div>
      </div>
    </div>
  );
}
