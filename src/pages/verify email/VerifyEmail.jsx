import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../api';
import { useAuth } from '../../AuthProvider';
import { FiMail, FiLock, FiRefreshCw } from 'react-icons/fi';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { manualLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [message, setMessage] = useState({ text: '', isError: false });
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Format email to show only first part and domain (e.g. "joh***@gmail.com")
  const formatPartialEmail = (email) => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    const maskedUsername = username.length > 3 
      ? `${username.substring(0, 3)}${'*'.repeat(username.length - 3)}`
      : '*'.repeat(username.length);
    return `${maskedUsername}@${domain}`;
  };

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  // Handle OTP input with separate boxes
  const handleOtpChange = (element, index) => {
    const newOtp = [...otp];
    newOtp[index] = element.value.slice(-1); // Only take last character
    setOtp(newOtp);

    // Auto-focus next input
    if (element.value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');

    if (fullOtp.length !== 6) {
      setMessage({ text: 'Please enter the full 6-digit code.', isError: true });
      return;
    }

    setLoading(true);
    setMessage({ text: '', isError: false });

    try {
      const res = await axios.post(`${API_BASE_URL}/verify-email`, {
        email,
        otp: fullOtp,
      });

      if (res.data.token && res.data.user) {
        setMessage({ text: 'Email verified! Logging you in...', isError: false });
        const loggedInUser = await manualLogin(res.data.user, res.data.token);
        
        if (loggedInUser.role === 'owner') {
          navigate('/settings', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
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
    setResendCooldown(30); // 30 second cooldown
    setOtp(Array(6).fill('')); // Clear the OTP input fields

    try {
      await axios.post(`${API_BASE_URL}/resend-verification`, { email });
      setMessage({ text: 'New verification code sent!', isError: false });
      
      // Start cooldown timer
      const timer = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || 'Failed to resend verification code.',
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 bg-white bg-opacity-20 rounded-full">
            <FiMail className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-white">Verify Your Email</h2>
          {email && (
            <p className="mt-2 text-blue-100">
              Code sent to <span className="font-medium">{formatPartialEmail(email)}</span>
            </p>
          )}
        </div>

        <div className="p-6 sm:p-8">
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-start ${
                message.isError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
              }`}
            >
              <div className="flex-shrink-0">
                {message.isError ? (
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                Enter 6-digit verification code
              </label>
              <div className="flex justify-between space-x-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[index]}
                    onChange={(e) => handleOtpChange(e.target, index)}
                    onFocus={(e) => e.target.select()}
                    className="w-full h-12 text-center text-xl font-medium border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center ${
                loading ? 'opacity-80 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleResendCode}
              disabled={loading || resendCooldown > 0}
              className="text-sm font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400 inline-flex items-center"
            >
              <FiRefreshCw className="mr-1.5" />
              {resendCooldown > 0 ? (
                `Resend code in ${resendCooldown}s`
              ) : (
                "Didn't receive code? Resend"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;