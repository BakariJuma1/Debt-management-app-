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

  // First get the current user's business
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
          `${API_BASE_URL}/settings/${businessRes.data.id}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        setSettings(settingsRes.data);
        
        // 3. Get available currencies
        const currenciesRes = await axios.get(`${API_BASE_URL}/currencies`);
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
              late_fee_value: 5,
              late_fee_recurring: false,
              reminder_before_due: true,
              reminder_before_days: 3,
              reminder_after_due: true,
              reminder_after_days: 1
            };
            
            const createRes = await axios.post(
              `${API_BASE_URL}/settings/${currentBusiness.id}`,
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
    const newValue = type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value;

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
        `${API_BASE_URL}/settings/${currentBusiness.id}`,
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
        {/* Your existing form fields here */}
        {/* ... */}
        
        <div className="flex justify-end space-x-4">
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