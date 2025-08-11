import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../api';
import { useAuth } from '../../AuthProvider';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { manualLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState({ text: '', isError: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!otp) {
      setMessage({ text: 'Please enter the verification code.', isError: true });
      return;
    }

    setLoading(true);
    setMessage({ text: '', isError: false });

    try {
      const res = await axios.post(`${API_BASE_URL}/verify-email`, {
        email,
        otp,
      });

      if (res.data.token && res.data.user) {
        setMessage({ text: 'Email verified! Logging you in...', isError: false });

        manualLogin(res.data.user, res.data.token);

        setTimeout(() => {
          const { role, hasBusiness } = res.data.user;

          if (role === 'owner' && !hasBusiness) {
            navigate('/settings');
          } else if (role === 'owner') {
            navigate('/dashboard');
          } else if (role === 'manager') {
            navigate('/dashboard');
          } else {
            navigate('/');
          }
        }, 1500);
      } else {
        setMessage({ text: 'Verification succeeded but login info missing.', isError: true });
      }
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || 'Verification failed. Please try again.',
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setMessage({ text: 'Email not found. Please login again.', isError: true });
      return;
    }

    setLoading(true);
    setMessage({ text: '', isError: false });

    try {
      await axios.post(`${API_BASE_URL}/resend-verification`, { email });
      setMessage({ text: 'New verification email sent!', isError: false });
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || 'Failed to resend verification email.',
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded shadow">
        <h2 className="text-3xl font-bold text-gray-900 text-center">Verify Your Email</h2>

        {email && (
          <p className="text-center text-gray-600 mb-4">
            Verification code sent to <span className="font-semibold">{email}</span>
          </p>
        )}

        {message.text && (
          <div
            className={`p-4 rounded-md ${
              message.isError ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
            }`}
          >
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={handleResendCode}
            disabled={loading}
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            Didn't get the code? Resend
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
