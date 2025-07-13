import React from "react";
import { useDashboardData } from "../../hooks/useDashboardData";
import "./mobile.css";
import MobileTopbar from "../../components/mobiletopbar/MobileTopbar";

export default function MobileDashboard() {
  const {
    totalDebts,
    paidDebts,
    overdueDebts,
    totalUnpaid,
    recentActivity,
    debts,
  } = useDashboardData();

  return (
    <div className="mobile-dashboard">
        <MobileTopbar />
      <h1 className="mobile-title">Your Debts Overview</h1>

      {/* Overview */}
      <div className="mobile-stats">
        <div className="mobile-card total">
          <h4>Total</h4>
          <p>Ksh {totalDebts.toLocaleString()}</p>
        </div>
        <div className="mobile-card paid">
          <h4>Paid</h4>
          <p>Ksh {paidDebts.reduce((s, d) => s + d.total, 0).toLocaleString()}</p>
        </div>
        <div className="mobile-card overdue">
          <h4>Overdue</h4>
          <p>Ksh {overdueDebts.reduce((s, d) => s + d.total, 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mobile-section">
        <h3>Recent Activity</h3>
        <ul className="mobile-list">
          {recentActivity.map((item, i) => (
            <li key={i}>
              <strong>{item.customer}</strong> - {item.action} on {item.date}
            </li>
          ))}
        </ul>
      </div>

      {/* Debt Cards */}
      <div className="mobile-section">
        <h3>All Debts</h3>
        <div className="debt-cards">
          {debts.map((d) => (
            <div className="debt-card" key={d.id}>
              <p><strong>{d.customerName}</strong></p>
              <p>Amount: Ksh {d.total.toLocaleString()}</p>
              <p>Status: <span className={`status ${d.status}`}>{d.status}</span></p>
              <p>Due: {d.dueDate}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
