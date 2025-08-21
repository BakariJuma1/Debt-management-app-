import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import API_BASE_URL from '../../../api';
import { useAuth } from '../../../AuthProvider';

export default function FinanceSettings() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currencies, setCurrencies] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [currentBusiness, setCurrentBusiness] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchBusinessAndSettings = async () => {
      try {
        setLoading(true);
        
        // 1. Get the user's business
        const businessRes = await axios.get(`${API_BASE_URL}/business/my`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Business response:', businessRes.data);
        
        if (!businessRes.data.businesses || businessRes.data.businesses.length === 0) {
          toast.error('No business found. Please create a business first.');
          setLoading(false);
          return;
        }
        
        const businessData = businessRes.data.businesses[0];
        setCurrentBusiness(businessData);
        
        // 2. Get the finance settings for this business
        try {
          const settingsRes = await axios.get(
            `${API_BASE_URL}/settings/${businessData.id}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          
          setSettings(settingsRes.data);
        } catch (settingsError) {
          if (settingsError.response?.status === 404) {
            // Settings don't exist, create defaults
            const defaultSettings = {
              default_currency: 'USD',
              payment_due_day: 1,
              grace_period_days: 5,
              late_fee_type: 'percentage',
              late_fee_value: 5.0,
              late_fee_max: 0.0,
              late_fee_recurring: false,
              reminder_before_due: true,
              reminder_before_days: 3,
              reminder_after_due: true,
              reminder_after_days: 1,
              reminder_method: 'email'
            };
            
            const createRes = await axios.post(
              `${API_BASE_URL}/settings`,
              {
                ...defaultSettings,
                business_id: businessData.id
              },
              {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            );
            
            setSettings(createRes.data);
            toast.success('Default settings created');
          } else {
            throw settingsError;
          }
        }
        
        // 3. Get available currencies (with error handling)
        try {
          const currenciesRes = await axios.get(`${API_BASE_URL}/currencies`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          setCurrencies(currenciesRes.data.currencies || currenciesRes.data || []);
        } catch (currenciesError) {
          console.warn('Could not load currencies, using defaults', currenciesError);
          // Fallback to common currencies
          setCurrencies([
            { code: 'USD', name: 'US Dollar' },
            { code: 'EUR', name: 'Euro' },
            { code: 'GBP', name: 'British Pound' },
            { code: 'JPY', name: 'Japanese Yen' },
            { code: 'CAD', name: 'Canadian Dollar' },
            { code: 'AUD', name: 'Australian Dollar' }
          ]);
        }
        
      } catch (error) {
        console.error('Error loading data:', error);
        
        if (error.code === 'ERR_NETWORK') {
          toast.error('Network error. Please check your connection and try again.');
        } else if (error.response?.status === 401) {
          toast.error('Session expired. Please log in again.');
        } else if (error.response?.status === 404) {
          toast.error('Settings endpoint not found. Please check your API configuration.');
        } else {
          toast.error('Failed to load finance data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchBusinessAndSettings();
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : 
                    type === 'number' ? parseFloat(value) : 
                    value;

    setSettings(prev => ({
      ...prev,
      [name]: newValue,
    }));

    setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const errors = {};

    if (!settings?.default_currency) {
      errors.default_currency = 'Currency is required';
    }
    if (!settings?.payment_due_day || settings.payment_due_day < 1 || settings.payment_due_day > 31) {
      errors.payment_due_day = 'Must be between 1-31';
    }
    if (settings?.grace_period_days < 0 || settings?.grace_period_days > 30) {
      errors.grace_period_days = 'Must be between 0-30';
    }
    if (settings?.late_fee_value < 0) {
      errors.late_fee_value = 'Must be positive';
    }
    if (settings?.late_fee_max < 0) {
      errors.late_fee_max = 'Must be positive';
    }
    if (settings?.reminder_before_days < 0 || settings?.reminder_before_days > 30) {
      errors.reminder_before_days = 'Must be between 0-30';
    }
    if (settings?.reminder_after_days < 0 || settings?.reminder_after_days > 30) {
      errors.reminder_after_days = 'Must be between 0-30';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    if (!currentBusiness) {
      toast.error('No business selected');
      return;
    }

    try {
      setSaving(true);
      
      const response = await axios.put(
        `${API_BASE_URL}/settings/${currentBusiness.id}`,
        settings,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success('Settings updated successfully');
      setSettings(response.data);
    } catch (error) {
      console.error('Error updating settings:', error);
      
      if (error.code === 'ERR_NETWORK') {
        toast.error('Network error. Please check your connection and try again.');
      } else if (error.response?.status === 404) {
        toast.error('Settings endpoint not found. Please check your API configuration.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update settings');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-gray-600">Loading settings...</span>
      </div>
    );
  }

  if (!currentBusiness) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center py-10">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">No Business Found</h2>
          <p className="text-gray-600 mb-6">You need to create a business before configuring finance settings.</p>
          <button 
            onClick={() => navigate('/settings/business')} 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Business
          </button>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center py-10">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Failed to Load Settings</h2>
          <p className="text-gray-600 mb-6">There was an error loading your finance settings.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-4"
          >
            Try Again
          </button>
          <button 
            onClick={() => navigate('/settings')} 
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Settings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        
        <h2 className="text-2xl font-semibold text-gray-800">
          Finance Settings for {currentBusiness.name}
        </h2>
        <p className="text-gray-600 mt-2">
          Configure payment terms, late fees, and reminders for your business.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Currency Settings */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Currency Settings</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="default_currency" className="block text-sm font-medium text-gray-700 mb-2">
                Default Currency
              </label>
              <select
                id="default_currency"
                name="default_currency"
                value={settings.default_currency || 'USD'}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.name} ({currency.code})
                  </option>
                ))}
              </select>
              {formErrors.default_currency && (
                <p className="mt-1 text-sm text-red-600">{formErrors.default_currency}</p>
              )}
            </div>
          </div>
        </div>

        {/* Payment Terms */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Terms</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="payment_due_day" className="block text-sm font-medium text-gray-700 mb-2">
                Payment Due Day (of month)
              </label>
              <input
                type="number"
                id="payment_due_day"
                name="payment_due_day"
                min="1"
                max="31"
                value={settings.payment_due_day || 1}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              {formErrors.payment_due_day && (
                <p className="mt-1 text-sm text-red-600">{formErrors.payment_due_day}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Day of the month when payments are due (1-31)</p>
            </div>
            <div>
              <label htmlFor="grace_period_days" className="block text-sm font-medium text-gray-700 mb-2">
                Grace Period (days)
              </label>
              <input
                type="number"
                id="grace_period_days"
                name="grace_period_days"
                min="0"
                max="30"
                value={settings.grace_period_days || 0}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              {formErrors.grace_period_days && (
                <p className="mt-1 text-sm text-red-600">{formErrors.grace_period_days}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Number of days after due date before late fees apply</p>
            </div>
          </div>
        </div>

        {/* Late Fee Rules */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Late Fee Rules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="late_fee_type" className="block text-sm font-medium text-gray-700 mb-2">
                Late Fee Type
              </label>
              <select
                id="late_fee_type"
                name="late_fee_type"
                value={settings.late_fee_type || 'percentage'}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label htmlFor="late_fee_value" className="block text-sm font-medium text-gray-700 mb-2">
                {settings.late_fee_type === 'percentage' ? 'Late Fee Percentage (%)' : 'Late Fee Amount'}
              </label>
              <input
                type="number"
                id="late_fee_value"
                name="late_fee_value"
                min="0"
                step="0.01"
                value={settings.late_fee_value || 0}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              {formErrors.late_fee_value && (
                <p className="mt-1 text-sm text-red-600">{formErrors.late_fee_value}</p>
              )}
            </div>
            <div>
              <label htmlFor="late_fee_max" className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Late Fee (0 for no max)
              </label>
              <input
                type="number"
                id="late_fee_max"
                name="late_fee_max"
                min="0"
                step="0.01"
                value={settings.late_fee_max || 0}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              {formErrors.late_fee_max && (
                <p className="mt-1 text-sm text-red-600">{formErrors.late_fee_max}</p>
              )}
            </div>
            <div className="flex items-start pt-6">
              <input
                type="checkbox"
                id="late_fee_recurring"
                name="late_fee_recurring"
                checked={settings.late_fee_recurring || false}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              />
              <label htmlFor="late_fee_recurring" className="ml-2 block text-sm text-gray-700">
                Recurring Late Fee (charge every period)
              </label>
            </div>
          </div>
        </div>

        {/* Payment Reminders */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Reminders</h3>
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="reminder_before_due"
                  name="reminder_before_due"
                  checked={settings.reminder_before_due || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />
                <label htmlFor="reminder_before_due" className="ml-2 block text-sm text-gray-700">
                  Send reminder before due date
                </label>
              </div>
              {settings.reminder_before_due && (
                <div className="ml-6">
                  <label htmlFor="reminder_before_days" className="block text-sm font-medium text-gray-700 mb-2">
                    Days before due date to send reminder
                  </label>
                  <input
                    type="number"
                    id="reminder_before_days"
                    name="reminder_before_days"
                    min="1"
                    max="30"
                    value={settings.reminder_before_days || 3}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  {formErrors.reminder_before_days && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.reminder_before_days}</p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="reminder_after_due"
                  name="reminder_after_due"
                  checked={settings.reminder_after_due || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />
                <label htmlFor="reminder_after_due" className="ml-2 block text-sm text-gray-700">
                  Send reminder after due date
                </label>
              </div>
              {settings.reminder_after_due && (
                <div className="ml-6">
                  <label htmlFor="reminder_after_days" className="block text-sm font-medium text-gray-700 mb-2">
                    Days after due date to send reminder
                  </label>
                  <input
                    type="number"
                    id="reminder_after_days"
                    name="reminder_after_days"
                    min="1"
                    max="30"
                    value={settings.reminder_after_days || 1}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  {formErrors.reminder_after_days && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.reminder_after_days}</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="reminder_method" className="block text-sm font-medium text-gray-700 mb-2">
                Reminder Method
              </label>
              <select
                id="reminder_method"
                name="reminder_method"
                value={settings.reminder_method || 'email'}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="both">Both Email and SMS</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
            disabled={saving}
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}