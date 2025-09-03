import React, { useState, useEffect } from "react";
import {
  FiRefreshCw,
  FiAlertCircle,
  FiCalendar,
  FiTrendingUp,
  FiDownload,
  FiChevronDown,
  FiChevronUp,
  FiMail,
  FiClock,
  FiUser,
  FiTag,
  FiDollarSign,
  FiPieChart,
  FiFilter,
  FiX,
  FiPlus,
  FiBell,
  FiChevronRight,
  FiBriefcase,
} from "react-icons/fi";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import Sidebar from "../../components/sidebar/Sidebar";
import API_BASE_URL from "../../api";

// Modern color scheme with gradients
const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
const STATUS_COLORS = {
  pending: "#F59E0B",
  partial: "#6366F1",
  paid: "#10B981",
  overdue: "#EF4444",
};

// Gradient backgrounds for cards
const CARD_GRADIENTS = [
  "bg-gradient-to-r from-indigo-500 to-indigo-600",
  "bg-gradient-to-r from-emerald-500 to-emerald-600",
  "bg-gradient-to-r from-amber-500 to-amber-600",
  "bg-gradient-to-r from-rose-500 to-rose-600",
];

const DASHBOARD_API_URL = `${API_BASE_URL}/dashboard-owner`;

const BusinessOwnerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    start_date: "",
    end_date: "",
  });
  const [exporting, setExporting] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [timeRange, setTimeRange] = useState("month");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch data from API
  useEffect(() => {
    fetchDashboardData();
    // Mock notifications for demo
    setNotifications([
      {
        id: 1,
        message: "New debt added by Salesperson A",
        time: "5 mins ago",
        read: false,
      },
      {
        id: 2,
        message: "Payment received from Customer B",
        time: "1 hour ago",
        read: true,
      },
      {
        id: 3,
        message: "Weekly report is ready",
        time: "3 hours ago",
        read: true,
      },
    ]);
  }, [dateRange, timeRange]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Build query string with date filters
      const params = new URLSearchParams();
      if (dateRange.start_date)
        params.append("start_date", dateRange.start_date);
      if (dateRange.end_date) params.append("end_date", dateRange.end_date);
      params.append("time_range", timeRange);

      const queryString = params.toString();
      const url = queryString
        ? `${DASHBOARD_API_URL}?${queryString}`
        : DASHBOARD_API_URL;

      const token = localStorage.getItem("token");
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Server error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    
    try {
      const token = localStorage.getItem("token");
    
      const response = await fetch(`${API_BASE_URL}/export/business`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error("Failed to export business data");
      const blob = await response.blob();
     
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `business_report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export error:", err);
      setError("Failed to export business data");
    }
  };
  const sendEmailReport = () => {
    alert("Report would be sent in a real implementation");
    setEmailModalOpen(false);
  };

  const StatCard = ({
    title,
    value,
    icon,
    trend,
    change,
    secondaryValue,
    index = 0,
  }) => {
    return (
      <div
        className={`p-5 rounded-2xl text-white ${
          CARD_GRADIENTS[index % CARD_GRADIENTS.length]
        } shadow-lg`}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium opacity-90 mb-1">{title}</h3>
            <div className="text-2xl font-bold">{value || "N/A"}</div>
            {secondaryValue && (
              <div className="text-xs opacity-80 mt-1">{secondaryValue}</div>
            )}
          </div>
          <div className="p-2 rounded-xl bg-white bg-opacity-20 backdrop-blur-sm">
            {React.cloneElement(icon, { className: "text-white w-5 h-5" })}
          </div>
        </div>
        {trend && change && (
          <div className="flex items-center mt-3 text-xs font-medium">
            <span className="mr-1">
              {trend === "up" ? (
                <FiTrendingUp className="text-white" />
              ) : (
                <FiTrendingUp className="text-white transform rotate-180" />
              )}
            </span>
            <span>{change}</span>
          </div>
        )}
      </div>
    );
  };

  if (isLoading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 flex items-center justify-center ml-0 lg:ml-16 transition-all duration-300">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-16 h-16 bg-indigo-200 rounded-full mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6 ml-0 lg:ml-64 mt-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {dashboardData?.businessName || "Business Owner Dashboard"}
            </h1>

            <p className="text-gray-500 mt-1">
              Comprehensive overview of your business performance
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-0">
            {/* Notifications */}
            <div className="relative">
              <button className="p-2 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow">
                <FiBell className="text-gray-600" />
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
            </div>

            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="quarter">Last 90 days</option>
              <option value="year">Last 12 months</option>
            </select>

            {/* Filter Button */}
            <button
              onClick={() => setShowDateFilter(!showDateFilter)}
              className="flex items-center gap-2 bg-white text-gray-700 rounded-xl px-3 py-2 text-sm shadow-sm hover:shadow-md transition-shadow"
            >
              <FiFilter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>

            <button
              onClick={fetchDashboardData}
              disabled={isLoading}
              className="flex items-center gap-2 bg-white text-gray-700 rounded-xl px-3 py-2 text-sm shadow-sm hover:shadow-md transition-shadow disabled:opacity-50"
            >
              <FiRefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={() => setEmailModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 text-white rounded-xl px-3 py-2 text-sm shadow-sm hover:bg-emerald-700 transition-colors"
            >
              <FiMail className="w-4 h-4" />
              <span className="hidden sm:inline">Email Report</span>
            </button>

            <button
              onClick={() => {
                handleExportData();
              }}
              disabled={exporting}
              className="flex items-center gap-2 bg-indigo-600 text-white rounded-xl px-3 py-2 text-sm shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <FiDownload
                className={`w-4 h-4 ${exporting ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Date Filter Dropdown */}
        {showDateFilter && (
          <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-700">
                Filter by Date Range
              </h3>
              <button onClick={() => setShowDateFilter(false)}>
                <FiX className="text-gray-500" />
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.start_date}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start_date: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.end_date}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end_date: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setDateRange({ start_date: "", end_date: "" })}
                  className="h-10 px-4 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Email Report Modal */}
        {emailModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                Send Business Report
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipient Email
                  </label>
                  <input
                    type="email"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    placeholder="recipient@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value="Business Performance Report"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    value="Please find attached the latest business performance report."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    rows="3"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setEmailModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={sendEmailReport}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
                >
                  Send Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
            <div className="flex items-center">
              <FiAlertCircle className="text-red-500 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Error loading data
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button
                  onClick={fetchDashboardData}
                  className="mt-2 text-blue-600 text-sm hover:text-blue-800 font-medium"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {dashboardData ? (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              <StatCard
                title="Total Debts"
                value={
                  dashboardData.summary?.total_debts
                    ? `Ksh ${dashboardData.summary.total_debts.toLocaleString()}`
                    : "N/A"
                }
                icon={<FiTag />}
                index={0}
              />
              <StatCard
                title="Total Amount"
                value={
                  dashboardData.summary?.total_amount
                    ? `Ksh ${dashboardData.summary.total_amount.toLocaleString()}`
                    : "N/A"
                }
                icon={<FiPieChart />}
                index={1}
              />
              <StatCard
                title="Total Paid"
                value={
                  dashboardData.summary?.total_paid
                    ? `Ksh ${dashboardData.summary.total_paid.toLocaleString()}`
                    : "N/A"
                }
                icon={<FiTrendingUp />}
                index={2}
              />
              <StatCard
                title="Recovery Rate"
                value={
                  dashboardData.summary?.recovery_rate
                    ? `${dashboardData.summary.recovery_rate.toFixed(1)}%`
                    : "N/A"
                }
                icon={<FiTrendingUp />}
                index={3}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-5 md:space-y-6">
                {/* Performance vs Target */}
                <div className="bg-white rounded-2xl shadow-sm p-4 md:p-5 border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Business Performance
                  </h2>
                  {dashboardData.performance_vs_target ? (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          Target: Ksh{" "}
                          {dashboardData.performance_vs_target.target_amount?.toLocaleString() ||
                            "N/A"}
                        </span>
                        <span className="text-sm font-medium text-indigo-600">
                          {dashboardData.performance_vs_target.achievement_percent?.toFixed(
                            1
                          ) || "0"}
                          % Achieved
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2.5 rounded-full"
                          style={{
                            width: `${Math.min(
                              dashboardData.performance_vs_target
                                .achievement_percent || 0,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Collected: Ksh{" "}
                          {dashboardData.performance_vs_target.collected?.toLocaleString() ||
                            "N/A"}
                        </span>
                        <span className="text-gray-600">
                          Remaining: Ksh{" "}
                          {(
                            dashboardData.performance_vs_target.target_amount -
                            dashboardData.performance_vs_target.collected
                          )?.toLocaleString() || "N/A"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500">
                      No performance data available
                    </p>
                  )}
                </div>

                {/* Status Breakdown */}
                <div className="bg-white rounded-2xl shadow-sm p-4 md:p-5 border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Debt Status Breakdown
                  </h2>
                  <div className="h-64">
                    {dashboardData.summary?.status_breakdown ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={Object.entries(
                              dashboardData.summary.status_breakdown
                            ).map(([name, value]) => ({ name, value }))}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={60}
                            outerRadius={80}
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                            labelLine={false}
                          >
                            {Object.entries(
                              dashboardData.summary.status_breakdown
                            ).map(([name], index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  STATUS_COLORS[name] ||
                                  COLORS[index % COLORS.length]
                                }
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [`${value} debts`, "Count"]}
                            contentStyle={{
                              borderRadius: "8px",
                              border: "1px solid #e5e7eb",
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            }}
                          />
                          <Legend
                            iconType="circle"
                            iconSize={10}
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            wrapperStyle={{ paddingLeft: "20px" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No status breakdown data available
                      </div>
                    )}
                  </div>
                </div>

                {/* Top Debtors */}
                <div className="bg-white rounded-2xl shadow-sm p-4 md:p-5 border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Top Debtors
                    </h2>
                    <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                      View All <FiChevronRight className="ml-1" />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Phone
                          </th>
                          <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Balance
                          </th>
                          <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {dashboardData.customer_segmentation?.top_debtors
                          ?.slice(0, 5)
                          .map((customer, index) => (
                            <tr
                              key={index}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-3 py-2 md:px-4 md:py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                {customer.customer || "Unknown"}
                              </td>
                              <td className="px-3 py-2 md:px-4 md:py-3 whitespace-nowrap text-sm text-gray-500">
                                {customer.phone || "N/A"}
                              </td>
                              <td className="px-3 py-2 md:px-4 md:py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                                Ksh {customer.amount?.toLocaleString() || "0"}
                              </td>
                              <td className="px-3 py-2 md:px-4 md:py-3 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${
                                  customer.status === "paid"
                                    ? "bg-green-100 text-green-800"
                                    : customer.status === "pending"
                                    ? "bg-amber-100 text-amber-800"
                                    : customer.status === "overdue"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                                >
                                  {customer.status || "unknown"}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-5 md:space-y-6">
                {/* Upcoming Payments */}
                <div className="bg-white rounded-2xl shadow-sm p-4 md:p-5 border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Upcoming Payments
                    </h2>
                    <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                      View All <FiChevronRight className="ml-1" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {dashboardData.upcoming_due_payments
                      ?.slice(0, 5)
                      .map((payment, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {payment.customer || "Unknown"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Due:{" "}
                              {payment.due_date
                                ? new Date(
                                    payment.due_date
                                  ).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>
                          <div className="text-sm font-semibold text-indigo-600">
                            Ksh {payment.amount?.toLocaleString() || "0"}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Recent Communications */}
                <div className="bg-white rounded-2xl shadow-sm p-4 md:p-5 border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Recent Communications
                    </h2>
                    <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                      View All <FiChevronRight className="ml-1" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {dashboardData.communication_logs
                      ?.slice(0, 5)
                      .map((comm, index) => (
                        <div
                          key={index}
                          className="p-3 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100"
                        >
                          <p className="text-sm text-gray-900">
                            {comm.message || "No message content"}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {comm.timestamp
                              ? new Date(comm.timestamp).toLocaleString()
                              : "Unknown time"}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-sm p-4 md:p-5 border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Quick Actions
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex flex-col items-center justify-center p-3 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
                      <FiMail className="text-indigo-600 mb-2 w-5 h-5" />
                      <span className="text-sm text-indigo-600 font-medium">
                        Send Report
                      </span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors">
                      <FiUser className="text-emerald-600 mb-2 w-5 h-5" />
                      <span className="text-sm text-emerald-600 font-medium">
                        Add Staff
                      </span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-3 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors">
                      <FiDollarSign className="text-amber-600 mb-2 w-5 h-5" />
                      <span className="text-sm text-amber-600 font-medium">
                        View Reports
                      </span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                      <FiBriefcase className="text-purple-600 mb-2 w-5 h-5" />
                      <span className="text-sm text-purple-600 font-medium">
                        Business Settings
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <FiAlertCircle className="w-8 h-8 text-indigo-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              No data available
            </h3>
            <p className="text-gray-600 mb-4">
              Could not load dashboard data. Please check your connection.
            </p>
            <button
              onClick={fetchDashboardData}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessOwnerDashboard;
