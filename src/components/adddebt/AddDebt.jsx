import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiPlus, FiDollarSign, FiCalendar, FiUser, FiPhone, FiFileText, FiTag } from "react-icons/fi";
import Layout from "../layout/Layout";
import API_BASE_URL from "../../api";
import { useAuth } from "../../AuthProvider";

function AddDebt() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [businessError, setBusinessError] = useState(null);

  const initialFormData = {
    customerName: "",
    phone: "",
    idNumber: "",
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
        let response;
        if (user?.role === 'owner') {
          response = await axios.get(`${API_BASE_URL}/businesses`, {
            headers: { 
              "Authorization": `Bearer ${localStorage.getItem('token')}`
            }
          });
          const businessesData = Array.isArray(response.data) ? response.data : [];
          setBusinesses(businessesData);
          
          if (businessesData.length > 0) {
            setFormData(prev => ({
              ...prev,
              businessId: businessesData[0].id
            }));
          }
        } else {
          response = await axios.get(`${API_BASE_URL}/business/my`, {
            headers: { 
              "Authorization": `Bearer ${localStorage.getItem('token')}`
            }
          });
          const businessData = response.data ? [response.data] : [];
          setBusinesses(businessData);
          
          if (businessData.length > 0) {
            setFormData(prev => ({
              ...prev,
              businessId: businessData[0].id
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching businesses:", err);
        setBusinessError("Failed to load business information");
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index] = { ...updatedItems[index], [name]: value };
      return { ...prev, items: updatedItems };
    });
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: "", quantity: 1, price: 0, category: "" }],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((acc, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      return acc + (quantity * price);
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

    if (!formData.businessId) {
      setError("Business selection is required");
      return false;
    }

    if (formData.items.some(item => !item.name.trim())) {
      setError("All items must have a name");
      return false;
    }

    if (formData.items.some(item => !item.category.trim())) {
      setError("All items must have a category");
      return false;
    }

    if (formData.items.some(item => isNaN(item.quantity) || item.quantity <= 0)) {
      setError("All items must have a valid quantity");
      return false;
    }

    if (formData.items.some(item => isNaN(item.price) || item.price < 0)) {
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
        business_id: formData.businessId,
        items: formData.items.map(item => ({
          name: item.name,
          quantity: parseFloat(item.quantity),
          price: parseFloat(item.price),
          category: item.category // Include category in payload
        })),
        due_date: formData.dueDate || null,
        amount_paid: amountPaid,
        total: total,
        balance: balance,
        receipt: formData.receipt || ""
      };

      const { data } = await axios.post(`${API_BASE_URL}/debts`, payload, {
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
      });

      setSuccess(true);
      setFormData(initialFormData);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error creating debt:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to create debt. Please try again.");
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

  return (
    <Layout>
      <div className="container mx-auto p-4 max-w-6xl ml-10 mt-12" >
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Debt</h1>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <p>{error}</p>
          </div>
        )}

        {businessError && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
            <p>{businessError}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
            <p>Debt created successfully!</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Selection */}
          {!loadingBusinesses && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Business</h2>
              {businesses.length > 0 ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business *
                  </label>
                  <select
                    name="businessId"
                    value={formData.businessId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select a business</option>
                    {businesses.map(business => (
                      <option key={business.id} value={business.id}>
                        {business.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="text-red-500">No business available. Please create a business first.</p>
              )}
            </div>
          )}

          {/* Customer Information Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FiUser className="mr-2" /> Customer Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name *
                </label>
                <input
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0700123456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Number
                </label>
                <input
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleChange}
                  placeholder="National ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <FiFileText className="mr-2" /> Items *
              </h2>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiPlus className="mr-1" /> Add Item
              </button>
            </div>

            {formData.items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4 items-end"
              >
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name *
                  </label>
                  <input
                    name="name"
                    value={item.name}
                    onChange={(e) => handleItemChange(index, e)}
                    placeholder="e.g. Cement bags"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    name="quantity"
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, e)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      value={item.price}
                      onChange={(e) => handleItemChange(index, e)}
                      className="w-full pl-12 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="md:col-span-1 flex justify-end">
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="w-full md:w-auto px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <div className="flex justify-between">
                <p className="text-lg font-semibold text-gray-800">
                  Total Amount:{" "}
                  <span className="text-blue-600">
                    Ksh {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
                <p className="text-lg font-semibold text-gray-800">
                  Balance:{" "}
                  <span className={balance > 0 ? "text-red-600" : "text-green-600"}>
                    Ksh {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Payment Details Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FiDollarSign className="mr-2" /> Payment Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full pl-12 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Receipt/Reference
                </label>
                <input
                  name="receipt"
                  value={formData.receipt}
                  onChange={handleChange}
                  placeholder="Optional reference note"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reset Form
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loadingBusinesses || !formData.businessId}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Create Debt"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default AddDebt;