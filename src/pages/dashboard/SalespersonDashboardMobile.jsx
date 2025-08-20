import React, { useState, useEffect } from 'react';
import {
  FiRefreshCw, FiAlertCircle, FiCalendar, FiTrendingUp, 
  FiDownload, FiChevronDown, FiChevronUp,
  FiMail, FiClock, FiUser, FiTag, FiDollarSign, FiPieChart,
  FiFilter, FiX, FiPlus, FiBell, FiChevronRight, FiHome,
  FiBarChart2, FiCreditCard, FiMessageSquare
} from "react-icons/fi";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import MobileTopBar from "../../components/mobiletopbar/MobileTopbar";

// API configuration
const API_BASE_URL = 'https://paysync-backend.onrender.com';

const MobileSalespersonDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: ''
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [showFilters, setShowFilters] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailSubject, setEmailSubject] = useState('Salesperson Debt Report');
  const [emailMessage, setEmailMessage] = useState('Please find attached the latest debt report.');

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

  const handleSendEmailReport = () => {
    alert(`Report would be sent to: ${emailRecipient}\nSubject: ${emailSubject}\nMessage: ${emailMessage}`);
    setEmailModalOpen(false);
  };

  const StatCard = ({ title, value, icon, trend, change, secondaryValue, index = 0 }) => {
    return (
      <div className={`p-4 rounded-2xl text-white ${CARD_GRADIENTS[index % CARD_GRADIENTS.length]} shadow-lg`}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-xs font-medium opacity-90 mb-1">{title}</h3>
            <div className="text-lg font-bold">{value || 'N/A'}</div>
            {secondaryValue && <div className="text-xs opacity-80 mt-1">{secondaryValue}</div>}
          </div>
          <div className="p-2 rounded-xl bg-white bg-opacity-20 backdrop-blur-sm flex-shrink-0 ml-2">
            {React.cloneElement(icon, { className: "text-white w-4 h-4" })}
          </div>
        </div>
        {trend && change && (
          <div className="flex items-center mt-2 text-xs font-medium">
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

  const renderOverviewTab = () => (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
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

      {/* Performance vs Target */}
      <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
        <h2 className="text-md font-semibold text-gray-800 mb-3">Performance vs Target</h2>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-600">Target: Ksh {dashboardData.performance_vs_target.target_amount.toLocaleString()}</span>
          <span className="text-xs font-medium text-indigo-600">
            {dashboardData.performance_vs_target.achievement_percent.toFixed(1)}% Achieved
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full" 
            style={{ width: `${Math.min(dashboardData.performance_vs_target.achievement_percent, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Collected: Ksh {dashboardData.performance_vs_target.collected.toLocaleString()}</span>
          <span className="text-gray-600">
            Remaining: Ksh {(dashboardData.performance_vs_target.target_amount - dashboardData.performance_vs_target.collected).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
        <h2 className="text-md font-semibold text-gray-800 mb-3">Debt Status Breakdown</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={Object.entries(dashboardData.summary.status_breakdown).map(([name, value]) => ({ name, value }))}
                dataKey="value"
                nameKey="name"
                innerRadius={40}
                outerRadius={60}
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
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
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {Object.entries(dashboardData.summary.status_breakdown).map(([name, value], index) => (
            <div key={name} className="flex items-center text-xs">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: STATUS_COLORS[name] || COLORS[index % COLORS.length] }}
              ></div>
              <span className="text-gray-600">{name}:</span>
              <span className="font-medium ml-1">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCustomersTab = () => (
    <div className="space-y-4">
      {/* Customer Balances */}
      <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
        <h2 className="text-md font-semibold text-gray-800 mb-3">Customer Balances</h2>
        <div className="space-y-3">
          {dashboardData.customers.slice(0, 6).map((customer, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{customer.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    Ksh {customer.total_balance.toLocaleString()}
                  </p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1
                    ${customer.status === 'paid' ? 'bg-green-100 text-green-800' : 
                      customer.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      customer.status === 'overdue' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'}`}>
                    {customer.status}
                  </span>
                </div>
              </div>
              <div className="flex justify-between mt-3">
                <button className="text-xs text-indigo-600 font-medium flex items-center">
                  <FiMail className="mr-1" /> Remind
                </button>
                <button className="text-xs text-emerald-600 font-medium flex items-center">
                  <FiDollarSign className="mr-1" /> Record Payment
                </button>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-4 text-center text-indigo-600 text-sm font-medium py-2 border border-indigo-100 rounded-lg">
          View All Customers
        </button>
      </div>

      {/* Upcoming Payments */}
      <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
        <h2 className="text-md font-semibold text-gray-800 mb-3">Upcoming Payments</h2>
        <div className="space-y-3">
          {dashboardData.upcoming_payments.slice(0, 5).map((payment, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
    </div>
  );

  const renderActionsTab = () => (
    <div className="space-y-4">
      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
        <h2 className="text-md font-semibold text-gray-800 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <button className="flex flex-col items-center justify-center p-3 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
            <FiMail className="text-indigo-600 mb-2 w-5 h-5" />
            <span className="text-xs text-indigo-600 font-medium text-center">Send Reminder</span>
          </button>
          <button className="flex flex-col items-center justify-center p-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors">
            <FiUser className="text-emerald-600 mb-2 w-5 h-5" />
            <span className="text-xs text-emerald-600 font-medium text-center">Add Customer</span>
          </button>
          <button className="flex flex-col items-center justify-center p-3 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors">
            <FiDollarSign className="text-amber-600 mb-2 w-5 h-5" />
            <span className="text-xs text-amber-600 font-medium text-center">Record Payment</span>
          </button>
          <button className="flex flex-col items-center justify-center p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
            <FiClock className="text-purple-600 mb-2 w-5 h-5" />
            <span className="text-xs text-purple-600 font-medium text-center">Schedule Follow-up</span>
          </button>
        </div>
      </div>

      {/* Recent Communications */}
      <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
        <h2 className="text-md font-semibold text-gray-800 mb-3">Recent Communications</h2>
        <div className="space-y-3">
          {dashboardData.communications.slice(0, 5).map((comm, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-900">{comm.details}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(comm.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Export Data */}
      <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
        <h2 className="text-md font-semibold text-gray-800 mb-3">Export Data</h2>
        <p className="text-sm text-gray-600 mb-3">Export your sales data for reporting or analysis</p>
        <button 
          onClick={handleExportData}
          disabled={exporting}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-lg px-4 py-3 text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          <FiDownload className={`w-4 h-4 ${exporting ? 'animate-spin' : ''}`} />
          {exporting ? 'Exporting...' : 'Export Report'}
        </button>
      </div>
    </div>
  );

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
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header with your custom MobileTopBar */}
      <MobileTopBar
        title="Sales Dashboard"
        isLoading={isLoading}
        onRefresh={fetchDashboardData}
        className="sticky top-0 z-10"
      >
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="p-2 rounded-lg bg-gray-100"
        >
          <FiFilter className="text-gray-600" />
        </button>
        <div className="relative">
          <button className="p-2 rounded-lg bg-gray-100">
            <FiBell className="text-gray-600" />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
        </div>
      </MobileTopBar>

      {/* Date Filter */}
      {showFilters && (
        <div className="bg-gray-50 p-3 mx-4 rounded-lg mt-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-700">Filter by Date</h3>
            <button onClick={() => setShowFilters(false)} className="text-gray-500">
              <FiX className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.start_date}
                onChange={(e) => setDateRange({...dateRange, start_date: e.target.value})}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.end_date}
                onChange={(e) => setDateRange({...dateRange, end_date: e.target.value})}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <button 
              onClick={() => setDateRange({ start_date: '', end_date: '' })}
              className="w-full text-xs text-gray-600 bg-gray-200 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Email Report Modal */}
      {emailModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Send Sales Report</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email</label>
                <input
                  type="email"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="recipient@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  rows="3"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEmailModalOpen(false)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmailReport}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 rounded-r-lg">
            <div className="flex items-center">
              <FiAlertCircle className="text-red-500 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
                <p className="text-xs text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {dashboardData ? (
          <div>
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-4">
              <button 
                className={`flex-1 py-2 text-center text-sm font-medium ${activeTab === 'overview' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button 
                className={`flex-1 py-2 text-center text-sm font-medium ${activeTab === 'customers' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab('customers')}
              >
                Customers
              </button>
              <button 
                className={`flex-1 py-2 text-center text-sm font-medium ${activeTab === 'actions' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab('actions')}
              >
                Actions
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'customers' && renderCustomersTab()}
            {activeTab === 'actions' && renderActionsTab()}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <FiAlertCircle className="w-8 h-8 text-indigo-500" />
            </div>
            <h3 className="text-md font-medium text-gray-800 mb-2">No data available</h3>
            <p className="text-sm text-gray-600 mb-4">Could not load dashboard data</p>
            <button 
              onClick={fetchDashboardData}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2">
        <button 
          className={`flex flex-col items-center px-4 py-1 rounded-lg ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('overview')}
        >
          <FiHome className="w-5 h-5" />
          <span className="text-xs mt-1">Overview</span>
        </button>
        <button 
          className={`flex flex-col items-center px-4 py-1 rounded-lg ${activeTab === 'customers' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('customers')}
        >
          <FiUser className="w-5 h-5" />
          <span className="text-xs mt-1">Customers</span>
        </button>
        <button 
          className={`flex flex-col items-center px-4 py-1 rounded-lg ${activeTab === 'actions' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('actions')}
        >
          <FiBarChart2 className="w-5 h-5" />
          <span className="text-xs mt-1">Actions</span>
        </button>
      </div>
    </div>
  );
};

export default MobileSalespersonDashboard;