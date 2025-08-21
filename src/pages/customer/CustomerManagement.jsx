import React, { useState, useEffect } from 'react';
import { 
  FiPlus, FiEdit, FiTrash2, FiEye, FiX, FiSearch,
  FiUser, FiPhone, FiCreditCard, FiBriefcase, FiUserCheck,
  FiGrid, FiList, FiChevronDown, FiChevronUp, FiFilter
} from 'react-icons/fi';
import { useAuth } from '../../AuthProvider';
import axios from 'axios';
import API_BASE_URL from '../../api';
import Layout from '../../components/layout/Layout';

const CustomerManagement = () => {
  const { user, token, isAuthenticated } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [sortField, setSortField] = useState('customer_name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [expandedCustomer, setExpandedCustomer] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    id_number: '',
    business_id: user?.business_id || user?.owned_businesses?.[0]?.id || ''
  });

  // Filter and sort customers
  useEffect(() => {
    // Ensure customers is always an array
    const customersArray = Array.isArray(customers) ? customers : [];
    
    let result = [...customersArray];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(customer => 
        customer.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm) ||
        customer.id_number?.includes(searchTerm)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
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
        headers: { Authorization: `Bearer ${token}` }
      });
      // Ensure we always set an array, even if response.data is null/undefined
      setCustomers(Array.isArray(response.data) ? response.data : []);
      setError('');
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err.response?.data?.message || 'Failed to fetch customers');
      // Set to empty array on error
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const resetForm = () => {
    setFormData({
      customer_name: '',
      phone: '',
      id_number: '',
      business_id: user?.business_id || user?.owned_businesses?.[0]?.id || ''
    });
    setEditingCustomer(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        // Update existing customer
        await axios.put(
          `${API_BASE_URL}/customers/${editingCustomer.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Customer updated successfully');
      } else {
        // Create new customer
        await axios.post(
          `${API_BASE_URL}/customers`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Customer created successfully');
      }
      
      setOpenDialog(false);
      resetForm();
      fetchCustomers(); // Refresh the list
    } catch (err) {
      console.error('Error saving customer:', err);
      setError(err.response?.data?.message || 'Failed to save customer');
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      customer_name: customer.customer_name || '',
      phone: customer.phone || '',
      id_number: customer.id_number || '',
      business_id: customer.business_id || user?.business_id || user?.owned_businesses?.[0]?.id || ''
    });
    setOpenDialog(true);
  };

  const handleView = (customer) => {
    setViewingCustomer(customer);
  };

  const handleDelete = (customer) => {
    setCustomerToDelete(customer);
    setDeleteConfirm(true);
  };

  const toggleExpand = (customerId) => {
    if (expandedCustomer === customerId) {
      setExpandedCustomer(null);
    } else {
      setExpandedCustomer(customerId);
    }
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(
        `${API_BASE_URL}/customers/${customerToDelete.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Customer deleted successfully');
      fetchCustomers(); // Refresh the list
    } catch (err) {
      console.error('Error deleting customer:', err);
      setError(err.response?.data?.message || 'Failed to delete customer');
    } finally {
      setDeleteConfirm(false);
      setCustomerToDelete(null);
    }
  };

  const canEdit = () => {
    return user?.role === 'owner' || user?.role === 'admin';
  };

  const canDelete = () => {
    return user?.role === 'owner';
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Customer Management</h1>
            <div className="flex space-x-2">
              <div className="flex bg-white rounded-lg border border-gray-300 overflow-hidden">
                <button 
                  className={`p-2 ${viewMode === 'card' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                  onClick={() => setViewMode('card')}
                  title="Card View"
                >
                  <FiGrid className="h-5 w-5" />
                </button>
                <button 
                  className={`p-2 ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                  onClick={() => setViewMode('table')}
                  title="Table View"
                >
                  <FiList className="h-5 w-5" />
                </button>
              </div>
              {canEdit() && (
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition duration-200"
                  onClick={() => setOpenDialog(true)}
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
                  <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
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
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button onClick={() => setSuccess('')} className="text-green-700 hover:text-green-900">
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Customers Count and Sort */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <p className="text-gray-600 mb-2 sm:mb-0">
              {filteredCustomers.length} {filteredCustomers.length === 1 ? 'customer' : 'customers'} found
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <div className="flex bg-white rounded-lg border border-gray-300 overflow-hidden">
                <button 
                  className={`px-3 py-1 text-sm flex items-center ${sortField === 'customer_name' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                  onClick={() => handleSort('customer_name')}
                >
                  Name {sortField === 'customer_name' && (sortDirection === 'asc' ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />)}
                </button>
                <button 
                  className={`px-3 py-1 text-sm flex items-center ${sortField === 'phone' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                  onClick={() => handleSort('phone')}
                >
                  Phone {sortField === 'phone' && (sortDirection === 'asc' ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />)}
                </button>
              </div>
            </div>
          </div>

          {/* Customers Cards View (for mobile) */}
          {viewMode === 'card' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {filteredCustomers.length === 0 ? (
                <div className="col-span-full bg-white rounded-lg shadow-sm p-8 text-center">
                  <FiUser className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-lg font-medium text-gray-500">No customers found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {searchTerm ? 'Try adjusting your search' : 'Get started by adding your first customer'}
                  </p>
                </div>
              ) : (
                filteredCustomers.map((customer) => (
                  <div key={customer.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <FiUser className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">{customer.customer_name}</h3>
                            <p className="text-sm text-gray-500 flex items-center">
                              <FiPhone className="mr-1 h-4 w-4" /> {customer.phone}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleExpand(customer.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {expandedCustomer === customer.id ? <FiChevronUp className="h-5 w-5" /> : <FiChevronDown className="h-5 w-5" />}
                        </button>
                      </div>
                      
                      {expandedCustomer === customer.id && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm">
                              <p className="text-gray-500">ID Number</p>
                              <p className="text-gray-900">{customer.id_number}</p>
                            </div>
                            <div className="text-sm">
                              <p className="text-gray-500">Business</p>
                              <p className="text-gray-900">{customer.business?.business_name || 'N/A'}</p>
                            </div>
                          </div>
                          
                          <div className="flex justify-end space-x-2 mt-4">
                            <button
                              onClick={() => handleView(customer)}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition duration-150"
                              title="View customer"
                            >
                              <FiEye className="h-5 w-5" />
                            </button>
                            {canEdit() && (
                              <button
                                onClick={() => handleEdit(customer)}
                                className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-50 transition duration-150"
                                title="Edit customer"
                              >
                                <FiEdit className="h-5 w-5" />
                              </button>
                            )}
                            {canDelete() && (
                              <button
                                onClick={() => handleDelete(customer)}
                                className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition duration-150"
                                title="Delete customer"
                              >
                                <FiTrash2 className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Customers Table View (for larger screens) */}
          {viewMode === 'table' && (
            <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('customer_name')}
                      >
                        <div className="flex items-center">
                          Name
                          {sortField === 'customer_name' && (
                            sortDirection === 'asc' ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('phone')}
                      >
                        <div className="flex items-center">
                          Phone
                          {sortField === 'phone' && (
                            sortDirection === 'asc' ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">ID Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Business</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <FiUser className="h-12 w-12 mb-2 text-gray-300" />
                            <p className="text-lg font-medium">No customers found</p>
                            <p className="text-sm mt-1">
                              {searchTerm ? 'Try adjusting your search' : 'Get started by adding your first customer'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <tr key={customer.id} className="hover:bg-gray-50 transition duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <FiUser className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{customer.customer_name}</div>
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
                              {customer.id_number}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <FiBriefcase className="mr-1 h-3 w-3" />
                              {customer.business?.business_name || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleView(customer)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition duration-150"
                                title="View customer"
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Add/Edit Customer Dialog */}
          {openDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                  </h2>
                  <button
                    onClick={() => { setOpenDialog(false); resetForm(); }}
                    className="text-gray-400 hover:text-gray-600 transition duration-150"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="px-6 py-4 space-y-4">
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
                    </div>
                    {(user?.role === 'owner' || user?.role === 'admin') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Business
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiBriefcase className="h-5 w-5 text-gray-400" />
                          </div>
                          <select
                            name="business_id"
                            value={formData.business_id}
                            onChange={handleInputChange}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                            required
                          >
                            {user?.owned_businesses?.map((business) => (
                              <option key={business.id} value={business.id}>
                                {business.business_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => { setOpenDialog(false); resetForm(); }}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition duration-150"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 flex items-center"
                    >
                      {editingCustomer ? (
                        <>
                          <FiEdit className="mr-2 h-4 w-4" />
                          Update
                        </>
                      ) : (
                        <>
                          <FiPlus className="mr-2 h-4 w-4" />
                          Create
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* View Customer Dialog */}
          {viewingCustomer && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">Customer Details</h2>
                  <button
                    onClick={() => setViewingCustomer(null)}
                    className="text-gray-400 hover:text-gray-600 transition duration-150"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
                <div className="px-6 py-4">
                  <div className="flex items-center mb-6">
                    <div className="flex-shrink-0 h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <FiUser className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{viewingCustomer.customer_name}</h3>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <FiPhone className="mr-3 h-5 w-5 text-gray-400" />
                      <span>{viewingCustomer.phone}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FiCreditCard className="mr-3 h-5 w-5 text-gray-400" />
                      <span>{viewingCustomer.id_number}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FiBriefcase className="mr-3 h-5 w-5 text-gray-400" />
                      <span>{viewingCustomer.business?.business_name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FiUserCheck className="mr-3 h-5 w-5 text-gray-400" />
                      <span>Created by: {viewingCustomer.creator?.username || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={() => setViewingCustomer(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-150"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          {deleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800">Confirm Delete</h2>
                </div>
                <div className="px-6 py-4">
                  <p className="text-gray-600">
                    Are you sure you want to delete customer <span className="font-semibold">"{customerToDelete?.customer_name}"</span>? 
                    This action cannot be undone.
                  </p>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-150 flex items-center"
                  >
                    <FiTrash2 className="mr-2 h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CustomerManagement;