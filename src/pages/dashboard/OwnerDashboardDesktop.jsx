import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ScatterChart, Scatter, ZAxis,
  RadialBarChart, RadialBar
} from "recharts";
import MobileDashboard from "./OwnerDashboardMobile";
import { 
  FiRefreshCw, FiAlertCircle, FiCalendar, FiTrendingUp, 
  FiDownload, FiMail, FiClock, FiUser, FiTag, FiChevronRight 
} from "react-icons/fi";
import API_BASE_URL from "../../api";

const DASHBOARD_API_URL = `${API_BASE_URL}/dashboard-owner`;

// Modern color palette
const COLORS = {
  primary: "#4F46E5", // Indigo
  secondary: "#10B981", // Emerald
  accent: "#F59E0B", // Amber
  danger: "#EF4444", // Red
  success: "#10B981", // Emerald
  warning: "#F59E0B", // Amber
  info: "#3B82F6", // Blue
  dark: "#1F2937", // Gray-800
  light: "#F3F4F6" // Gray-100
};

const CHART_COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#3B82F6"];
const RISK_COLORS = {
  'high': '#EF4444',
  'medium': '#F59E0B',
  'low': '#10B981',
  'reliable': '#3B82F6'
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl">
          <h2 className="text-lg font-semibold">Something went wrong with the dashboard.</h2>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

function StatCard({ title, value, icon, trend, change, secondaryValue, variant = 'default' }) {
  const variantClasses = {
    default: 'bg-white border-gray-200',
    danger: 'bg-red-50 border-red-100',
    warning: 'bg-amber-50 border-amber-100',
    success: 'bg-emerald-50 border-emerald-100',
    info: 'bg-blue-50 border-blue-100'
  };

  const trendIcons = {
    up: <FiTrendingUp className="text-emerald-500" />,
    down: <FiTrendingUp className="text-red-500 transform rotate-180" />,
    none: null
  };

  return (
    <div className={`p-5 rounded-xl border ${variantClasses[variant]} transition-all hover:shadow-md`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-gray-500 text-sm font-medium mb-2">{title}</h3>
          <div className="text-2xl font-bold text-gray-800">{value || 'N/A'}</div>
          {secondaryValue && <div className="text-sm text-gray-500 mt-1">{secondaryValue}</div>}
        </div>
        <div className="p-2 rounded-lg bg-white border border-gray-200 shadow-sm">
          {icon}
        </div>
      </div>
      {trend && change && (
        <div className="flex items-center mt-4 text-sm">
          <span className="mr-1">{trendIcons[trend]}</span>
          <span className={trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}>
            {change}
          </span>
        </div>
      )}
    </div>
  );
}

function BusinessOwnerDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [exporting, setExporting] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailSubject, setEmailSubject] = useState('Business Debt Report');
  const [emailMessage, setEmailMessage] = useState('Please find attached the latest business debt report.');
  const [businessName, setBusinessName] = useState('My Business');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  async function fetchDashboardData() {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${DASHBOARD_API_URL}?time_range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message || 
          `Server error: ${res.status} ${res.statusText}`
        );
      }

      const data = await res.json();
      
      if (!data?.summary) {
        throw new Error('Invalid response format from server');
      }
      
      setDashboardData(data);
      if (data.business_name) {
        setBusinessName(data.business_name);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message);
      setDashboardData(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function exportData() {
    setExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Export completed! Data would be downloaded in a real app.');
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  }

  function sendEmailReport() {
    alert(`Report would be sent to: ${emailRecipient}\nSubject: ${emailSubject}\nMessage: ${emailMessage}`);
    setEmailModalOpen(false);
  }

  if (isMobile) {
    return (
      <MobileDashboard
        data={dashboardData}
        isLoading={isLoading}
        error={error}
        onRefresh={fetchDashboardData}
        businessName={businessName}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8 ml-64 mt-18">
        {/* Header with Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{businessName} Dashboard</h1>
            <p className="text-gray-600">Comprehensive overview of your business finances</p>
          </div>
          <div className="flex flex-wrap gap-3">
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
            <button 
              onClick={fetchDashboardData}
              disabled={isLoading}
              className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
            <button 
              onClick={() => setEmailModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-emerald-700 transition-colors"
            >
              <FiMail className="w-4 h-4" />
              Email Report
            </button>
            <button 
              onClick={exportData}
              disabled={exporting}
              className="flex items-center gap-2 bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              <FiDownload className={`w-4 h-4 ${exporting ? 'animate-spin' : ''}`} />
              Export Data
            </button>
          </div>
        </div>

        {/* Email Report Modal */}
        {emailModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Send {businessName} Report</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email</label>
                  <input
                    type="email"
                    value={emailRecipient}
                    onChange={(e) => setEmailRecipient(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    placeholder="recipient@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
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
              <FiAlertCircle className="text-red-500 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
                <p className="text-sm text-red-700">{error}</p>
                <button 
                  onClick={fetchDashboardData}
                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !dashboardData && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-gray-500">Loading {businessName} dashboard data...</div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && !dashboardData && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
            <h3 className="text-lg font-medium text-gray-800 mb-2">No data available</h3>
            <p className="text-gray-600 mb-4">Could not load {businessName} dashboard data</p>
            <button 
              onClick={fetchDashboardData}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Dashboard Content */}
        {!isLoading && dashboardData && (
          <ErrorBoundary>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                title="Total Debts" 
                value={dashboardData.summary?.total_debts ? `Ksh ${dashboardData.summary.total_debts.toLocaleString()}` : 'N/A'} 
                icon={<FiTrendingUp className="text-indigo-500" />}
                trend={dashboardData.summary?.trends?.total_debts > 0 ? 'up' : 'down'}
                change={dashboardData.summary?.trends?.total_debts ? 
                  `${Math.abs(dashboardData.summary.trends.total_debts)}% from last period` : ''}
              />

              <StatCard 
                title="Paid Debts" 
                value={dashboardData.summary?.paid_debts ? `Ksh ${dashboardData.summary.paid_debts.toLocaleString()}` : 'N/A'} 
                icon={<FiTrendingUp className="text-emerald-500" />}
                trend={dashboardData.summary?.trends?.paid_debts > 0 ? 'up' : 'down'}
                change={dashboardData.summary?.trends?.paid_debts ? 
                  `${Math.abs(dashboardData.summary.trends.paid_debts)}% from last period` : ''}
                secondaryValue={dashboardData.summary?.paid_count ? `${dashboardData.summary.paid_count} paid` : ''}
              />

              <StatCard 
                title="Recovery Rate" 
                value={dashboardData.summary?.recovery_rate ? `${dashboardData.summary.recovery_rate}%` : 'N/A'} 
                icon={<FiTrendingUp className={
                  dashboardData.summary?.recovery_rate > 75 ? "text-emerald-500" : 
                  dashboardData.summary?.recovery_rate > 50 ? "text-amber-500" : "text-red-500"
                } />}
                trend={dashboardData.summary?.recovery_rate > 75 ? 'up' : dashboardData.summary?.recovery_rate > 50 ? 'none' : 'down'}
                variant={
                  dashboardData.summary?.recovery_rate > 75 ? 'success' : 
                  dashboardData.summary?.recovery_rate > 50 ? 'warning' : 'danger'
                }
              />

              <StatCard 
                title="Upcoming Due" 
                value={dashboardData.upcoming_due_payments?.total_amount ? `Ksh ${dashboardData.upcoming_due_payments.total_amount.toLocaleString()}` : 'N/A'} 
                icon={<FiCalendar className="text-amber-500" />}
                trend={dashboardData.upcoming_due_payments?.count > 0 ? 'up' : 'none'}
                change={dashboardData.upcoming_due_payments?.count ? `${dashboardData.upcoming_due_payments.count} this week` : ''}
                variant="warning"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Trend Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">{businessName} Debt Trends</h2>
                    <div className="text-sm text-gray-500">
                      {timeRange === 'week' ? 'Last 7 days' : 
                       timeRange === 'month' ? 'Last 30 days' :
                       timeRange === 'quarter' ? 'Last 90 days' : 'Last 12 months'}
                    </div>
                  </div>
                  <div className="h-64">
                    {dashboardData.time_based_analytics ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dashboardData.time_based_analytics}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                          <XAxis dataKey="period" stroke="#6B7280" />
                          <YAxis stroke="#6B7280" />
                          <Tooltip 
                            formatter={(value) => [`Ksh ${value.toLocaleString()}`, 'Amount']}
                            labelFormatter={(label) => `Period: ${label}`}
                            contentStyle={{
                              background: '#FFFFFF',
                              border: '1px solid #E5E7EB',
                              borderRadius: '0.5rem',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                          <Bar dataKey="paid" name="Paid" fill="#10B981" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="unpaid" name="Unpaid" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="overdue" name="Overdue" fill="#EF4444" radius={[4, 4, 0, 0]} />
                          <Legend />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No trend data available
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Segmentation */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Customer Risk Analysis</h2>
                    <button className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors flex items-center">
                      View All <FiChevronRight className="ml-1" />
                    </button>
                  </div>
                  <div className="h-64">
                    {dashboardData.customer_segmentation ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                          <CartesianGrid stroke="#F3F4F6" />
                          <XAxis type="number" dataKey="debt_amount" name="Debt Amount" unit="Ksh" stroke="#6B7280" />
                          <YAxis type="number" dataKey="payment_delay" name="Avg Delay" unit="days" stroke="#6B7280" />
                          <ZAxis type="category" dataKey="segment" name="Segment" />
                          <Tooltip 
                            cursor={{ strokeDasharray: '3 3' }} 
                            contentStyle={{
                              background: '#FFFFFF',
                              border: '1px solid #E5E7EB',
                              borderRadius: '0.5rem',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                          <Legend />
                          <Scatter name="High Risk" data={dashboardData.customer_segmentation.high || []} fill={RISK_COLORS.high} />
                          <Scatter name="Medium Risk" data={dashboardData.customer_segmentation.medium || []} fill={RISK_COLORS.medium} />
                          <Scatter name="Low Risk" data={dashboardData.customer_segmentation.low || []} fill={RISK_COLORS.low} />
                          <Scatter name="Reliable" data={dashboardData.customer_segmentation.reliable || []} fill={RISK_COLORS.reliable} />
                        </ScatterChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No customer segmentation data available
                      </div>
                    )}
                  </div>
                </div>

                {/* Debt Composition Analysis */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Debt Composition</h2>
                    <button className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors flex items-center">
                      View Details <FiChevronRight className="ml-1" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">By Category</h3>
                      <ul className="space-y-2">
                        {dashboardData.debt_composition_by_category?.length > 0 ? (
                          dashboardData.debt_composition_by_category.slice(0, 4).map((item, index) => (
                            <li key={index} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                              <span className="text-gray-700">{item.category || 'Uncategorized'}</span>
                              <span className="font-medium">Ksh {item.amount?.toLocaleString() || '0'}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-500 py-2">No category data</li>
                        )}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Top Debtors</h3>
                      <ul className="space-y-2">
                        {dashboardData.customer_segmentation?.top_debtors?.length > 0 ? (
                          dashboardData.customer_segmentation.top_debtors.slice(0, 4).map((item, index) => (
                            <li key={index} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                              <span className="text-gray-700">{item.customer || 'Unknown'}</span>
                              <span className="font-medium">Ksh {item.amount?.toLocaleString() || '0'}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-500 py-2">No debtor data</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>  
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Recovery Progress */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Recovery Progress</h2>
                  <div className="h-64">
                    {dashboardData.summary ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart 
                          innerRadius="20%" 
                          outerRadius="100%" 
                          data={[
                            { name: 'Paid', value: dashboardData.summary.paid_debts || 0, fill: '#10B981' },
                            { name: 'Unpaid', value: dashboardData.summary.unpaid_debts || 0, fill: '#F59E0B' },
                            { name: 'Overdue', value: dashboardData.summary.overdue_debts || 0, fill: '#EF4444' }
                          ]}
                          startAngle={180}
                          endAngle={0}
                        >
                          <RadialBar 
                            dataKey="value" 
                            cornerRadius={10}
                            background
                          />
                          <Legend 
                            iconSize={10}
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                          />
                          <Tooltip 
                            formatter={(value) => [`Ksh ${value.toLocaleString()}`, 'Amount']}
                            contentStyle={{
                              background: '#FFFFFF',
                              border: '1px solid #E5E7EB',
                              borderRadius: '0.5rem',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                        </RadialBarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No recovery data available
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Credit Scores */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Customer Credit Scores</h2>
                  <ul className="space-y-3">
                    {dashboardData.customer_segmentation?.top_debtors?.length > 0 ? (
                      dashboardData.customer_segmentation.top_debtors.map((debtor, index) => (
                        <li key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-2 rounded-lg transition-colors">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-3 ${
                              debtor.credit_score >= 80 ? 'bg-emerald-500' : 
                              debtor.credit_score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                            }`}></div>
                            <div>
                              <span className="font-medium text-gray-800 block">{debtor.customer || 'Unknown'}</span>
                              {debtor.days_overdue > 0 && (
                                <span className="text-xs text-red-500">{debtor.days_overdue} days overdue</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-red-600 block">Ksh {debtor.amount?.toLocaleString() || '0'}</span>
                            <span className={`text-xs ${
                              debtor.credit_score >= 80 ? 'text-emerald-600' : 
                              debtor.credit_score >= 60 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              Score: {debtor.credit_score || 'N/A'}/100
                            </span>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500 py-2">No customer data available</li>
                    )}
                  </ul>
                </div>

                {/* Communication Logs */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Recent Communications</h2>
                    <button className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors flex items-center">
                      View All <FiChevronRight className="ml-1" />
                    </button>
                  </div>
                  <ul className="space-y-3">
                    {dashboardData.communication_logs?.length > 0 ? (
                      dashboardData.communication_logs.slice(0, 4).map((log, index) => (
                        <li key={index} className="py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-2 rounded-lg transition-colors">
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center">
                              <div className={`p-1 rounded mr-2 ${
                                log.type === 'reminder' ? 'bg-blue-100 text-blue-600' :
                                log.type === 'payment' ? 'bg-emerald-100 text-emerald-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {log.type === 'reminder' ? <FiClock className="w-3 h-3" /> :
                                 log.type === 'payment' ? <FiUser className="w-3 h-3" /> :
                                 <FiTag className="w-3 h-3" />}
                              </div>
                              <span className="font-medium text-gray-800">{log.customer || 'Unknown'}</span>
                            </div>
                            <span className="text-xs text-gray-500">{log.time || 'Unknown time'}</span>
                          </div>
                          <p className="text-sm text-gray-600 ml-7">{log.message || 'No message content'}</p>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500 py-2">No communication logs available</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
}

export default BusinessOwnerDashboard;