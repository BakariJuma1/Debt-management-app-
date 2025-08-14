import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import API_BASE_URL from '../../../api';

export default function FinanceSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currencies, setCurrencies] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [currentBusiness, setCurrentBusiness] = useState(null);

  useEffect(() => {
    const fetchBusinessAndSettings = async () => {
      try {
        setLoading(true);
        
        // 1. Get the user's business
        const businessRes = await axios.get(`${API_BASE_URL}/business/my`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!businessRes.data) {
          throw new Error('No business found');
        }
        
        setCurrentBusiness(businessRes.data);
        
        // 2. Get the finance settings for this business
        const settingsRes = await axios.get(
          `${API_BASE_URL}/finance/settings/${businessRes.data.id}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        setSettings(settingsRes.data);
        
        // 3. Get available currencies
        const currenciesRes = await axios.get(`${API_BASE_URL}/finance/currencies`);
        setCurrencies(currenciesRes.data.currencies || currenciesRes.data);
        
      } catch (error) {
        console.error('Error loading data:', error);
        
        if (error.response?.status === 404) {
          // Settings don't exist, create defaults
          try {
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
              `${API_BASE_URL}/finance/settings/${currentBusiness?.id}`,
              defaultSettings,
              {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              }
            );
            
            setSettings(createRes.data);
            toast.success('Default settings created');
          } catch (createError) {
            toast.error('Failed to create default settings');
          }
        } else {
          toast.error('Failed to load finance data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessAndSettings();
  }, []);

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
      setLoading(true);
      
      const response = await axios.put(
        `${API_BASE_URL}/finance/settings/${currentBusiness.id}`,
        settings,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success('Settings updated successfully');
      setSettings(response.data);
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Failed to load finance settings</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-6">
        Finance Settings for {currentBusiness?.name || 'Your Business'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Currency Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Currency Settings</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="default_currency" className="block text-sm font-medium text-gray-700">
                Default Currency
              </label>
              <select
                id="default_currency"
                name="default_currency"
                value={settings.default_currency || 'USD'}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Payment Terms</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="payment_due_day" className="block text-sm font-medium text-gray-700">
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {formErrors.payment_due_day && (
                <p className="mt-1 text-sm text-red-600">{formErrors.payment_due_day}</p>
              )}
            </div>
            <div>
              <label htmlFor="grace_period_days" className="block text-sm font-medium text-gray-700">
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {formErrors.grace_period_days && (
                <p className="mt-1 text-sm text-red-600">{formErrors.grace_period_days}</p>
              )}
            </div>
          </div>
        </div>

        {/* Late Fee Rules */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Late Fee Rules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="late_fee_type" className="block text-sm font-medium text-gray-700">
                Late Fee Type
              </label>
              <select
                id="late_fee_type"
                name="late_fee_type"
                value={settings.late_fee_type || 'percentage'}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label htmlFor="late_fee_value" className="block text-sm font-medium text-gray-700">
                {settings.late_fee_type === 'percentage' ? 'Late Fee Percentage' : 'Late Fee Amount'}
              </label>
              <input
                type="number"
                id="late_fee_value"
                name="late_fee_value"
                min="0"
                step="0.01"
                value={settings.late_fee_value || 0}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {formErrors.late_fee_value && (
                <p className="mt-1 text-sm text-red-600">{formErrors.late_fee_value}</p>
              )}
            </div>
            <div>
              <label htmlFor="late_fee_max" className="block text-sm font-medium text-gray-700">
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {formErrors.late_fee_max && (
                <p className="mt-1 text-sm text-red-600">{formErrors.late_fee_max}</p>
              )}
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="late_fee_recurring"
                name="late_fee_recurring"
                checked={settings.late_fee_recurring || false}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="late_fee_recurring" className="ml-2 block text-sm text-gray-700">
                Recurring Late Fee (charge every period)
              </label>
            </div>
          </div>
        </div>

        {/* Payment Reminders */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Payment Reminders</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="reminder_before_due"
                  name="reminder_before_due"
                  checked={settings.reminder_before_due || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="reminder_before_due" className="ml-2 block text-sm text-gray-700">
                  Send reminder before due date
                </label>
              </div>
              {settings.reminder_before_due && (
                <div className="ml-6">
                  <label htmlFor="reminder_before_days" className="block text-sm font-medium text-gray-700">
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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  {formErrors.reminder_before_days && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.reminder_before_days}</p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="reminder_after_due"
                  name="reminder_after_due"
                  checked={settings.reminder_after_due || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="reminder_after_due" className="ml-2 block text-sm text-gray-700">
                  Send reminder after due date
                </label>
              </div>
              {settings.reminder_after_due && (
                <div className="ml-6">
                  <label htmlFor="reminder_after_days" className="block text-sm font-medium text-gray-700">
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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  {formErrors.reminder_after_days && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.reminder_after_days}</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="reminder_method" className="block text-sm font-medium text-gray-700">
                Reminder Method
              </label>
              <select
                id="reminder_method"
                name="reminder_method"
                value={settings.reminder_method || 'email'}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="both">Both Email and SMS</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}