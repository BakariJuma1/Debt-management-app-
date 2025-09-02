import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiPlus,
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiPhone,
  FiFileText,
  FiTag,
  FiTrash2,
  FiInfo,
  FiAlertCircle
} from "react-icons/fi";
import Layout from "../layout/Layout";
import API_BASE_URL from "../../api";
import { useAuth } from "../../AuthProvider";

function AddDebt() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [businessError, setBusinessError] = useState(null);
  const [hasBusinessAssigned, setHasBusinessAssigned] = useState(false);

  const initialFormData = {
    customerName: "",
    phone: "",
    idNumber: "",
    email: "",
    items: [
      {
        name: "",
        quantity: 1,
        price: 0,
        category: "",
      },
    ],
    amountPaid: 0,
    dueDate: "",
    receipt: "",
    businessId: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch businesses based on user role
  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoadingBusinesses(true);
      setBusinessError(null);

      try {
        if (user?.role === "owner") {
          // Owners need to select a business
          const response = await axios.get(`${API_BASE_URL}/businesses`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          let businessesData = [];

          if (Array.isArray(response.data)) {
            businessesData = response.data;
          } else if (response.data && Array.isArray(response.data.businesses)) {
            businessesData = response.data.businesses;
          } else if (
            response.data &&
            response.data.data &&
            Array.isArray(response.data.data)
          ) {
            businessesData = response.data.data;
          }

          setBusinesses(businessesData);

          if (businessesData.length > 0) {
            setFormData((prev) => ({
              ...prev,
              businessId: businessesData[0].id || businessesData[0]._id,
            }));
          } else {
            setBusinessError(
              "No businesses found. Please create a business first."
            );
          }
        } else {
          // For non-owners, just check if they have a business assigned
          const response = await axios.get(`${API_BASE_URL}/business/my`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          let businessData = null;

          if (response.data) {
            if (Array.isArray(response.data)) {
              businessData = response.data[0];
            } else if (response.data.business) {
              businessData = response.data.business;
            } else if (response.data.data) {
              businessData = response.data.data;
            } else {
              businessData = response.data;
            }
          }

          if (businessData) {
            setHasBusinessAssigned(true);
            setBusinesses([businessData]);
            // Don't set businessId in formData for non-owners - backend handles it
          } else {
            setBusinessError(
              "No business assigned to you. Please contact your administrator."
            );
            setHasBusinessAssigned(false);
          }
        }
      } catch (err) {
        console.error("Error fetching businesses:", err);
        if (err.response?.status === 404) {
          setBusinessError(
            "No business found. Please create a business first."
          );
        } else {
          setBusinessError(
            "Failed to load business information. Please try again."
          );
        }
        setHasBusinessAssigned(false);
      } finally {
        setLoadingBusinesses(false);
      }
    };

    if (user) {
      fetchBusinesses();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedItems = [...prev.items];
      updatedItems[index] = { ...updatedItems[index], [name]: value };
      return { ...prev, items: updatedItems };
    });
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { name: "", quantity: 1, price: 0, category: "" }],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((acc, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      return acc + quantity * price;
    }, 0);
  };

  const calculateBalance = () => {
    const total = calculateTotal();
    const amountPaid = parseFloat(formData.amountPaid) || 0;
    return total - amountPaid;
  };

  const validateForm = () => {
    if (!formData.customerName.trim()) {
      setError("Customer name is required");
      return false;
    }

    if (!formData.phone.trim()) {
      setError("Phone number is required");
      return false;
    }

    // Business validation based on user role
    if (user?.role === "owner" && !formData.businessId) {
      setError("Business selection is required");
      return false;
    }

    if (user?.role !== "owner" && !hasBusinessAssigned) {
      setError(
        "No business assigned to you. Please contact your administrator."
      );
      return false;
    }

    if (formData.items.some((item) => !item.name.trim())) {
      setError("All items must have a name");
      return false;
    }

    if (formData.items.some((item) => !item.category.trim())) {
      setError("All items must have a category");
      return false;
    }

    if (
      formData.items.some((item) => isNaN(item.quantity) || item.quantity <= 0)
    ) {
      setError("All items must have a valid quantity");
      return false;
    }

    if (formData.items.some((item) => isNaN(item.price) || item.price < 0)) {
      setError("All items must have a valid price");
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const total = calculateTotal();
      const amountPaid = parseFloat(formData.amountPaid) || 0;
      const balance = calculateBalance();

      const payload = {
        customer_name: formData.customerName,
        phone: formData.phone,
        id_number: formData.idNumber,
        email: formData.email,
        items: formData.items.map((item) => ({
          name: item.name,
          quantity: parseFloat(item.quantity),
          price: parseFloat(item.price),
          category: item.category,
        })),
        due_date: formData.dueDate || null,
        amount_paid: amountPaid,
        total: total,
        balance: balance,
        receipt: formData.receipt || "",
      };

      // Only include business_id for owners (who need to select which business)
      if (user?.role === "owner") {
        payload.business_id = formData.businessId;
      }

      const { data } = await axios.post(`${API_BASE_URL}/debts`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setSuccess(true);
      setFormData(initialFormData);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error creating debt:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
          "Failed to create debt. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setError(null);
    setSuccess(false);
  };

  const totalAmount = calculateTotal();
  const balance = calculateBalance();

  // Check if form can be submitted
  const canSubmit =
    !loadingBusinesses &&
    !isSubmitting &&
    (user?.role === "owner"
      ? businesses.length > 0 && formData.businessId
      : hasBusinessAssigned);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Add New Debt</h1>
          <p className="text-gray-600 mt-1">Create a new debt record for a customer</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md flex items-start">
            <FiAlertCircle className="text-red-500 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {businessError && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded-md flex items-start">
            <FiInfo className="text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-yellow-700">{businessError}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md flex items-start">
            <FiInfo className="text-green-500 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-green-700">Debt created successfully!</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Information - Only show for owners */}
          {user?.role === "owner" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Business
              </h2>
              {loadingBusinesses ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-pulse flex space-x-2">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  </div>
                </div>
              ) : businesses.length > 0 ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business *
                  </label>
                  <select
                    name="businessId"
                    value={formData.businessId}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  >
                    <option value="">Select a business</option>
                    {businesses.map((business) => (
                      <option
                        key={business.id || business._id}
                        value={business.id || business._id}
                      >
                        {business.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="text-red-500">
                  {businessError ||
                    "No business available. Please create a business first."}
                </p>
              )}
            </div>
          )}

          {/* Show business info for non-owners if available */}
          {user?.role !== "owner" && businesses.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Business
              </h2>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-gray-700 font-medium">
                  {businesses[0].name}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  This debt will be automatically associated with your assigned business
                </p>
              </div>
            </div>
          )}

          {/* Customer Information Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FiUser className="mr-2 text-blue-500" /> Customer Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>
                <input
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="text-gray-400" />
                  </div>
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0700123456"
                    className="w-full pl-10 px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                  <span className="text-xs text-gray-500 ml-1">
                    (optional, but recommended for reminders)
                  </span>
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="customer@email.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Number
                </label>
                <input
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleChange}
                  placeholder="National ID"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <FiFileText className="mr-2 text-blue-500" /> Items *
              </h2>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <FiPlus className="mr-2" /> Add Item
              </button>
            </div>

            {formData.items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-5 items-end p-4 bg-gray-50 rounded-lg"
              >
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    name="name"
                    value={item.name}
                    onChange={(e) => handleItemChange(index, e)}
                    placeholder="e.g. Cement bags"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    name="quantity"
                    type="number"
                    min="1"
                    placeholder="e.g. 10"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, e)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Price *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">Ksh</span>
                    </div>
                    <input
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 10"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, e)}
                      className="w-full pl-12 px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiTag className="text-gray-400" />
                    </div>
                    <input
                      name="category"
                      value={item.category}
                      onChange={(e) => handleItemChange(index, e)}
                      placeholder="e.g. Construction"
                      className="w-full pl-10 px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                </div>
                <div className="md:col-span-1 flex justify-end">
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="w-full md:w-auto px-3 py-2.5 text-white bg-red-500 hover:bg-red-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors flex items-center justify-center"
                      title="Remove item"
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-xl font-semibold text-blue-700">
                    Ksh{" "}
                    {totalAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Balance</p>
                  <p className={`text-xl font-semibold ${balance > 0 ? "text-red-600" : "text-green-600"}`}>
                    Ksh{" "}
                    {balance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FiDollarSign className="mr-2 text-blue-500" /> Payment Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount Paid (Ksh)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">Ksh</span>
                  </div>
                  <input
                    name="amountPaid"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amountPaid}
                    onChange={handleChange}
                    className="w-full pl-12 px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiCalendar className="text-gray-400" />
                  </div>
                  <input
                    name="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="w-full pl-10 px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receipt/Reference
                </label>
                <input
                  name="receipt"
                  value={formData.receipt}
                  onChange={handleChange}
                  placeholder="Optional reference note"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Reset Form
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !canSubmit}
              className="px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Create Debt"
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default AddDebt;