import React, { useState } from "react";
import { 
  FiRefreshCw, FiAlertCircle, FiCalendar, FiTrendingUp, 
  FiDownload, FiChevronDown, FiChevronUp, FiMenu,
  FiMail, FiClock, FiUser, FiTag
} from "react-icons/fi";
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ScatterChart, Scatter, ZAxis
} from "recharts";
import MobileTopBar from "../../components/mobiletopbar/MobileTopbar";

const COLORS = ["#00C49F", "#FFBB28", "#FF4F4F"];
const RISK_COLORS = {
  'high': '#FF4F4F',
  'medium': '#FFBB28',
  'low': '#00C49F',
  'reliable': '#4F8BFF'
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
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          <h2 className="text-lg font-semibold">Something went wrong with the dashboard.</h2>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const MobileDashboard = ({
  data = {},
  isLoading = false,
  error = null,
  onRefresh = () => {},
  businessName = "My Business",
  timeRange = "month",
  setTimeRange = () => {}
}) => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailSubject, setEmailSubject] = useState(`${businessName} Debt Report`);
  const [emailMessage, setEmailMessage] = useState(`Please find attached the latest debt report for ${businessName}.`);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Export completed! Data would be downloaded in a real app.');
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  const handleSendEmailReport = () => {
    alert(`Report would be sent to: ${emailRecipient}\nSubject: ${emailSubject}\nMessage: ${emailMessage}`);
    setEmailModalOpen(false);
  };

  const menuItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/debts", label: "All Debts" },
    { path: "/add-debt", label: "Add New Debt" },
    { path: "/settings", label: "Settings" }
  ];

  const StatCard = ({ title, value, icon, trend, change, secondaryValue, variant = 'default' }) => {
    const variantClasses = {
      default: 'bg-white',
      danger: 'bg-red-50',
      warning: 'bg-amber-50',
      success: 'bg-green-50'
    };

    const trendIcons = {
      up: <FiTrendingUp className="text-green-500" />,
      down: <FiTrendingUp className="text-red-500 transform rotate-180" />,
      none: null
    };

    return (
      <div className={`p-4 rounded-lg shadow-sm border ${variantClasses[variant]} ${
        variant === 'default' ? 'border-gray-100' : 
        variant === 'danger' ? 'border-red-100' : 
        variant === 'warning' ? 'border-amber-100' : 
        'border-green-100'
      }`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-gray-500 text-xs font-medium mb-1">{title}</h3>
            <div className="text-lg font-bold text-gray-800">{value || 'N/A'}</div>
            {secondaryValue && <div className="text-xs text-gray-500 mt-1">{secondaryValue}</div>}
          </div>
          <div className="p-1 rounded-md bg-white border border-gray-200">
            {icon}
          </div>
        </div>
        {trend && change && (
          <div className="flex items-center mt-2 text-xs">
            <span className="mr-1">{trendIcons[trend]}</span>
            <span className={trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}>
              {change}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 pb-20">
        <MobileTopBar
          title={`${businessName} Dashboard`}
          isLoading={isLoading}
          onRefresh={onRefresh}
          menuItems={menuItems}
        />

        {/* Controls */}
        <div className="flex gap-2 p-4">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="quarter">Last 90 days</option>
            <option value="year">Last 12 months</option>
          </select>
          <button 
            onClick={() => setEmailModalOpen(true)}
            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <FiMail className="w-4 h-4" />
          </button>
          <button 
            onClick={handleExportData}
            disabled={exporting}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <FiDownload className={`w-4 h-4 ${exporting ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Email Report Modal */}
        {emailModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Send {businessName} Report</h3>
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

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-4 mb-4 rounded-r-lg">
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
        {isLoading && !data?.summary && (
          <div className="flex justify-center items-center h-40">
            <div className="animate-pulse text-gray-500">Loading {businessName} dashboard data...</div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && !data?.summary && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center mx-4 my-4">
            <h3 className="text-lg font-medium text-gray-800 mb-2">No data available</h3>
            <p className="text-gray-600 mb-4">Could not load {businessName} dashboard data</p>
            <button 
              onClick={onRefresh}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Dashboard Content */}
        {!isLoading && data?.summary && (
          <div className="space-y-4 p-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <StatCard 
                title="Total Debts" 
                value={data.summary.total_debts ? `Ksh ${data.summary.total_debts.toLocaleString()}` : 'N/A'} 
                icon={<FiTrendingUp className="text-blue-500" />}
                trend={data.summary?.trends?.total_debts > 0 ? 'up' : 'down'}
                change={data.summary?.trends?.total_debts ? 
                  `${Math.abs(data.summary.trends.total_debts)}%` : ''}
              />

              <StatCard 
                title="Paid Debts" 
                value={data.summary.paid_debts ? `Ksh ${data.summary.paid_debts.toLocaleString()}` : 'N/A'} 
                icon={<FiTrendingUp className="text-green-500" />}
                trend={data.summary?.trends?.paid_debts > 0 ? 'up' : 'down'}
                change={data.summary?.trends?.paid_debts ? 
                  `${Math.abs(data.summary.trends.paid_debts)}%` : ''}
                secondaryValue={data.summary?.paid_count ? `${data.summary.paid_count} paid` : ''}
              />

              <StatCard 
                title="Recovery Rate" 
                value={data.summary.recovery_rate ? `${data.summary.recovery_rate}%` : 'N/A'} 
                icon={<FiTrendingUp className={
                  data.summary.recovery_rate > 75 ? "text-green-500" : 
                  data.summary.recovery_rate > 50 ? "text-amber-500" : "text-red-500"
                } />}
                trend={data.summary.recovery_rate > 75 ? 'up' : data.summary.recovery_rate > 50 ? 'none' : 'down'}
                variant={
                  data.summary.recovery_rate > 75 ? 'success' : 
                  data.summary.recovery_rate > 50 ? 'warning' : 'danger'
                }
              />

              <StatCard 
                title="Avg Repayment Days" 
                value={data.summary.avg_repayment_days || 'N/A'} 
                icon={<FiClock className={
                  data.summary.avg_repayment_days < 30 ? "text-green-500" : 
                  data.summary.avg_repayment_days < 60 ? "text-amber-500" : "text-red-500"
                } />}
                trend={data.summary.avg_repayment_days < 30 ? 'down' : 
                      data.summary.avg_repayment_days < 60 ? 'none' : 'up'}
                variant={
                  data.summary.avg_repayment_days < 30 ? 'success' : 
                  data.summary.avg_repayment_days < 60 ? 'warning' : 'danger'
                }
              />
            </div>

            {/* Trend Chart */}
            <div 
              className="bg-white rounded-lg shadow p-4"
              onClick={() => toggleSection('trendChart')}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Debt Trends</h2>
                {expandedSection === 'trendChart' ? <FiChevronUp /> : <FiChevronDown />}
              </div>
              
              {expandedSection === 'trendChart' && (
                <div className="h-64 mt-4">
                  {data.time_based_analytics ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.time_based_analytics}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [`Ksh ${value.toLocaleString()}`, 'Amount']}
                          labelFormatter={(label) => `Period: ${label}`}
                        />
                        <Bar dataKey="paid" name="Paid" fill="#00C49F" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="unpaid" name="Unpaid" fill="#FFBB28" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="overdue" name="Overdue" fill="#FF4F4F" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No trend data available
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Customer Segmentation */}
            <div 
              className="bg-white rounded-lg shadow p-4"
              onClick={() => toggleSection('customerSegmentation')}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Customer Segmentation</h2>
                {expandedSection === 'customerSegmentation' ? <FiChevronUp /> : <FiChevronDown />}
              </div>
              
              {expandedSection === 'customerSegmentation' && (
                <div className="h-64 mt-4">
                  {data.customer_segmentation ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid />
                        <XAxis type="number" dataKey="debt_amount" name="Debt Amount" unit="Ksh" />
                        <YAxis type="number" dataKey="payment_delay" name="Avg Delay" unit="days" />
                        <ZAxis type="category" dataKey="segment" name="Segment" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter name="High Risk" data={data.customer_segmentation.high || []} fill={RISK_COLORS.high} />
                        <Scatter name="Medium Risk" data={data.customer_segmentation.medium || []} fill={RISK_COLORS.medium} />
                        <Scatter name="Low Risk" data={data.customer_segmentation.low || []} fill={RISK_COLORS.low} />
                        <Scatter name="Reliable" data={data.customer_segmentation.reliable || []} fill={RISK_COLORS.reliable} />
                      </ScatterChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No customer segmentation data available
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Debt Composition */}
            <div 
              className="bg-white rounded-lg shadow p-4"
              onClick={() => toggleSection('debtComposition')}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Debt Composition</h2>
                {expandedSection === 'debtComposition' ? <FiChevronUp /> : <FiChevronDown />}
              </div>
              
              {expandedSection === 'debtComposition' && (
                <div className="mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">By Category</h3>
                      <ul className="space-y-2">
                        {data.debt_composition_by_category?.length > 0 ? (
                          data.debt_composition_by_category.slice(0, 4).map((item, index) => (
                            <li key={index} className="flex justify-between">
                              <span className="text-gray-700 text-sm">{item.category || 'Uncategorized'}</span>
                              <span className="font-medium text-sm">Ksh {item.amount?.toLocaleString() || '0'}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-500 text-sm">No category data</li>
                        )}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Top Debtors</h3>
                      <ul className="space-y-2">
                        {data.customer_segmentation?.top_debtors?.length > 0 ? (
                          data.customer_segmentation.top_debtors.slice(0, 4).map((item, index) => (
                            <li key={index} className="flex justify-between">
                              <span className="text-gray-700 text-sm">{item.customer || 'Unknown'}</span>
                              <span className="font-medium text-sm">Ksh {item.amount?.toLocaleString() || '0'}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-500 text-sm">No debtor data</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Customer Credit Scores */}
            <div 
              className="bg-white rounded-lg shadow p-4"
              onClick={() => toggleSection('creditScores')}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Customer Credit Scores</h2>
                {expandedSection === 'creditScores' ? <FiChevronUp /> : <FiChevronDown />}
              </div>
              
              {expandedSection === 'creditScores' && (
                <ul className="mt-4 space-y-3">
                  {data.customer_segmentation?.top_debtors?.length > 0 ? (
                    data.customer_segmentation.top_debtors.map((debtor, index) => (
                      <li key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            debtor.credit_score >= 80 ? 'bg-green-500' : 
                            debtor.credit_score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                          }`}></div>
                          <div>
                            <span className="font-medium text-gray-800 text-sm block">{debtor.customer || 'Unknown'}</span>
                            {debtor.days_overdue > 0 && (
                              <span className="text-xs text-red-500">{debtor.days_overdue} days overdue</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-red-600 text-sm block">Ksh {debtor.amount?.toLocaleString() || '0'}</span>
                          <span className={`text-xs ${
                            debtor.credit_score >= 80 ? 'text-green-600' : 
                            debtor.credit_score >= 60 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            Score: {debtor.credit_score || 'N/A'}/100
                          </span>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 py-2 text-sm">No customer data available</li>
                  )}
                </ul>
              )}
            </div>

            {/* Communication Logs */}
            <div 
              className="bg-white rounded-lg shadow p-4"
              onClick={() => toggleSection('communicationLogs')}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Recent Communications</h2>
                {expandedSection === 'communicationLogs' ? <FiChevronUp /> : <FiChevronDown />}
              </div>
              
              {expandedSection === 'communicationLogs' && (
                <ul className="mt-4 space-y-3">
                  {data.communication_logs?.length > 0 ? (
                    data.communication_logs.slice(0, 4).map((log, index) => (
                      <li key={index} className="py-2 border-b border-gray-100 last:border-0">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center">
                            <div className={`p-1 rounded mr-2 ${
                              log.type === 'reminder' ? 'bg-blue-100 text-blue-600' :
                              log.type === 'payment' ? 'bg-green-100 text-green-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {log.type === 'reminder' ? <FiClock className="w-3 h-3" /> :
                               log.type === 'payment' ? <FiUser className="w-3 h-3" /> :
                               <FiTag className="w-3 h-3" />}
                            </div>
                            <span className="font-medium text-gray-800 text-sm">{log.customer || 'Unknown'}</span>
                          </div>
                          <span className="text-xs text-gray-500">{log.time || 'Unknown time'}</span>
                        </div>
                        <p className="text-xs text-gray-600 ml-7">{log.message || 'No message content'}</p>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 py-2 text-sm">No communication logs available</li>
                  )}
                </ul>
              )}
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
                        data={[
                          { name: "Paid", value: data.summary.paid_debts || 0 },
                          { name: "Unpaid", value: data.summary.unpaid_debts || 0 },
                          { name: "Overdue", value: data.summary.overdue_debts || 0 }
                        ]}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={80}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`Ksh ${value.toLocaleString()}`, 'Amount']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default MobileDashboard;