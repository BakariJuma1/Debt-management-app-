import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import "./dashboard.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "../dashboard/dashboard.css";

const API_URL = "https://debt-backend-lj7p.onrender.com/api/debts";
const COLORS = ["#00C49F", "#FFBB28", "#FF4F4F"];

export default function Dashboard() {
  const [debts, setDebts] = useState([]);

  useEffect(() => {
    fetchDebts();
  }, []);

  async function fetchDebts() {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setDebts(data);
    } catch (err) {
      console.error("Error fetching debts:", err);
    }
  }

  const totalDebts = debts.reduce((sum, d) => sum + d.total, 0);
  const paidDebts = debts.filter((d) => d.status === "paid");
  const unpaidDebts = debts.filter((d) => d.status === "unpaid");
  const overdueDebts = debts.filter((d) => d.status === "overdue");

  const totalPaid = paidDebts.reduce((sum, d) => sum + d.total, 0);
  const totalOverdue = overdueDebts.reduce((sum, d) => sum + d.total, 0);
  const totalUnpaid = totalDebts - totalPaid;
  const paidPercentage = totalDebts ? Math.round((totalPaid / totalDebts) * 100) : 0;

  const chartData = [
    { name: "Paid", value: totalPaid },
    { name: "Unpaid", value: totalUnpaid },
    { name: "Overdue", value: totalOverdue },
  ];

  const topDebtors = [...debts]
    .sort((a, b) => b.total - a.total)
    .slice(0, 3)
    .map((d) => ({
      name: d.customerName,
      balance: d.total,
    }));

  const today = new Date();
const upcoming = debts
  .filter((d) => {
    if (!d.dueDate) return false;
    const due = new Date(d.dueDate);
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dueMidnight = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const diff = (dueMidnight - todayMidnight) / (1000 * 60 * 60 * 24);
    return d.status && d.status.toLowerCase() === "unpaid" && diff >= 0 && diff <= 7;
  })
  .map((d) => ({
    name: d.customerName,
    amount: d.total,
    due: d.dueDate,
  }));

  const activity = [...debts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map((d) => ({
      customer: d.customerName,
      action: d.status === "paid" ? "Marked as paid" : "Added new debt",
      date: new Date(d.createdAt).toLocaleDateString(),
    }));

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <h1 className="dashboard-title">Track Your Stats</h1>

        {/* Overview */}
        <div className="stats-grid">
          <div className="stat-card total-debts">
            <h3>Total Debts</h3>
            <div className="stat-value">ksh{totalDebts.toLocaleString()}</div>
          </div>
          <div className="stat-card paid-debts">
            <h3>Paid Debts</h3>
            <div className="stat-value">ksh{totalPaid.toLocaleString()}</div>
            <div className="stat-meta">{paidPercentage}% paid</div>
          </div>
          <div className="stat-card overdue-debts">
            <h3>Overdue Debts</h3>
            <div className="stat-value">ksh{totalOverdue.toLocaleString()}</div>
            <div className="stat-meta">{overdueDebts.length} overdue</div>
          </div>
          <div className="stat-card upcoming-debts">
            <h3>Upcoming Due</h3>
            <div className="stat-value">
              ksh{upcoming.reduce((s, d) => s + d.amount, 0).toLocaleString()}
            </div>
            <div className="stat-meta">{upcoming.length} this week</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-section">
          <h2>Recent Activity</h2>
          <ul className="activity-list">
            {activity.map((item, index) => (
              <li key={index}>
                <strong>{item.customer}</strong> - {item.action} on {item.date}
              </li>
            ))}
          </ul>
        </div>

        {/* Pie Chart */}
        <div className="dashboard-section">
          <h2>Debt Status Chart</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Debtors */}
        <div className="dashboard-section">
          <h2>Top Debtors</h2>
          <ul className="top-debtors-list">
            {topDebtors.map((debtor, index) => (
              <li key={index}>
                <span>{debtor.name}</span>
                <span>Ksh{debtor.balance.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Upcoming Payments */}
        <div className="dashboard-section">
          <h2>Upcoming Payments</h2>
          <ul className="upcoming-payments-list">
            {upcoming.map((item, index) => (
              <li key={index}>
                <span>{item.name}</span>
                <span>Ksh{item.amount.toLocaleString()}</span>
                <span>Due: {item.due}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
