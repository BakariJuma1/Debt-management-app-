import React, { useState, useEffect } from 'react';
import {
  FiRefreshCw, FiAlertCircle, FiCalendar, FiTrendingUp, 
  FiDownload, FiChevronDown, FiChevronUp, FiMenu,
  FiMail, FiClock, FiUser, FiTag, FiDollarSign, FiPieChart,
  FiFilter, FiX, FiPlus, FiBell, FiChevronRight
} from "react-icons/fi";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";
import Sidebar from "../../components/sidebar/Sidebar";

// API configuration
const API_BASE_URL = 'https://paysync-backend.onrender.com';

const SalesmanDashboardDesktop = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: ''
  });
  const [expandedSection, setExpandedSection] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Modern color scheme with gradients
  const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
  const STATUS_COLORS = {
    'pending': '#F59E0B',
    'partial': '#6366F1',
    'paid': '#10B981',
    'overdue': '#EF4444'
  };

  // Gradient backgrounds for cards
  const CARD_GRADIENTS = [
    'bg-gradient-to-r from-indigo-500 to-indigo-600',
    'bg-gradient-to-r from-emerald-500 to-emerald-600',
    'bg-gradient-to-r from-amber-500 to-amber-600',
    'bg-gradient-to-r from-rose-500 to-rose-600'
  ];

  // Fetch data from API
  useEffect(() => {
    fetchDashboardData();
    // Mock notifications for demo
    setNotifications([
      { id: 1, message: 'Payment received from John Doe', time: '2 mins ago', read: false },
      { id: 2, message: 'Reminder sent to Jane Smith', time: '1 hour ago', read: true },
      { id: 3, message: 'New customer added: Mike Johnson', time: '3 hours ago', read: true }
    ]);
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Build query string with date filters
      const params = new URLSearchParams();
      if (dateRange.start_date) params.append('start_date', dateRange.start_date);
      if (dateRange.end_date) params.append('end_date', dateRange.end_date);
      
      const queryString = params.toString();
      const url = queryString ? `${API_BASE_URL}/dashboard-salesman?${queryString}` : `${API_BASE_URL}/dashboard-salesman`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status} ${response.statusText}`);
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
    setExporting(true);
    try {
      // Build query string with date filters
      const params = new URLSearchParams();
      if (dateRange.start_date) params.append('start_date', dateRange.start_date);
      if (dateRange.end_date) params.append('end_date', dateRange.end_date);
      
      const queryString = params.toString();
      const url = queryString ? `${API_BASE_URL}/export-salesman?${queryString}` : `${API_BASE_URL}/export-salesman`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.status} ${response.statusText}`);
      }
      
      // Create a download link for the file
      const blob = await response.blob();
      const urlObject = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlObject;
      link.setAttribute('download', 'salesman-report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed:", err);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const StatCard = ({ title, value, icon, trend, change, secondaryValue, index = 0 }) => {
    return (
      <div className={`p-5 rounded-2xl text-white ${CARD_GRADIENTS[index % CARD_GRADIENTS.length]} shadow-lg`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium opacity-90 mb-1">{title}</h3>
            <div className="text-2xl font-bold">{value || 'N/A'}</div>
            {secondaryValue && <div className="text-xs opacity-80 mt-1">{secondaryValue}</div>}
          </div>
          <div className="p-2 rounded-xl bg-white bg-opacity-20 backdrop-blur-sm">
            {React.cloneElement(icon, { className: "text-white w-5 h-5" })}
          </div>
        </div>
        {trend && change && (
          <div className="flex items-center mt-3 text-xs font-medium">
            <span className="mr-1">
              {trend === 'up' ? 
                <FiTrendingUp className="text-white" /> : 
                <FiTrendingUp className="text-white transform rotate-180" />
              }
            </span>
            <span>{change}</span>
          </div>
        )}
      </div>
    );
  };

  if (isLoading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-indigo-200 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 p-6 ml-0 lg:ml-64">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Sales Dashboard</h1>
            <p className="text-gray-500 mt-1">Track your performance and customer payments</p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            {/* Notifications */}
            <div className="relative">
              <button className="p-2 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow">
                <FiBell className="text-gray-600" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
            </div>
            
            {/* Filter Button */}
            <button 
              onClick={() => setShowDateFilter(!showDateFilter)}
              className="flex items-center gap-2 bg-white text-gray-700 rounded-xl px-4 py-2 text-sm shadow-sm hover:shadow-md transition-shadow"
            >
              <FiFilter className="w-4 h-4" />
              Filter
            </button>
            
            <button 
              onClick={fetchDashboardData}
              disabled={isLoading}
              className="flex items-center gap-2 bg-white text-gray-700 rounded-xl px-4 py-2 text-sm shadow-sm hover:shadow-md transition-shadow disabled:opacity-50"
            >
              <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button 
              onClick={handleExportData}
              disabled={exporting}
              className="flex items-center gap-2 bg-indigo-600 text-white rounded-xl px-4 py-2 text-sm shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <FiDownload className={`w-4 h-4 ${exporting ? 'animate-spin' : ''}`} />
              Export
            </button>
          </div>
        </div>

        {/* Date Filter Dropdown */}
        {showDateFilter && (
          <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-700">Filter by Date Range</h3>
              <button onClick={() => setShowDateFilter(false)}>
                <FiX className="text-gray-500" />
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start_date}
                  onChange={(e) => setDateRange({...dateRange, start_date: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.end_date}
                  onChange={(e) => setDateRange({...dateRange, end_date: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex items-end">
                <button 
                  onClick={() => setDateRange({ start_date: '', end_date: '' })}
                  className="h-10 px-4 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear
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
                <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard 
                title="Total Debts" 
                value={dashboardData.summary.total_debts} 
                icon={<FiTag />}
                index={0}
              />
              <StatCard 
                title="Total Amount" 
                value={`Ksh ${dashboardData.summary.total_amount.toLocaleString()}`} 
                icon={<FiPieChart />}
                index={1}
              />
              <StatCard 
                title="Total Paid" 
                value={`Ksh ${dashboardData.summary.total_paid.toLocaleString()}`} 
                icon={<FiTrendingUp />}
                index={2}
              />
              <StatCard 
                title="Recovery Rate" 
                value={`${dashboardData.summary.recovery_rate.toFixed(1)}%`} 
                icon={<FiTrendingUp />}
                index={3}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Performance vs Target */}
                <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Performance vs Target</h2>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Target: Ksh {dashboardData.performance_vs_target.target_amount.toLocaleString()}</span>
                    <span className="text-sm font-medium text-indigo-600">
                      {dashboardData.performance_vs_target.achievement_percent.toFixed(1)}% Achieved
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(dashboardData.performance_vs_target.achievement_percent, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Collected: Ksh {dashboardData.performance_vs_target.collected.toLocaleString()}</span>
                    <span className="text-gray-600">
                      Remaining: Ksh {(dashboardData.performance_vs_target.target_amount - dashboardData.performance_vs_target.collected).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Status Breakdown */}
                <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Debt Status Breakdown</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(dashboardData.summary.status_breakdown).map(([name, value]) => ({ name, value }))}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={60}
                          outerRadius={80}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {Object.entries(dashboardData.summary.status_breakdown).map(([name], index) => (
                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[name] || COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value} debts`, 'Count']}
                          contentStyle={{ 
                            borderRadius: '8px', 
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend 
                          iconType="circle"
                          iconSize={10}
                          layout="vertical"
                          verticalAlign="middle"
                          align="right"
                          wrapperStyle={{ paddingLeft: '20px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Customer Balances */}
                <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Customer Balances</h2>
                    <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                      View All <FiChevronRight className="ml-1" />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {dashboardData.customers.slice(0, 5).map((customer, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{customer.name}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{customer.phone}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                              Ksh {customer.total_balance.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${customer.status === 'paid' ? 'bg-green-100 text-green-800' : 
                                  customer.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                  customer.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                  'bg-blue-100 text-blue-800'}`}>
                                {customer.status}
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
              <div className="space-y-6">
                {/* Upcoming Payments */}
                <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Upcoming Payments</h2>
                    <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                      View All <FiChevronRight className="ml-1" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {dashboardData.upcoming_payments.slice(0, 5).map((payment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{payment.customer}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Due: {new Date(payment.due_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-sm font-semibold text-indigo-600">
                          Ksh {payment.balance.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Communications */}
                <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Recent Communications</h2>
                    <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                      View All <FiChevronRight className="ml-1" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {dashboardData.communications.slice(0, 5).map((comm, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100">
                        <p className="text-sm text-gray-900">{comm.details}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(comm.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex flex-col items-center justify-center p-3 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
                      <FiMail className="text-indigo-600 mb-2 w-5 h-5" />
                      <span className="text-sm text-indigo-600 font-medium">Send Reminder</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors">
                      <FiUser className="text-emerald-600 mb-2 w-5 h-5" />
                      <span className="text-sm text-emerald-600 font-medium">Add Customer</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-3 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors">
                      <FiDollarSign className="text-amber-600 mb-2 w-5 h-5" />
                      <span className="text-sm text-amber-600 font-medium">Record Payment</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                      <FiClock className="text-purple-600 mb-2 w-5 h-5" />
                      <span className="text-sm text-purple-600 font-medium">Schedule Follow-up</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <FiAlertCircle className="w-8 h-8 text-indigo-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No data available</h3>
            <p className="text-gray-600 mb-4">Could not load dashboard data. Please check your connection.</p>
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

export default SalesmanDashboardDesktop;