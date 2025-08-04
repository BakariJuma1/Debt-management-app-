import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ScatterChart, Scatter, ZAxis
} from "recharts";
import MobileDashboard from "./MobileDashboard";
import { 
  FiRefreshCw, FiAlertCircle, FiCalendar, FiTrendingUp, 
  FiDownload, FiMail, FiClock, FiUser, FiTag 
} from "react-icons/fi";
import Search from "../../components/search/Search";

const API_URL = "https://debt-backend-lj7p.onrender.com/api/debts";
const COLORS = ["#00C49F", "#FFBB28", "#FF4F4F"];
const RISK_COLORS = {
  'high': '#FF4F4F',
  'medium': '#FFBB28',
  'low': '#00C49F',
  'reliable': '#4F8BFF'
};

export default function Dashboard() {
  const [debts, setDebts] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [exporting, setExporting] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailSubject, setEmailSubject] = useState('Debt Report');
  const [emailMessage, setEmailMessage] = useState('Please find attached the latest debt report.');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchDebts();
  }, []);

  async function fetchDebts() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch debts');
      const data = await res.json();
      setDebts(data);
    } catch (err) {
      console.error("Error fetching debts:", err);
      setError(err.message);
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
    // In a real app, this would send the email with the report
    alert(`Report would be sent to: ${emailRecipient}\nSubject: ${emailSubject}\nMessage: ${emailMessage}`);
    setEmailModalOpen(false);
  }

  // === Calculations ===
  const totalDebts = debts.reduce((sum, d) => sum + d.total, 0);
  const paidDebts = debts.filter((d) => d.status === "paid");
  const unpaidDebts = debts.filter((d) => d.status === "unpaid");
  const overdueDebts = debts.filter((d) => d.status === "overdue");
  const totalPaid = paidDebts.reduce((sum, d) => sum + d.total, 0);
  const totalOverdue = overdueDebts.reduce((sum, d) => sum + d.total, 0);
  const totalUnpaid = totalDebts - totalPaid;
  const paidPercentage = totalDebts ? Math.round((totalPaid / totalDebts) * 100) : 0;
  
  // New metrics
  const avgRepaymentPeriod = calculateAverageRepaymentPeriod(paidDebts);
  const debtRecoveryRate = calculateDebtRecoveryRate(debts);
  
  // Customer segmentation
  const customerSegmentation = segmentCustomers(debts);
  
  // Communication logs (mock data - in a real app this would come from API)
  const communicationLogs = generateCommunicationLogs(debts);
  
  // Debt composition analysis
  const debtComposition = analyzeDebtComposition(debts);
  
  // Generate trend data based on selected time range
  const trendData = generateTrendData(debts, timeRange);
  
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
      daysOverdue: d.dueDate ? Math.floor((new Date() - new Date(d.dueDate)) / (1000 * 60 * 60 * 24)) : 0,
      creditScore: calculateCreditScore(d.customerName, debts)
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
      daysUntilDue: Math.floor((new Date(d.dueDate) - today) / (1000 * 60 * 60 * 24))
    }));

  const activity = [...debts]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    .slice(0, 5)
    .map((d) => ({
      customer: d.customerName,
      action: d.status === "paid" ? "Marked as paid" : "Added new debt",
      date: new Date(d.updatedAt || d.createdAt).toLocaleDateString(),
      amount: d.total
    }));

  // === Mobile/Desktop Switch ===
  if (isMobile) {
    return (
      <MobileDashboard
        debts={debts}
        totalDebts={totalDebts}
        totalPaid={totalPaid}
        totalUnpaid={totalUnpaid}
        overdueDebts={overdueDebts}
        paidDebts={paidDebts}
        activity={activity}
        topDebtors={topDebtors}
        upcoming={upcoming}
        isLoading={isLoading}
        error={error}
        onRefresh={fetchDebts}
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
            <h1 className="text-3xl font-bold text-gray-800">Debt Management Dashboard</h1>
            <p className="text-gray-600">Comprehensive overview of your  debt tracking</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="quarter">Last 90 days</option>
              <option value="year">Last 12 months</option>
            </select>
            <button 
              onClick={fetchDebts}
              disabled={isLoading}
              className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
            <button 
              onClick={() => setEmailModalOpen(true)}
              className="flex items-center gap-2 bg-green-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-green-700"
            >
              <FiMail className="w-4 h-4" />
              Email Report
            </button>
            <button 
              onClick={exportData}
              disabled={exporting}
              className="flex items-center gap-2 bg-blue-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              <FiDownload className={`w-4 h-4 ${exporting ? 'animate-spin' : ''}`} />
              Export Data
            </button>
          </div>
        </div>

        {/* Email Report Modal */}
        {emailModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Send Report via Email</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email</label>
                  <input
                    type="email"
                    value={emailRecipient}
                    onChange={(e) => setEmailRecipient(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="recipient@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows="3"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setEmailModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={sendEmailReport}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
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
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !debts.length && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-gray-500">Loading dashboard data...</div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && !debts.length && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
            <h3 className="text-lg font-medium text-gray-800 mb-2">No debt records found</h3>
            <p className="text-gray-600 mb-4">Start by adding your first debt record</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
              Add New Debt
            </button>
          </div>
        )}

        {/* Dashboard Content */}
        {!isLoading && debts.length > 0 && (
          <>
            {/* Stats Grid - Expanded with new metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              {/* Total Debts */}
              <StatCard 
                title="Total Debts" 
                value={`Ksh ${totalDebts.toLocaleString()}`} 
                icon={<FiTrendingUp className="text-blue-500" />}
                trend="up"
                change="12% from last month"
              />

              {/* Paid Debts */}
              <StatCard 
                title="Paid Debts" 
                value={`Ksh ${totalPaid.toLocaleString()}`} 
                icon={<FiTrendingUp className="text-green-500" />}
                trend="up"
                change={`${paidPercentage}% of total`}
                secondaryValue={`${paidDebts.length} paid`}
              />

              {/* Collection Efficiency */}
              <StatCard 
                title="Recovery Rate" 
                value={`${debtRecoveryRate}%`} 
                icon={<FiTrendingUp className={debtRecoveryRate > 75 ? "text-green-500" : debtRecoveryRate > 50 ? "text-amber-500" : "text-red-500"} />}
                trend={debtRecoveryRate > 75 ? 'up' : debtRecoveryRate > 50 ? 'none' : 'down'}
                change={debtRecoveryRate > 75 ? 'Excellent' : debtRecoveryRate > 50 ? 'Average' : 'Needs improvement'}
                variant={debtRecoveryRate > 75 ? 'success' : debtRecoveryRate > 50 ? 'warning' : 'danger'}
              />

              {/* Average Repayment */}
              <StatCard 
                title="Avg Repayment Days" 
                value={avgRepaymentPeriod} 
                icon={<FiClock className={avgRepaymentPeriod < 30 ? "text-green-500" : avgRepaymentPeriod < 60 ? "text-amber-500" : "text-red-500"} />}
                trend={avgRepaymentPeriod < 30 ? 'down' : avgRepaymentPeriod < 60 ? 'none' : 'up'}
                change={avgRepaymentPeriod < 30 ? 'Fast' : avgRepaymentPeriod < 60 ? 'Moderate' : 'Slow'}
                variant={avgRepaymentPeriod < 30 ? 'success' : avgRepaymentPeriod < 60 ? 'warning' : 'danger'}
              />

              {/* Upcoming Debts */}
              <StatCard 
                title="Upcoming Due" 
                value={`Ksh ${upcoming.reduce((s, d) => s + d.amount, 0).toLocaleString()}`} 
                icon={<FiCalendar className="text-amber-500" />}
                trend={upcoming.length > 0 ? 'up' : 'none'}
                change={`${upcoming.length} this week`}
                variant="warning"
              />
            </div>

            {/* Main Content Grid - Expanded with new sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Trend Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Debt Trends</h2>
                    <div className="text-sm text-gray-500">
                      {timeRange === 'week' ? 'Last 7 days' : 
                       timeRange === 'month' ? 'Last 30 days' :
                       timeRange === 'quarter' ? 'Last 90 days' : 'Last 12 months'}
                    </div>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [`Ksh ${value.toLocaleString()}`, 'Amount']}
                          labelFormatter={(label) => `Period: ${label}`}
                        />
                        <Bar dataKey="paid" name="Paid" fill="#00C49F" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="unpaid" name="Unpaid" fill="#FFBB28" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="overdue" name="Overdue" fill="#FF4F4F" radius={[4, 4, 0, 0]} />
                        <Legend />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Customer Segmentation */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Customer Segmentation</h2>
                    <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      >
                        <CartesianGrid />
                        <XAxis type="number" dataKey="debtAmount" name="Debt Amount" unit="Ksh" />
                        <YAxis type="number" dataKey="paymentDelay" name="Avg Delay" unit="days" />
                        <ZAxis type="category" dataKey="segment" name="Segment" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Legend />
                        <Scatter name="High Risk" data={customerSegmentation.high} fill={RISK_COLORS.high} />
                        <Scatter name="Medium Risk" data={customerSegmentation.medium} fill={RISK_COLORS.medium} />
                        <Scatter name="Low Risk" data={customerSegmentation.low} fill={RISK_COLORS.low} />
                        <Scatter name="Reliable" data={customerSegmentation.reliable} fill={RISK_COLORS.reliable} />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Debt Composition Analysis */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Debt Composition</h2>
                    <button className="text-sm text-blue-600 hover:text-blue-800">View Details</button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">By Product Category</h3>
                      <ul className="space-y-2">
                        {debtComposition.byCategory.slice(0, 4).map((item, index) => (
                          <li key={index} className="flex justify-between">
                            <span className="text-gray-700">{item.category || 'Uncategorized'}</span>
                            <span className="font-medium">Ksh {item.amount.toLocaleString()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">By Product</h3>
                      <ul className="space-y-2">
                        {debtComposition.byProduct.slice(0, 4).map((item, index) => (
                          <li key={index} className="flex justify-between">
                            <span className="text-gray-700">{item.product || 'Unknown'}</span>
                            <span className="font-medium">Ksh {item.amount.toLocaleString()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Customer Credit Scores */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Customer Credit Scores</h2>
                  <ul className="space-y-3">
                    {topDebtors.map((debtor, index) => (
                      <li key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${
                            debtor.creditScore >= 80 ? 'bg-green-500' : 
                            debtor.creditScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
                          }`}></div>
                          <div>
                            <span className="font-medium text-gray-800 block">{debtor.name}</span>
                            {debtor.daysOverdue > 0 && (
                              <span className="text-xs text-red-500">{debtor.daysOverdue} days overdue</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-red-600 block">Ksh {debtor.balance.toLocaleString()}</span>
                          <span className={`text-xs ${
                            debtor.creditScore >= 80 ? 'text-green-600' : 
                            debtor.creditScore >= 60 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            Score: {debtor.creditScore}/100
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Communication Logs */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Recent Communications</h2>
                    <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
                  </div>
                  <ul className="space-y-3">
                    {communicationLogs.slice(0, 4).map((log, index) => (
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
                            <span className="font-medium text-gray-800">{log.customer}</span>
                          </div>
                          <span className="text-xs text-gray-500">{log.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 ml-7">{log.message}</p>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Automated reminders:</span>
                      <span className="text-sm font-medium text-green-600">Active</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-gray-600">Next batch:</span>
                      <span className="text-sm text-gray-600">Tomorrow at 9:00 AM</span>
                    </div>
                  </div>
                </div>

                {/* Debt Status Pie Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Debt Status</h2>
                  <div className="h-64">
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
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Helper functions for new metrics
function calculateAverageRepaymentPeriod(paidDebts) {
  if (paidDebts.length === 0) return 0;
  
  const totalDays = paidDebts.reduce((sum, debt) => {
    if (!debt.createdAt || !debt.updatedAt) return sum;
    const created = new Date(debt.createdAt);
    const paid = new Date(debt.updatedAt);
    const days = Math.ceil((paid - created) / (1000 * 60 * 60 * 24));
    return sum + days;
  }, 0);
  
  return Math.round(totalDays / paidDebts.length);
}

function calculateDebtRecoveryRate(debts) {
  const paid = debts.filter(d => d.status === 'paid').length;
  const total = debts.length;
  return total > 0 ? Math.round((paid / total) * 100) : 0;
}

function segmentCustomers(debts) {
  // This is a simplified segmentation - in a real app you'd use more sophisticated criteria
  const customers = {};
  
  debts.forEach(debt => {
    if (!customers[debt.customerName]) {
      customers[debt.customerName] = {
        totalDebt: 0,
        paidDebt: 0,
        overdueCount: 0,
        paymentDelays: []
      };
    }
    
    if (debt.status === 'paid') {
      customers[debt.customerName].paidDebt += debt.total;
      if (debt.dueDate && debt.updatedAt) {
        const due = new Date(debt.dueDate);
        const paid = new Date(debt.updatedAt);
        const delay = Math.max(0, Math.ceil((paid - due) / (1000 * 60 * 60 * 24)));
        customers[debt.customerName].paymentDelays.push(delay);
      }
    } else if (debt.status === 'overdue') {
      customers[debt.customerName].overdueCount++;
    }
    customers[debt.customerName].totalDebt += debt.total;
  });
  
  const segments = {
    high: [],
    medium: [],
    low: [],
    reliable: []
  };
  
  Object.entries(customers).forEach(([name, data]) => {
    const avgDelay = data.paymentDelays.length > 0 ? 
      data.paymentDelays.reduce((a, b) => a + b, 0) / data.paymentDelays.length : 0;
    const paidRatio = data.totalDebt > 0 ? data.paidDebt / data.totalDebt : 1;
    
    const point = {
      customer: name,
      debtAmount: data.totalDebt,
      paymentDelay: avgDelay,
      segment: ''
    };
    
    if (paidRatio < 0.5 || data.overdueCount > 2) {
      point.segment = 'high';
      segments.high.push(point);
    } else if (avgDelay > 30 || paidRatio < 0.8) {
      point.segment = 'medium';
      segments.medium.push(point);
    } else if (avgDelay > 7 || paidRatio < 1) {
      point.segment = 'low';
      segments.low.push(point);
    } else {
      point.segment = 'reliable';
      segments.reliable.push(point);
    }
  });
  
  return segments;
}

function calculateCreditScore(customerName, debts) {
  // Simplified credit score calculation
  const customerDebts = debts.filter(d => d.customerName === customerName);
  if (customerDebts.length === 0) return 100;
  
  const paidCount = customerDebts.filter(d => d.status === 'paid').length;
  const overdueCount = customerDebts.filter(d => d.status === 'overdue').length;
  const unpaidCount = customerDebts.filter(d => d.status === 'unpaid').length;
  
  let score = 80; // Base score
  
  // Positive factors
  score += (paidCount / customerDebts.length) * 20;
  
  // Negative factors
  score -= overdueCount * 5;
  score -= unpaidCount * 2;
  
  // Ensure score is between 0 and 100
  return Math.min(100, Math.max(0, Math.round(score)));
}

function generateCommunicationLogs(debts) {
  // Mock communication logs - in a real app this would come from your API
  const logs = [];
  const customers = [...new Set(debts.map(d => d.customerName))];
  const types = ['reminder', 'payment', 'general'];
  const messages = [
    "Payment reminder sent for invoice #INV-2023-001",
    "Payment received for Ksh 15,000",
    "Follow-up call about overdue payment",
    "Email sent with payment options",
    "SMS reminder about upcoming due date"
  ];
  
  customers.slice(0, 5).forEach(customer => {
    const count = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < count; i++) {
      const hoursAgo = Math.floor(Math.random() * 48);
      logs.push({
        customer,
        type: types[Math.floor(Math.random() * types.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        time: `${hoursAgo} ${hoursAgo === 1 ? 'hour' : 'hours'} ago`
      });
    }
  });
  
  return logs.sort((a, b) => {
    const aHours = parseInt(a.time);
    const bHours = parseInt(b.time);
    return aHours - bHours;
  });
}

function analyzeDebtComposition(debts) {
  // Group by category
  const byCategory = {};
  // Group by product
  const byProduct = {};
  
  debts.forEach(debt => {
    // Category analysis
    const category = debt.category || 'Uncategorized';
    if (!byCategory[category]) byCategory[category] = 0;
    byCategory[category] += debt.total;
    
    // Product analysis
    const product = debt.product || 'Unknown';
    if (!byProduct[product]) byProduct[product] = 0;
    byProduct[product] += debt.total;
  });
  
  // Convert to array and sort
  const categoryArray = Object.entries(byCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
    
  const productArray = Object.entries(byProduct)
    .map(([product, amount]) => ({ product, amount }))
    .sort((a, b) => b.amount - a.amount);
  
  return {
    byCategory: categoryArray,
    byProduct: productArray
  };
}

// Stat Card Component (unchanged)
function StatCard({ title, value, icon, trend, change, secondaryValue, variant = 'default' }) {
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
    <div className={`p-6 rounded-xl shadow-sm border ${variantClasses[variant]} ${variant === 'default' ? 'border-gray-100' : variant === 'danger' ? 'border-red-100' : variant === 'warning' ? 'border-amber-100' : 'border-green-100'}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-gray-500 text-sm font-medium mb-2">{title}</h3>
          <div className="text-2xl font-bold text-gray-800">{value}</div>
          {secondaryValue && <div className="text-sm text-gray-500 mt-1">{secondaryValue}</div>}
        </div>
        <div className="p-2 rounded-lg bg-white border border-gray-200">
          {icon}
        </div>
      </div>
      {trend && change && (
        <div className="flex items-center mt-4 text-sm">
          <span className="mr-1">{trendIcons[trend]}</span>
          <span className={trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}>
            {change}
          </span>
        </div>
      )}
    </div>
  );
}

// Helper function to generate trend data (unchanged)
function generateTrendData(debts, range) {
  const periods = range === 'week' ? 7 : 
                  range === 'month' ? 4 : 
                  range === 'quarter' ? 3 : 12;
  
  return Array.from({ length: periods }, (_, i) => {
    const periodName = range === 'week' ? `Day ${i+1}` :
                      range === 'month' ? `Week ${i+1}` :
                      range === 'quarter' ? `Month ${i+1}` : 
                      new Date(new Date().setMonth(new Date().getMonth() - (periods - 1 - i))).toLocaleString('default', { month: 'short' });
    
    const paid = Math.floor(Math.random() * 10000) + 5000;
    const unpaid = Math.floor(Math.random() * 5000) + 2000;
    const overdue = Math.floor(Math.random() * 3000);
    
    return {
      name: periodName,
      paid,
      unpaid,
      overdue
    };
  });
}