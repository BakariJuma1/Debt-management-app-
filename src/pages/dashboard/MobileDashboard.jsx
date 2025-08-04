import React, { useState } from "react";
import { 
  FiRefreshCw, 
  FiAlertCircle, 
  FiCalendar, 
  FiTrendingUp, 
  FiDownload,
  FiChevronDown,
  FiChevronUp,
  FiMenu
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import MobileTopBar from "../../components/mobiletopbar/MobileTopbar";

const COLORS = ["#00C49F", "#FFBB28", "#FF4F4F"];

export default function MobileDashboard({
  debts,
  totalDebts,
  totalPaid,
  totalUnpaid,
  overdueDebts,
  paidDebts,
  activity,
  topDebtors,
  upcoming,
  isLoading,
  error,
  onRefresh,
  chartData,
  trendData,
  timeRange,
  setTimeRange
}) {
  const [expandedSection, setExpandedSection] = useState(null);
  const [exporting, setExporting] = useState(false);


  const statusColors = {
    paid: "bg-green-100 text-green-800",
    unpaid: "bg-yellow-100 text-yellow-800",
    overdue: "bg-red-100 text-red-800"
  };

  const paidPercentage = totalDebts ? Math.round((totalPaid / totalDebts) * 100) : 0;

  const menuItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/debts", label: "All Debts" },
    { path: "/add-debt", label: "Add New Debt" },
    { path: "/settings", label: "Settings" }
  ];

  async function exportData() {
    setExporting(true);
    try {
      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Export completed! Data would be downloaded in a real app.');
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  }

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <MobileTopBar
        title="Debt Dashboard"
        isLoading={isLoading}
        onRefresh={onRefresh}
        menuItems={menuItems}
      />

      <select 
        value={timeRange}
        onChange={(e) => setTimeRange(e.target.value)}
        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 "
      >
        <option value="week">Last 7 days</option>
        <option value="month">Last 30 days</option>
        <option value="quarter">Last 90 days</option>
        <option value="year">Last 12 months</option>
      </select>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r-lg">
          <div className="flex items-center">
            <FiAlertCircle className="text-red-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !debts.length && (
        <div className="flex justify-center items-center h-40">
          <div className="animate-pulse text-gray-500">Loading dashboard data...</div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && !debts.length && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center mb-4">
          <h3 className="text-lg font-medium text-gray-800 mb-2">No debt records found</h3>
          <p className="text-gray-600 mb-4">Start by adding your first debt record</p>
          <Link 
            to="/add-debt"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 inline-block"
          >
            Add New Debt
          </Link>
        </div>
      )}

      {/* Dashboard Content */}
      {!isLoading && debts.length > 0 && (
        <div className="space-y-4">
          {/* Non-Collapsible Summary Section */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Summary</h2>
            <div className="grid grid-cols-2 gap-3">
              {/* Total Debts */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Total Debts</p>
                <p className="text-xl font-bold">Ksh {totalDebts.toLocaleString()}</p>
              </div>

              {/* Paid Debts */}
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Paid Debts</p>
                <p className="text-xl font-bold text-green-600">
                  Ksh {totalPaid.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">{paidPercentage}% of total</p>
              </div>

              {/* Unpaid Debts */}
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Unpaid Debts</p>
                <p className="text-xl font-bold text-yellow-600">
                  Ksh {totalUnpaid.toLocaleString()}
                </p>
              </div>

              {/* Overdue Debts */}
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Overdue Debts</p>
                <p className="text-xl font-bold text-red-600">
                  Ksh {overdueDebts.reduce((s, d) => s + d.total, 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">{overdueDebts.length} overdue</p>
              </div>
            </div>
          </div>

          {/* Debt Status Pie Chart */}
          <div 
            className="bg-white rounded-lg shadow p-4"
            onClick={() => toggleSection('pieChart')}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Debt Status</h2>
              {expandedSection === 'pieChart' ? <FiChevronUp /> : <FiChevronDown />}
            </div>
            
            {expandedSection === 'pieChart' && (
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`Ksh ${value.toLocaleString()}`, 'Amount']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Top Debtors */}
          <div 
            className="bg-white rounded-lg shadow p-4"
            onClick={() => toggleSection('topDebtors')}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Top Debtors</h2>
              {expandedSection === 'topDebtors' ? <FiChevronUp /> : <FiChevronDown />}
            </div>
            
            {expandedSection === 'topDebtors' && (
              <ul className="mt-4 space-y-3">
                {topDebtors.map((debtor, index) => (
                  <li key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <span className="font-medium text-gray-800 block">{debtor.name}</span>
                      {debtor.daysOverdue > 0 && (
                        <span className="text-xs text-red-500">{debtor.daysOverdue} days overdue</span>
                      )}
                    </div>
                    <span className="font-semibold text-red-600">Ksh {debtor.balance.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Upcoming Payments */}
          <div 
            className="bg-white rounded-lg shadow p-4"
            onClick={() => toggleSection('upcoming')}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Upcoming Payments</h2>
              {expandedSection === 'upcoming' ? <FiChevronUp /> : <FiChevronDown />}
            </div>
            
            {expandedSection === 'upcoming' && (
              <ul className="mt-4 space-y-3">
                {upcoming.length > 0 ? (
                  upcoming.map((item, index) => (
                    <li key={index} className="py-2 border-b border-gray-100 last:border-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-800">{item.name}</span>
                        <span className="font-semibold text-amber-600">Ksh {item.amount.toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Due in {Math.ceil(item.daysUntilDue)} days • {new Date(item.due).toLocaleDateString()}
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-center py-4 text-gray-500 text-sm">
                    No upcoming payments this week
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Recent Activity */}
          <div 
            className="bg-white rounded-lg shadow p-4"
            onClick={() => toggleSection('activity')}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
              {expandedSection === 'activity' ? <FiChevronUp /> : <FiChevronDown />}
            </div>
            
            {expandedSection === 'activity' && (
              <ul className="mt-4 space-y-3">
                {activity.map((item, index) => (
                  <li key={index} className="flex items-start py-2 border-b border-gray-100 last:border-0">
                    <div className={`p-2 rounded-lg mr-3 ${
                      item.action.includes('paid') ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {item.action.includes('paid') ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-800">
                          <span className="font-semibold">{item.customer}</span> {item.action}
                        </p>
                        <span className="text-sm font-medium">Ksh {item.amount.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* All Debts */}
          <div 
            className="bg-white rounded-lg shadow p-4"
            onClick={() => toggleSection('allDebts')}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">All Debts</h2>
              {expandedSection === 'allDebts' ? <FiChevronUp /> : <FiChevronDown />}
            </div>
            
            {expandedSection === 'allDebts' && (
              <div className="mt-4 space-y-3">
                {debts.map((d) => (
                  <div key={d.id} className="border border-gray-200 rounded-lg p-3">
                    <p className="font-medium text-gray-800">{d.customerName}</p>
                    <p className="text-sm text-gray-600">Amount: Ksh {d.total.toLocaleString()}</p>
                    <div className="flex items-center mt-1">
                      <p className="text-sm text-gray-600 mr-2">Status:</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColors[d.status] || 'bg-gray-100 text-gray-800'}`}>
                        {d.status}
                      </span>
                    </div>
                    {d.dueDate && (
                      <p className="text-sm text-gray-600 mt-1">
                        Due: {new Date(d.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}