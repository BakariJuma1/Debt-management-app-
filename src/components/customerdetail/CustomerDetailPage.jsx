import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaMoneyBillAlt,
  FaFilePdf,
  FaEnvelope,
  FaListUl,
  FaHistory,
  FaTrash,
  FaArrowLeft,
  FaPlus,
  FaSave,
  FaEdit,
} from "react-icons/fa";
import {
  FiMoreVertical,
  FiChevronDown,
  FiChevronUp,
  FiDollarSign,
  FiShoppingCart,
  FiUser,
  FiCreditCard,
  FiCheckCircle,
} from "react-icons/fi";
import Layout from "../layout/Layout";
import API_BASE_URL from "../../api";
import { useAuth } from "../../AuthProvider";

function CustomerDetailPage() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [debt, setDebt] = useState(null);

  const [customer, setCustomer] = useState(null);
  const [editedItems, setEditedItems] = useState([]);
  const [changeLogs, setChangeLogs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [newPayment, setNewPayment] = useState({
    amount: "",
    method: "",
  });
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    price: "",
    category: "",
  });
  const [activeTab, setActiveTab] = useState("items");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    addItem: false,
    addPayment: false,
  });
  const [createdByUser, setCreatedByUser] = useState(null);



  useEffect(() => {
    async function fetchCustomerData() {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE_URL}/debts/${customerId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 403) {
            throw new Error(
              "Access denied. You don't have permission to view this customer."
            );
          }
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const customerData = await res.json();

        if (
          user.role === "salesperson" &&
          customerData.created_by !== user.id
        ) {
          throw new Error(
            "Access denied. You can only view your own customers."
          );
        }
        
        setDebt(customerData);
        setCustomer(customerData.customer);
        setEditedItems(customerData.items || []);
        setPayments(customerData.payments || []);
        setCreatedByUser(customerData.created_by_user);

        await fetchChangeLogs();
      } catch (error) {
        console.error("Error fetching customer data:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    if (user && token) {
      fetchCustomerData();
    }
  }, [customerId, user, token]);

  const fetchChangeLogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/changelogs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const logs = await res.json();
        const debtLogs = logs.filter(
          (log) =>
            (log.table_name === "Debt" && log.record_id == customerId) ||
            (log.table_name === "Payment" &&
              log.new_values?.debt_id == customerId)
        );
        setChangeLogs(debtLogs);
      }
    } catch (error) {
      console.error("Error fetching change logs:", error);
    }
  };

  const formatCurrency = (amount) => {
    try {
      return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        minimumFractionDigits: 0,
      })
        .format(amount || 0)
        .replace("KES", "Ksh");
    } catch {
      return `Ksh ${amount || 0}`;
    }
  };

  const balance = customer
    ? customer.balance || customer.total - (customer.amount_paid || 0)
    : 0;

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...editedItems];
    updated[index][name] = value;
    setEditedItems(updated);
  };

  const handleRemoveItem = (index) => {
    const updated = editedItems.filter((_, i) => i !== index);
    setEditedItems(updated);
  };

  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  const handleAddItem = () => {
    if (!newItem.name || !newItem.quantity || !newItem.price) {
      alert("Please fill in all item fields");
      return;
    }

    const updatedItems = [...editedItems, newItem];
    setEditedItems(updatedItems);
    setNewItem({ name: "", quantity: "", price: "", category: "" });
    setExpandedSections({ ...expandedSections, addItem: false });
  };

  const handleInputChange = (e) => {
    setNewPayment({ ...newPayment, [e.target.name]: e.target.value });
  };

  const handleAddPayment = async () => {
    if (!newPayment.amount || !newPayment.method) {
      alert("Please fill in all payment fields");
      return;
    }

    try {
      const paymentData = {
        debt_id: parseInt(customerId),
        amount: parseFloat(newPayment.amount),
        method: newPayment.method,
        received_by: user.id,
      };

      const res = await fetch(`${API_BASE_URL}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
      });

      if (!res.ok) throw new Error("Failed to add payment");

      const newPaymentData = await res.json();
      setPayments([newPaymentData, ...payments]);
      setNewPayment({ amount: "", method: "", received_by: "" });
      setExpandedSections({ ...expandedSections, addPayment: false });

      const customerRes = await fetch(`${API_BASE_URL}/debts/${customerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (customerRes.ok) {
        const updatedCustomer = await customerRes.json();
        setCustomer(updatedCustomer);
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Error adding payment. Please try again.");
    }
  };

  const handleSaveChanges = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/debts/${customerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: editedItems }),
      });

      if (!res.ok) throw new Error("Failed to save changes");

      const updatedCustomer = await res.json();
      setCustomer(updatedCustomer);
      alert("Changes saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      alert("Error saving changes. Please try again.");
    }
  };

  const generateSummaryMessage = () => {
    const itemList = editedItems
      .map(
        (item) =>
          `- ${item.name} × ${item.quantity} @ Ksh${item.price} (${
            item.category || "N/A"
          })`
      )
      .join("\n");

    const paymentList = payments
      .map(
        (p) =>
          `- ${new Date(p.payment_date).toLocaleDateString()}: Ksh${
            p.amount
          } via ${p.method}, received by ${p.received_by}`
      )
      .join("\n");

    return encodeURIComponent(`Hello, I hope you are well. Here is the summary of your debt:
      *Debt Summary for ${customer.customer_name}*\n
 Phone: ${customer.phone}
 Total: Ksh${customer.total}
 Balance: Ksh${balance}
 Due Date: ${
   customer.due_date ? new Date(customer.due_date).toLocaleDateString() : "N/A"
 }

 *Items Taken:*
${itemList || "No items listed."}

 *Payments Made:*
${paymentList || "No payments yet."}

 Summary generated on ${new Date().toLocaleDateString()}`);
  };

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  const canEdit =
    user?.role === "owner" ||
    user?.role === "admin" ||
    (user?.role === "salesperson" && customer?.created_by === user.id);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[400px] ">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading customer details...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-4 md:p-6 text-center ">
          <div className="bg-red-50 p-4 md:p-6 rounded-xl mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Access Error
            </h3>
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm font-medium"
          >
            Go Back
          </button>
        </div>
      </Layout>
    );
  }

  if (!customer) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-4 md:p-6 text-center">
          <div className="bg-yellow-50 p-4 md:p-6 rounded-xl mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
              <svg
                className="h-6 w-6 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-yellow-800 mb-2">
              Customer Not Found
            </h3>
            <p className="text-yellow-700">
              The customer you're looking for doesn't exist.
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm font-medium"
          >
            Go Back
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-3 md:p-4 max-w-6xl  md:mt-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 md:mb-8">
          <div className="flex items-start mb-4 md:mb-0">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-blue-600 hover:text-blue-800 mr-4 mt-1 transition-colors"
            >
              <FaArrowLeft className="mr-2" /> Back
            </button>
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-gray-900">
                {customer.customer_name}
              </h1>
              <div className="flex items-center mt-2 text-gray-600">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span>{customer.phone}</span>
              </div>
              {customer.email && (
                <div className="flex items-center mt-1 text-gray-600">
                  <FaEnvelope className="w-4 h-4 mr-2" />
                  <span>{customer.email}</span>
                </div>
              )}
              {(user?.role === "owner" || user?.role === "admin") &&
                customer.created_by && (
                  <p className="text-sm text-gray-500 mt-1">
                    Created by:{" "}
                    {createdByUser?.name ||
                      `User ${customer.created_by}`}
                  </p>
                )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                const summary = generateSummaryMessage();
                const phone = customer.phone.replace(/^0/, "254");
                window.open(`https://wa.me/${phone}?text=${summary}`, "_blank");
              }}
              className="inline-flex items-center px-3 py-2 md:px-4 md:py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg md:rounded-xl transition-colors shadow-sm text-sm md:text-base"
            >
              <FaEnvelope className="mr-2" /> WhatsApp
            </button>
            <button
              onClick={() => console.log("Export PDF")}
              className="inline-flex items-center px-3 py-2 md:px-4 md:py-2 border border-gray-300 text-gray-700 font-medium rounded-lg md:rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm md:text-base"
            >
              <FaFilePdf className="mr-2" /> PDF
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-6 md:mb-8">
          <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 md:p-3 rounded-lg bg-blue-100 text-blue-800 mr-3 md:mr-4">
                <FiDollarSign className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-500">Total Debt</p>
                <p className="text-lg md:text-xl font-bold text-gray-900">
                  {formatCurrency(debt?.total)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 md:p-3 rounded-lg bg-green-100 text-green-800 mr-3 md:mr-4">
                <FiCheckCircle className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-500">Amount Paid</p>
                <p className="text-lg md:text-xl font-bold text-green-600">
                  {formatCurrency(debt?.amount_paid || 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 md:p-3 rounded-lg bg-red-100 text-red-800 mr-3 md:mr-4">
                <FiCreditCard className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-500">Balance</p>
                <p className="text-lg md:text-xl font-bold text-red-600">
                  {formatCurrency(debt?.balance)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex min-w-max">
              <button
                onClick={() => setActiveTab("items")}
                className={`py-3 md:py-4 px-4 md:px-6 font-medium text-sm flex items-center ${
                  activeTab === "items"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <FiShoppingCart className="mr-2" /> Items
                <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {editedItems.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("payments")}
                className={`py-3 md:py-4 px-4 md:px-6 font-medium text-sm flex items-center ${
                  activeTab === "payments"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <FaMoneyBillAlt className="mr-2" /> Payments
                <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {payments.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`py-3 md:py-4 px-4 md:px-6 font-medium text-sm flex items-center ${
                  activeTab === "history"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <FaHistory className="mr-2" /> History
                <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {changeLogs.length}
                </span>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 md:p-6">
            {/* Items Tab */}
            {activeTab === "items" && (
              <div className="space-y-6">
                {/* Items List */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Items Taken
                  </h3>
                  {editedItems.length > 0 ? (
                    <div className="bg-gray-50 rounded-lg divide-y divide-gray-200 overflow-x-auto">
                      <div className="min-w-[600px]">
                        {editedItems.map((item, index) => (
                          <div
                            key={index}
                            className="p-4 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center"
                          >
                            <div className="md:col-span-5">
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                Item Name
                              </label>
                              <input
                                type="text"
                                name="name"
                                value={item.name}
                                onChange={(e) => handleItemChange(index, e)}
                                className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Item Name"
                                disabled={!canEdit}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                Quantity
                              </label>
                              <input
                                type="number"
                                name="quantity"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, e)}
                                className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Qty"
                                disabled={!canEdit}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                Price
                              </label>
                              <input
                                type="number"
                                name="price"
                                value={item.price}
                                onChange={(e) => handleItemChange(index, e)}
                                className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Price"
                                disabled={!canEdit}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                Category
                              </label>
                              <input
                                type="text"
                                name="category"
                                value={item.category || ""}
                                onChange={(e) => handleItemChange(index, e)}
                                className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Category"
                                disabled={!canEdit}
                              />
                            </div>
                            {canEdit && (
                              <div className="md:col-span-1 flex justify-end">
                                <button
                                  onClick={() => handleRemoveItem(index)}
                                  className="text-red-600 hover:text-red-800 p-2 transition-colors"
                                  title="Remove item"
                                >
                                  <FaTrash className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-6 md:p-8 text-center">
                      <FiShoppingCart className="mx-auto h-10 w-10 md:h-12 md:w-12 text-gray-400 mb-3 md:mb-4" />
                      <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
                        No items added
                      </h3>
                      <p className="text-gray-500 text-sm md:text-base">
                        Add items to this debt record
                      </p>
                    </div>
                  )}
                </div>

                {canEdit && (
                  <>
                    {/* Save Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveChanges}
                        className="inline-flex items-center px-4 py-2 md:px-5 md:py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors text-sm md:text-base"
                      >
                        <FaSave className="mr-2" /> Save Changes
                      </button>
                    </div>

                    {/* Add New Item Section */}
                    <div className="border-t border-gray-200 pt-6">
                      <button
                        onClick={() => toggleSection("addItem")}
                        className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors text-sm md:text-base"
                      >
                        {expandedSections.addItem ? (
                          <FiChevronUp className="mr-2" />
                        ) : (
                          <FiChevronDown className="mr-2" />
                        )}
                        Add New Item
                      </button>

                      {expandedSections.addItem && (
                        <div className="bg-blue-50 p-4 md:p-5 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
                            <div className="md:col-span-5">
                              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                                Item Name
                              </label>
                              <input
                                name="name"
                                placeholder="Item Name"
                                value={newItem.name}
                                onChange={handleNewItemChange}
                                className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                                Quantity
                              </label>
                              <input
                                name="quantity"
                                type="number"
                                placeholder="Qty"
                                value={newItem.quantity}
                                onChange={handleNewItemChange}
                                className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                                Price
                              </label>
                              <input
                                name="price"
                                type="number"
                                placeholder="Price"
                                value={newItem.price}
                                onChange={handleNewItemChange}
                                className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                                Category
                              </label>
                              <input
                                name="category"
                                placeholder="Category"
                                value={newItem.category}
                                onChange={handleNewItemChange}
                                className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="md:col-span-1 flex items-end">
                              <button
                                onClick={handleAddItem}
                                className="w-full h-10 flex justify-center items-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                title="Add item"
                              >
                                <FaPlus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === "payments" && (
              <div className="space-y-6">
                {canEdit && (
                  <div className="border-b border-gray-200 pb-6">
                    <button
                      onClick={() => toggleSection("addPayment")}
                      className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors text-sm md:text-base"
                    >
                      {expandedSections.addPayment ? (
                        <FiChevronUp className="mr-2" />
                      ) : (
                        <FiChevronDown className="mr-2" />
                      )}
                      Add New Payment
                    </button>

                    {expandedSections.addPayment && (
                      <div className="bg-blue-50 p-4 md:p-5 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
                          <div className="md:col-span-3">
                            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                              Amount
                            </label>
                            <input
                              name="amount"
                              type="number"
                              placeholder="Amount"
                              value={newPayment.amount}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div className="md:col-span-3">
                            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                              Method
                            </label>
                            <select
                              name="method"
                              value={newPayment.method}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select Method</option>
                              <option value="Cash">Cash</option>
                              <option value="M-Pesa">M-Pesa</option>
                              <option value="Bank Transfer">
                                Bank Transfer
                              </option>
                              <option value="Cheque">Cheque</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div className="md:col-span-2 flex items-end">
                            <button
                              onClick={handleAddPayment}
                              className="w-full h-10 flex justify-center items-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm md:text-base"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Payment History */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Payment History
                  </h3>
                  {payments.length > 0 ? (
                    <div className="bg-gray-50 rounded-lg divide-y divide-gray-200 overflow-x-auto">
                      <div className="min-w-[600px]">
                        {payments.map((payment, i) => (
                          <div
                            key={i}
                            className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4"
                          >
                            <div>
                              <p className="text-xs font-medium text-gray-500">
                                Date
                              </p>
                              <p className="font-medium text-sm md:text-base">
                                {new Date(
                                  payment.payment_date
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">
                                Amount
                              </p>
                              <p className="font-medium text-green-600 text-sm md:text-base">
                                {formatCurrency(payment.amount)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">
                                Method
                              </p>
                              <p className="text-sm md:text-base">
                                {payment.method}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">
                                Received By
                              </p>
                              <p className="text-sm md:text-base">
                                {payment.received_by_user?.name ||
                                  payment.received_by}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-6 md:p-8 text-center">
                      <FaMoneyBillAlt className="mx-auto h-10 w-10 md:h-12 md:w-12 text-gray-400 mb-3 md:mb-4" />
                      <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
                        No payments yet
                      </h3>
                      <p className="text-gray-500 text-sm md:text-base">
                        Payments will appear here once added
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Change History
                </h3>
                {changeLogs.length > 0 ? (
                  <div className="space-y-4">
                    {changeLogs.map((log, i) => (
                      <div key={i} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full self-start sm:self-auto">
                            {log.action_type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Changed by:{" "}
                          {log.changed_by_user?.name ||
                            `User ${log.changed_by}`}
                        </p>
                        {log.old_values && (
                          <div className="mb-2">
                            <p className="text-xs font-medium text-gray-500">
                              Previous values:
                            </p>
                            <pre className="text-xs text-gray-600 bg-white p-2 rounded mt-1 overflow-x-auto">
                              {JSON.stringify(log.old_values, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.new_values && (
                          <div>
                            <p className="text-xs font-medium text-gray-500">
                              New values:
                            </p>
                            <pre className="text-xs text-gray-600 bg-white p-2 rounded mt-1 overflow-x-auto">
                              {JSON.stringify(log.new_values, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 md:p-8 text-center">
                    <FaHistory className="mx-auto h-10 w-10 md:h-12 md:w-12 text-gray-400 mb-3 md:mb-4" />
                    <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
                      No changes recorded
                    </h3>
                    <p className="text-gray-500 text-sm md:text-base">
                      Changes will appear here once made
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default CustomerDetailPage;
