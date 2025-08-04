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
} from "react-icons/fa";
import Layout from "../layout/Layout";

function CustomerDetailPage() {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [editedItems, setEditedItems] = useState([]);
  const [itemHistory, setItemHistory] = useState([]);
  const [payments, setPayments] = useState([]);
  const [newPayment, setNewPayment] = useState({
    amount: "",
    method: "",
    receivedBy: "",
  });
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    price: "",
    category: "",
  });
  const [activeTab, setActiveTab] = useState("items");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomerData() {
      try {
        setIsLoading(true);
        const res = await fetch("https://debt-backend-lj7p.onrender.com/api/debts");
        const allCustomers = await res.json();
        const customerData = allCustomers.find((c) => c.id === customerId);
        if (!customerData) throw new Error("Customer not found");

        setCustomer(customerData);
        setEditedItems(customerData.items || []);
        setPayments(customerData.payments || []);
      } catch (error) {
        console.error("Error fetching customer data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCustomerData();
  }, [customerId]);

  const formatCurrency = (amount) => `Ksh ${Number(amount || 0).toLocaleString()}`;

  const balance = customer ? customer.total - (customer.amountPaid || 0) : 0;

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...editedItems];
    const prev = updated[index][name];
    updated[index][name] = value;
    setEditedItems(updated);
    if (prev !== value) {
      addItemHistory(`Edited "${name}" from "${prev}" to "${value}"`);
    }
  };

  const handleRemoveItem = (index) => {
    const removed = editedItems[index];
    const updated = editedItems.filter((_, i) => i !== index);
    setEditedItems(updated);
    addItemHistory(`Removed "${removed.name}" × ${removed.quantity}`);
  };

  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.quantity || !newItem.price) {
      alert("Please fill in all item fields");
      return;
    }

    const updatedItems = [...editedItems, newItem];
    setEditedItems(updatedItems);
    setNewItem({ name: "", quantity: "", price: "", category: "" });
    addItemHistory(`Added new item "${newItem.name}" × ${newItem.quantity}`);
  };

  const addItemHistory = (msg) => {
    const time = new Date().toLocaleString();
    setItemHistory((prev) => [`[${time}] ${msg}`, ...prev]);
  };

  const handleInputChange = (e) => {
    setNewPayment({ ...newPayment, [e.target.name]: e.target.value });
  };

  const handleAddPayment = () => {
    if (!newPayment.amount || !newPayment.method || !newPayment.receivedBy) {
      alert("Please fill in all payment fields");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const payment = { ...newPayment, date: today };

    setPayments([payment, ...payments]);
    setNewPayment({ amount: "", method: "", receivedBy: "" });
  };

  const handleSaveChanges = async () => {
    try {
      const res = await fetch(`https://your-backend-url/api/debts/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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
          `- ${item.name} × ${item.quantity} @ Ksh${item.price} (${item.category || "N/A"})`
      )
      .join("\n");

    const paymentList = payments
      .map(
        (p) =>
          `- ${p.date}: Ksh${p.amount} via ${p.method}, received by ${p.receivedBy}`
      )
      .join("\n");

    return encodeURIComponent(`Hello, I hope you are well. Here is the summary of your debt:
      *Debt Summary for ${customer.customerName}*\n
 Phone: ${customer.phone}
 Total: Ksh${customer.total}
 Balance: Ksh${balance}
 Due Date: ${customer.dueDate || "N/A"}

 *Items Taken:*
${itemList || "No items listed."}

 *Payments Made:*
${paymentList || "No payments yet."}

 Summary generated on ${new Date().toLocaleDateString()}`);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (!customer) {
    return (
      <Layout>
        <div className="p-4 text-center">
          <p className="text-red-500">Customer not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4 max-w-6xl mt-30 " >
        {/* Header Section */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{customer.customerName}</h1>
            <p className="text-gray-600">{customer.phone}</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <h3 className="text-gray-500 text-sm">Total Debt</h3>
            <p className="text-2xl font-bold">{formatCurrency(customer.total)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <h3 className="text-gray-500 text-sm">Amount Paid</h3>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(customer.amountPaid || 0)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <h3 className="text-gray-500 text-sm">Balance</h3>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(balance)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("items")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "items"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FaListUl className="inline mr-2" /> Items
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "payments"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FaMoneyBillAlt className="inline mr-2" /> Payments
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "history"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FaHistory className="inline mr-2" /> History
            </button>
          </nav>
        </div>

        {/* Items Tab */}
        {activeTab === "items" && (
          <div className="space-y-6">
            {/* Current Items */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium">Items Taken</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {editedItems.map((item, index) => (
                  <div key={index} className="p-4 grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-4">
                      <input
                        type="text"
                        name="name"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, e)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Item Name"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        name="quantity"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, e)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Qty"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        name="price"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, e)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Price"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        name="category"
                        value={item.category || ""}
                        onChange={(e) => handleItemChange(index, e)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Category"
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={handleSaveChanges}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaSave className="mr-2" /> Save Changes
                </button>
              </div>
            </div>

            {/* Add New Item */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium">Add New Item</h2>
              </div>
              <div className="p-4 grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <input
                    name="name"
                    placeholder="Item Name"
                    value={newItem.name}
                    onChange={handleNewItemChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    name="quantity"
                    type="number"
                    placeholder="Quantity"
                    value={newItem.quantity}
                    onChange={handleNewItemChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    name="price"
                    type="number"
                    placeholder="Price"
                    value={newItem.price}
                    onChange={handleNewItemChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    name="category"
                    placeholder="Category"
                    value={newItem.category}
                    onChange={handleNewItemChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="col-span-1">
                  <button
                    onClick={handleAddItem}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <div className="space-y-6">
            {/* Add Payment */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium">Add Payment</h2>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <input
                    name="amount"
                    placeholder="Amount"
                    value={newPayment.amount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <select
                    name="method"
                    value={newPayment.method}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Payment Method</option>
                    <option value="Cash">Cash</option>
                    <option value="M-Pesa">M-Pesa</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <input
                    name="receivedBy"
                    placeholder="Received By"
                    value={newPayment.receivedBy}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <button
                    onClick={handleAddPayment}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FaPlus className="mr-2" /> Add Payment
                  </button>
                </div>
              </div>
            </div>

            {/* Payment History */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium">Payment History</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {payments.length > 0 ? (
                  payments.map((p, i) => (
                    <div key={i} className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p>{p.date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="font-medium">{formatCurrency(p.amount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Method</p>
                        <p>{p.method}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Received By</p>
                        <p>{p.receivedBy}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No payment history available
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium">Change Log</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {itemHistory.length > 0 ? (
                itemHistory.map((entry, i) => (
                  <div key={i} className="p-4">
                    <p className="text-sm">{entry}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No changes recorded yet
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-4">
          <button
            onClick={() => console.log("Export PDF")}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaFilePdf className="mr-2" /> Export PDF
          </button>
          <button
            onClick={() => {
              const summary = generateSummaryMessage();
              const phone = customer.phone.replace(/^0/, "254");
              window.open(`https://wa.me/${phone}?text=${summary}`, "_blank");
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <FaEnvelope className="mr-2" /> Send Summary via WhatsApp
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default CustomerDetailPage;