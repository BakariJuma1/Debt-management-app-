import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_BASE_URL  from '../../../api';
import axios from 'axios';


export default function FinanceSettings() {
  const { businessId } = useParams();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currencies, setCurrencies] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchAllData();
  }, [businessId]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchSettings(),
        fetchCurrencies()
      ]);
    } catch (error) {
      toast.error('Failed to load finance settings');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/finance/settings/${businessId}`);
      setSettings(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        // Create default settings if not found
        await createDefaultSettings();
      } else {
        throw error;
      }
    }
  };

  const createDefaultSettings = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/finance/settings/${businessId}`, {
        default_currency: 'USD',
        payment_due_day: 1,
        grace_period_days: 5,
        late_fee_type: 'percentage',
        late_fee_value: 5,
        late_fee_recurring: false,
        reminder_before_due: true,
        reminder_before_days: 3,
        reminder_after_due: true,
        reminder_after_days: 1
      });
      setSettings(response.data);
    } catch (error) {
      toast.error('Failed to create default settings');
      console.error('Error creating settings:', error);
    }
  };

  const fetchCurrencies = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/finance/currencies`);
      // Handle both array and object response formats
      setCurrencies(Array.isArray(response.data) ? response.data : response.data.currencies);
    } catch (error) {
      toast.error('Failed to load currencies');
      console.error('Error loading currencies:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : 
                    type === 'number' ? parseFloat(value) : value;
    
    setSettings(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear error when field is changed
    setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!settings.default_currency) {
      errors.default_currency = 'Currency is required';
    }
    
    if (settings.payment_due_day < 1 || settings.payment_due_day > 31) {
      errors.payment_due_day = 'Must be between 1-31';
    }
    
    if (settings.grace_period_days < 0 || settings.grace_period_days > 30) {
      errors.grace_period_days = 'Must be between 0-30';
    }
    
    if (settings.late_fee_value < 0) {
      errors.late_fee_value = 'Must be positive';
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

    try {
      await axios.put(`${API_BASE_URL}/finance/settings/${businessId}`, settings);
      toast.success('Settings updated successfully');
      
      // Refresh data to ensure we have latest from server
      await fetchSettings();
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error(error.response?.data?.message || 'Failed to update settings');
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
          onClick={fetchAllData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-6">Finance Settings</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Currency Section */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Default Currency</h3>
            <select
              name="default_currency"
              value={settings.default_currency}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${formErrors.default_currency ? 'border-red-500' : ''}`}
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.name} ({currency.code})
                </option>
              ))}
            </select>
            {formErrors.default_currency && (
              <p className="text-red-500 text-sm mt-1">{formErrors.default_currency}</p>
            )}
          </div>

          {/* Payment Terms */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Payment Terms</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Payment Due Day</label>
                <input
                  type="number"
                  name="payment_due_day"
                  min="1"
                  max="31"
                  value={settings.payment_due_day}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded ${formErrors.payment_due_day ? 'border-red-500' : ''}`}
                />
                {formErrors.payment_due_day && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.payment_due_day}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium">Grace Period (days)</label>
                <input
                  type="number"
                  name="grace_period_days"
                  min="0"
                  max="30"
                  value={settings.grace_period_days}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded ${formErrors.grace_period_days ? 'border-red-500' : ''}`}
                />
                {formErrors.grace_period_days && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.grace_period_days}</p>
                )}
              </div>
            </div>
          </div>

          {/* Late Fee Rules */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Late Fee Rules</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Late Fee Type</label>
                <select
                  name="late_fee_type"
                  value={settings.late_fee_type}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">
                  {settings.late_fee_type === 'percentage' ? 'Percentage' : 'Amount'}
                </label>
                <input
                  type="number"
                  name="late_fee_value"
                  min="0"
                  step="0.01"
                  value={settings.late_fee_value}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded ${formErrors.late_fee_value ? 'border-red-500' : ''}`}
                />
                {formErrors.late_fee_value && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.late_fee_value}</p>
                )}
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="late_fee_recurring"
                    checked={settings.late_fee_recurring}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Recurring Late Fee
                </label>
              </div>
            </div>
          </div>

          {/* Reminder Settings */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Payment Reminders</h3>
            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="reminder_before_due"
                    checked={settings.reminder_before_due}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Send reminder before due date
                </label>
                {settings.reminder_before_due && (
                  <div className="ml-6 mt-2">
                    <label className="block text-sm font-medium">Days before</label>
                    <input
                      type="number"
                      name="reminder_before_days"
                      min="1"
                      max="30"
                      value={settings.reminder_before_days}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="reminder_after_due"
                    checked={settings.reminder_after_due}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Send reminder after due date
                </label>
                {settings.reminder_after_due && (
                  <div className="ml-6 mt-2">
                    <label className="block text-sm font-medium">Days after</label>
                    <input
                      type="number"
                      name="reminder_after_days"
                      min="1"
                      max="30"
                      value={settings.reminder_after_days}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={fetchAllData}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Refresh
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