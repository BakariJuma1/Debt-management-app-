import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiX,
  FiSearch,
  FiUser,
  FiPhone,
  FiCreditCard,
  FiDollarSign,
  FiCalendar,
  FiMail,
  FiChevronDown,
  FiChevronUp,
  FiGrid,
  FiList,
} from "react-icons/fi";
import { useAuth } from "../../AuthProvider";
import axios from "axios";
import API_BASE_URL from "../../api";
import Layout from "../../components/layout/Layout";

const CustomerManagement = () => {
  const { user, token, isAuthenticated } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("card");
  const [sortField, setSortField] = useState("customer_name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [expandedCustomer, setExpandedCustomer] = useState(null);
  const [customerDebts, setCustomerDebts] = useState({});
  const [loadingDebts, setLoadingDebts] = useState({});
  const [sendingReminders, setSendingReminders] = useState({});
  const [formData, setFormData] = useState({
    customer_name: "",
    phone: "",
    id_number: "",
    email: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Filter and sort customers
  useEffect(() => {
    const customersArray = Array.isArray(customers) ? customers : [];

    let result = [...customersArray];

    if (searchTerm) {
      result = result.filter(
        (customer) =>
          customer.customer_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          customer.phone?.includes(searchTerm) ||
          customer.id_number?.includes(searchTerm)
      );
    }

    result.sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortDirection === "asc" ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredCustomers(result);
  }, [searchTerm, customers, sortField, sortDirection]);

  // Fetch customers on component mount
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchCustomers();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const customersData = response.data?.customers || [];
      setCustomers(Array.isArray(customersData) ? customersData : []);
      setError("");
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError(err.response?.data?.message || "Failed to fetch customers");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch customer debts for a specific customer
  const fetchCustomerDebts = async (customerId) => {
    try {
      setLoadingDebts((prev) => ({ ...prev, [customerId]: true }));
      const response = await axios.get(
        `${API_BASE_URL}/customers/${customerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      let debtsData = [];
      if (Array.isArray(response.data)) {
        debtsData = response.data;
      } else if (response.data?.debts) {
        debtsData = response.data.debts;
      } else if (response.data) {
        debtsData = [response.data];
      }

      setCustomerDebts((prev) => ({
        ...prev,
        [customerId]: debtsData,
      }));
    } catch (err) {
      console.error("Error fetching customer debts:", err);
      setError(err.response?.data?.message || "Failed to fetch customer debts");
    } finally {
      setLoadingDebts((prev) => ({ ...prev, [customerId]: false }));
    }
  };

  // Calculate debt balance
  const calculateDebtBalance = (debt) => {
    if (debt.balance !== undefined && debt.balance !== null) {
      return debt.balance;
    }

    const total = debt.total || 0;
    const amountPaid = debt.amount_paid || 0;
    return Math.max(0, total - amountPaid);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const resetForm = () => {
    setFormData({
      customer_name: "",
      phone: "",
      id_number: "",
    });
    setEditingCustomer(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await axios.put(
          `${API_BASE_URL}/customers/${editingCustomer.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess("Customer updated successfully");
      } else {
        await axios.post(`${API_BASE_URL}/customers`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Customer created successfully");
      }

      resetForm();
      fetchCustomers();
    } catch (err) {
      console.error("Error saving customer:", err);
      setError(err.response?.data?.message || "Failed to save customer");
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      customer_name: customer.customer_name || "",
      phone: customer.phone || "",
      id_number: customer.id_number || "",
      email: customer.email || "",
    });
    setShowAddForm(true);
  };

  const handleDelete = async (customer) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${customer.customer_name}? This action cannot be undone.`
      )
    ) {
      try {
        await axios.delete(`${API_BASE_URL}/customers/${customer.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Customer deleted successfully");
        fetchCustomers();
      } catch (err) {
        console.error("Error deleting customer:", err);
        setError(err.response?.data?.message || "Failed to delete customer");
      }
    }
  };

  const toggleExpand = async (customerId) => {
    if (expandedCustomer === customerId) {
      setExpandedCustomer(null);
    } else {
      setExpandedCustomer(customerId);
      if (!customerDebts[customerId]) {
        await fetchCustomerDebts(customerId);
      }
    }
  };

  // Send reminder for a specific debt
  const sendReminder = async (debtId, customerId) => {
    try {
      setSendingReminders((prev) => ({ ...prev, [debtId]: true }));

      await axios.post(
        `${API_BASE_URL}/reminders/debts/${debtId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Reminder sent successfully");

      // Refresh customer debts
      await fetchCustomerDebts(customerId);
    } catch (err) {
      console.error("Error sending reminder:", err);
      setError(err.response?.data?.message || "Failed to send reminder");
    } finally {
      setSendingReminders((prev) => ({ ...prev, [debtId]: false }));
    }
  };

  const canEdit = () => {
    return user?.role === "owner" || user?.role === "admin";
  };

  const canDelete = () => {
    return user?.role === "owner";
  };

  const formatCurrency = (amount, currency = "KES") => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    })
      .format(amount || 0)
      .replace("KES", "Ksh");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getDebtStatus = (debt) => {
    const balance = calculateDebtBalance(debt);

    if (balance <= 0) return "Paid";

    const dueDate = debt.due_date;
    if (!dueDate) return "Pending";

    const today = new Date();
    const due = new Date(dueDate);

    if (due < today) {
      const diffDays = Math.ceil((today - due) / (1000 * 60 * 60 * 24));
      return `Overdue by ${diffDays} days`;
    }

    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return `Due in ${diffDays} days`;
  };

  const getStatusColor = (status) => {
    if (status.includes("Paid")) return "bg-green-100 text-green-800";
    if (status.includes("Overdue")) return "bg-red-100 text-red-800";
    if (status.includes("Due in")) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 bg-gray-50 min-h-screen ml-10 mt-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
              Customer Management
            </h1>
            <div className="flex space-x-2">
              <div className="flex bg-white rounded-lg border border-gray-300 overflow-hidden">
                <button
                  className={`p-2 ${
                    viewMode === "card"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600"
                  }`}
                  onClick={() => setViewMode("card")}
                  title="Card View"
                >
                  <FiGrid className="h-5 w-5" />
                </button>
                <button
                  className={`p-2 ${
                    viewMode === "table"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600"
                  }`}
                  onClick={() => setViewMode("table")}
                  title="Table View"
                >
                  <FiList className="h-5 w-5" />
                </button>
              </div>
              {canEdit() && (
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition duration-200"
                  onClick={() => setShowAddForm(true)}
                >
                  <FiPlus className="h-5 w-5 mr-2" />
                  Add Customer
                </button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search customers by name, phone, or ID..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FiX className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setError("")}
                    className="text-red-700 hover:text-red-900"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setSuccess("")}
                    className="text-green-700 hover:text-green-900"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add/Edit Customer Form */}
          {showAddForm && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {editingCustomer ? "Edit Customer" : "Add New Customer"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 transition duration-150"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      placeholder="Enter customer name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPhone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Number
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCreditCard className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="id_number"
                      value={formData.id_number}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      placeholder="Enter ID number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email{" "}
                      <span className="text-xs text-gray-500">
                        (optional, but recommended for reminders)
                      </span>
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ""}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 flex items-center"
                  >
                    {editingCustomer ? "Update Customer" : "Add Customer"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Customers Count and Sort */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <p className="text-gray-600 mb-2 sm:mb-0">
              {filteredCustomers.length}{" "}
              {filteredCustomers.length === 1 ? "customer" : "customers"} found
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <div className="flex bg-white rounded-lg border border-gray-300 overflow-hidden">
                <button
                  className={`px-3 py-1 text-sm flex items-center ${
                    sortField === "customer_name"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600"
                  }`}
                  onClick={() => handleSort("customer_name")}
                >
                  Name{" "}
                  {sortField === "customer_name" &&
                    (sortDirection === "asc" ? (
                      <FiChevronUp className="ml-1" />
                    ) : (
                      <FiChevronDown className="ml-1" />
                    ))}
                </button>
                <button
                  className={`px-3 py-1 text-sm flex items-center ${
                    sortField === "phone"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600"
                  }`}
                  onClick={() => handleSort("phone")}
                >
                  Phone{" "}
                  {sortField === "phone" &&
                    (sortDirection === "asc" ? (
                      <FiChevronUp className="ml-1" />
                    ) : (
                      <FiChevronDown className="ml-1" />
                    ))}
                </button>
              </div>
            </div>
          </div>

          {/* Customers Cards View */}
          {viewMode === "card" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {filteredCustomers.length === 0 ? (
                <div className="col-span-full bg-white rounded-lg shadow-sm p-8 text-center">
                  <FiUser className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-lg font-medium text-gray-500">
                    No customers found
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {searchTerm
                      ? "Try adjusting your search"
                      : "Get started by adding your first customer"}
                  </p>
                </div>
              ) : (
                filteredCustomers.map((customer) => {
                  const debts = customerDebts[customer.id] || [];
                  const totalBalance = debts.reduce(
                    (sum, debt) => sum + calculateDebtBalance(debt),
                    0
                  );
                  const outstandingDebts = debts.filter(
                    (debt) => calculateDebtBalance(debt) > 0
                  ).length;

                  return (
                    <div
                      key={customer.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <FiUser className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {customer.customer_name}
                              </h3>
                              <p className="text-sm text-gray-500 flex items-center mt-1">
                                <FiPhone className="mr-2 h-4 w-4" />{" "}
                                {customer.phone}
                              </p>
                              {customer.email && (
                                <p className="text-sm text-gray-500 flex items-center mt-1">
                                  <FiMail className="mr-2 h-4 w-4" />{" "}
                                  {customer.email}
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => toggleExpand(customer.id)}
                            className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
                          >
                            {expandedCustomer === customer.id ? (
                              <FiChevronUp className="h-5 w-5" />
                            ) : (
                              <FiChevronDown className="h-5 w-5" />
                            )}
                          </button>
                        </div>

                        {/* Debt Summary */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              Outstanding Balance
                            </span>
                            {outstandingDebts > 0 && (
                              <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                {outstandingDebts}{" "}
                                {outstandingDebts === 1 ? "debt" : "debts"}
                              </span>
                            )}
                          </div>

                          {outstandingDebts > 0 ? (
                            <div>
                              <p className="text-xl font-bold text-red-600">
                                {formatCurrency(totalBalance)}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Total outstanding balance
                              </p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm text-green-600 font-medium">
                                No outstanding debts
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Customer Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-gray-500">ID Number</p>
                            <p className="text-gray-900 font-medium">
                              {customer.id_number || "N/A"}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                          <div className="flex space-x-2">
                            {canEdit() && (
                              <button
                                onClick={() => handleEdit(customer)}
                                className="text-indigo-600 hover:text-indigo-800 p-2 rounded-full hover:bg-indigo-50 transition duration-150"
                                title="Edit customer"
                              >
                                <FiEdit className="h-4 w-4" />
                              </button>
                            )}
                            {canDelete() && (
                              <button
                                onClick={() => handleDelete(customer)}
                                className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition duration-150"
                                title="Delete customer"
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          <button
                            onClick={() => toggleExpand(customer.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                          >
                            {expandedCustomer === customer.id
                              ? "Hide Details"
                              : "View Details"}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Debt Details */}
                      {expandedCustomer === customer.id && (
                        <div className="border-t border-gray-200 bg-gray-50 p-6">
                          <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                            <FiDollarSign className="mr-2 h-4 w-4" />
                            Debt Details
                          </h4>

                          {loadingDebts[customer.id] ? (
                            <div className="flex justify-center items-center py-8">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            </div>
                          ) : debts.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">
                              <FiDollarSign className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                              <p className="text-sm">
                                No debts found for this customer
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {debts.map((debt) => {
                                const balance = calculateDebtBalance(debt);
                                const status = getDebtStatus(debt);

                                return (
                                  <div
                                    key={debt.id}
                                    className="bg-white rounded-lg p-4 shadow-xs border border-gray-100"
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <p className="font-medium text-gray-900">
                                          INV-
                                          {debt.id.toString().padStart(5, "0")}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                          Due: {formatDate(debt.due_date)}
                                        </p>
                                      </div>
                                      <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                          status
                                        )}`}
                                      >
                                        {status}
                                      </span>
                                    </div>
                                    <div className="mt-3 mb-6">
                                      <h5 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                                        <FiList className="mr-1 h-4 w-4" />
                                        Items Taken
                                      </h5>
                                      {debt.items && debt.items.length > 0 ? (
                                        <ul className="list-disc pl-5 text-sm text-gray-700">
                                          {debt.items.map((item) => (
                                            <li key={item.id}>
                                              {item.name} &mdash; Qty:{" "}
                                              {item.quantity} @{" "}
                                              {formatCurrency(item.price)}
                                            </li>
                                          ))}
                                        </ul>
                                      ) : (
                                        <p className="text-xs text-gray-500">
                                          No items recorded for this debt.
                                        </p>
                                      )}
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                                      <div>
                                        <p className="text-gray-500">Total</p>
                                        <p className="text-gray-900">
                                          {formatCurrency(debt.total || 0)}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500">Paid</p>
                                        <p className="text-green-600">
                                          {formatCurrency(
                                            debt.amount_paid || 0
                                          )}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500">Balance</p>
                                        <p className="text-red-600 font-bold">
                                          {formatCurrency(balance)}
                                        </p>
                                      </div>
                                    </div>

                                    {balance > 0 && (
                                      <div className="flex justify-end">
                                        <button
                                          onClick={() =>
                                            sendReminder(debt.id, customer.id)
                                          }
                                          disabled={sendingReminders[debt.id]}
                                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center disabled:opacity-50"
                                        >
                                          {sendingReminders[debt.id] ? (
                                            <>
                                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-600 mr-1"></div>
                                              Sending...
                                            </>
                                          ) : (
                                            <>
                                              <FiMail className="mr-1 h-3 w-3" />
                                              Send Reminder
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Customers Table View */}
          {viewMode === "table" && (
            <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("customer_name")}
                      >
                        <div className="flex items-center">
                          Name
                          {sortField === "customer_name" &&
                            (sortDirection === "asc" ? (
                              <FiChevronUp className="ml-1" />
                            ) : (
                              <FiChevronDown className="ml-1" />
                            ))}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("phone")}
                      >
                        <div className="flex items-center">
                          Phone
                          {sortField === "phone" &&
                            (sortDirection === "asc" ? (
                              <FiChevronUp className="ml-1" />
                            ) : (
                              <FiChevronDown className="ml-1" />
                            ))}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        ID Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Outstanding Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <FiUser className="h-12 w-12 mb-2 text-gray-300" />
                            <p className="text-lg font-medium">
                              No customers found
                            </p>
                            <p className="text-sm mt-1">
                              {searchTerm
                                ? "Try adjusting your search"
                                : "Get started by adding your first customer"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((customer) => {
                        const debts = customerDebts[customer.id] || [];
                        const totalBalance = debts.reduce(
                          (sum, debt) => sum + calculateDebtBalance(debt),
                          0
                        );

                        return (
                          <tr
                            key={customer.id}
                            className="hover:bg-gray-50 transition duration-150"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <FiUser className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {customer.customer_name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-gray-600">
                                <FiPhone className="mr-2 h-4 w-4 text-gray-400" />
                                {customer.phone}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-gray-600">
                                <FiCreditCard className="mr-2 h-4 w-4 text-gray-400" />
                                {customer.id_number || "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {totalBalance > 0 ? (
                                <span className="text-red-600 font-bold">
                                  {formatCurrency(totalBalance)}
                                </span>
                              ) : (
                                <span className="text-green-600 font-medium">
                                  Paid
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => toggleExpand(customer.id)}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition duration-150"
                                  title="View details"
                                >
                                  <FiEye className="h-5 w-5" />
                                </button>
                                {canEdit() && (
                                  <button
                                    onClick={() => handleEdit(customer)}
                                    className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition duration-150"
                                    title="Edit customer"
                                  >
                                    <FiEdit className="h-5 w-5" />
                                  </button>
                                )}
                                {canDelete() && (
                                  <button
                                    onClick={() => handleDelete(customer)}
                                    className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition duration-150"
                                    title="Delete customer"
                                  >
                                    <FiTrash2 className="h-5 w-5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CustomerManagement;
