import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../layout/Layout'; 

const API_BASE_URL = 'https://paysync-backend.onrender.com';

const SalespersonSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: '',
    created_at: ''
  });
  const [business, setBusiness] = useState({
    id: '',
    name: '',
    contact_info: '',
    created_at: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  });

  // Simulating authentication token (replace with your actual token retrieval)
  const token = localStorage.getItem('authToken');

  // Fetch profile and business data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch profile
        const profileResponse = await axios.get(`${API_BASE_URL}/salesperson/profile`, { headers });
        setProfile(profileResponse.data);
        setFormData(prev => ({ ...prev, name: profileResponse.data.name }));
        
        // Fetch business info
        const businessResponse = await axios.get(`${API_BASE_URL}/salesperson/business`, { headers });
        setBusiness(businessResponse.data);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data. Please try again.');
        setLoading(false);
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const updateData = {};
      
      if (formData.name !== profile.name) updateData.name = formData.name;
      if (formData.password) updateData.password = formData.password;
      
      // Only send request if there are changes
      if (Object.keys(updateData).length > 0) {
        await axios.put(`${API_BASE_URL}/salesperson/profile`, updateData, { headers });
        setSuccess('Profile updated successfully');
        setProfile(prev => ({ ...prev, name: formData.name }));
        
        // Reset password fields
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error('Error updating profile:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
            <p className="text-center text-gray-600 mt-4">Loading your settings...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 mt-6 ml-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Salesperson Settings</h1>
            <p className="mt-2 text-lg text-gray-600">Manage your profile and business information</p>
          </div>

          {/* Success/Error Messages */}
          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
              <button onClick={() => setError('')} className="absolute top-0 right-0 p-3">
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{success}</span>
              <button onClick={() => setSuccess('')} className="absolute top-0 right-0 p-3">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Profile Settings
              </button>
              <button
                onClick={() => setActiveTab('business')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'business' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Business Information
              </button>
            </nav>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Information</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Update your personal details and password</p>
              </div>
              <div className="border-t border-gray-200">
                <form onSubmit={handleSubmit}>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <div className="text-sm font-medium text-gray-500">Full name</div>
                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      />
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <div className="text-sm font-medium text-gray-500">Email address</div>
                    <div className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {profile.email}
                    </div>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <div className="text-sm font-medium text-gray-500">Role</div>
                    <div className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {profile.role}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <div className="text-sm font-medium text-gray-500">Member since</div>
                    <div className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {formatDate(profile.created_at)}
                    </div>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <div className="text-sm font-medium text-gray-500">New Password</div>
                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Leave blank to keep current password"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      />
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <div className="text-sm font-medium text-gray-500">Confirm Password</div>
                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword} 
                        onChange={handleInputChange}
                        placeholder="Confirm your new password"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      />
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Business Tab */}
          {activeTab === 'business' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Business Information</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Details about your associated business</p>
              </div>
              <div className="border-t border-gray-200">
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <div className="text-sm font-medium text-gray-500">Business name</div>
                  <div className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {business.name}
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <div className="text-sm font-medium text-gray-500">Contact information</div>
                  <div className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {business.contact_info}
                  </div>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <div className="text-sm font-medium text-gray-500">Business ID</div>
                  <div className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {business.id}
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <div className="text-sm font-medium text-gray-500">Member since</div>
                  <div className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatDate(business.created_at)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SalespersonSettings;