import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiEdit2, FiSave, FiX, FiPlusCircle, FiBriefcase, FiUser } from "react-icons/fi";
import { useAuth } from "../../../AuthProvider";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../../api";
import { usePostSubmission } from "../../../hooks/usePostSubmission";

function BusinessInfoForm({ isInSidebar = false }) {
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [owner, setOwner] = useState(null);
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [loading, setLoading] = useState({ business: false, owner: false });
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const { handleBusinessCreationSuccess } = usePostSubmission();

  // Form states
  const [businessForm, setBusinessForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: user?.email || "",
    website: "",
    description: "",
  });

  const [ownerForm, setOwnerForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const fetchBusinessData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/business/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setBusiness(response.data);

      setBusinessForm({
        name: response.data.name || "",
        address: response.data.address || "",
        phone: response.data.phone || "",
        email: response.data.email || "",
        website: response.data.website || "",
        description: response.data.description || "",
      });

        setIsCreating(false);
      } else {
        setIsCreating(true);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setIsCreating(true);
      } else {
        console.error("Error fetching business data:", err);
        setError("Failed to load business data");
      }
    }
  };

  const fetchOwnerData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOwner(response.data);
      setOwnerForm({
        name: response.data.name,
        email: response.data.email,
        phone: response.data.phone || "",
      });
    } catch (err) {
      console.error("Error fetching owner data:", err);
      setError("Failed to load owner data");
    }
  };

  useEffect(() => {
    if (token) {
      Promise.all([fetchBusinessData(), fetchOwnerData()])
        .catch(err => console.error("Initial data fetch error:", err));
    }
  }, [token]);

  const handleBusinessSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, business: true }));
    setError(null);

    try {
      console.log('Submitting business form...', businessForm);
      
      // Trim whitespace from all fields as backend does
      const cleanedForm = Object.keys(businessForm).reduce((acc, key) => {
        acc[key] = typeof businessForm[key] === 'string' ? businessForm[key].trim() : businessForm[key];
        return acc;
      }, {});

      const response = await axios.post(`${API_BASE_URL}/businesses`, cleanedForm, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Business created:', response.data);
      await handleBusinessCreationSuccess(response.data);
      setBusiness(response.data.business);
      setIsBusinessModalOpen(false);
      setIsCreating(false);
      
    } catch (err) {
      console.error('Business creation failed:', err);
      
      // Show detailed validation errors from backend
      if (err.response?.data?.errors) {
        const errorMessages = Object.entries(err.response.data.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('; ');
        setError({type: 'error', message: errorMessages});
      } else {
        setError({type: 'error', message: err.response?.data?.message || "Failed to create business"});
      }
    } finally {
      setLoading(prev => ({ ...prev, business: false }));
    }
  };

  const handleOwnerSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, owner: true }));
    setError(null);

    try {
      const response = await axios.put(
        `${API_BASE_URL}/me`,
        ownerForm,
        { 
          headers: { 
            Authorization: `Bearer ${token}`, 
            'Content-Type': 'application/json' 
          } 
        }
      );

      setOwner(response.data);
      updateUser(response.data);
      setIsOwnerModalOpen(false);
    } catch (err) {
      console.error("Owner update failed:", err);
      setError({type: 'error', message: err.response?.data?.message || "Failed to update profile"});
    } finally {
      setLoading(prev => ({ ...prev, owner: false }));
    }
  };

  const handleBusinessChange = (e) => {
    const { name, value } = e.target;
    setBusinessForm(prev => ({ ...prev, [name]: value }));
  };

  const handleOwnerChange = (e) => {
    const { name, value } = e.target;
    setOwnerForm(prev => ({ ...prev, [name]: value }));
  };

  const openBusinessEdit = () => {
    setBusinessForm(business || {
      name: "",
      address: "",
      phone: "",
      email: user?.email || "",
      website: "",
      description: "",
    });
    setIsBusinessModalOpen(true);
  };

  const openOwnerEdit = () => {
    setOwnerForm({
      name: owner?.name || "",
      email: owner?.email || "",
      phone: owner?.phone || "",
    });
    setIsOwnerModalOpen(true);
  };

  if (!owner) {
    return (
      <div className={`flex items-center justify-center ${isInSidebar ? 'h-full' : 'min-h-[300px]'}`}>
        <div className="animate-pulse text-gray-500">Loading information...</div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isInSidebar ? 'p-4' : 'pt-25 p-6 md:p-8 md:pt-25 lg:p-10 xl:pt-28 lg:pt-28'}`}>
      {/* Business Section */}
      {business ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-white p-2 rounded-lg shadow-xs mr-3">
                <FiBriefcase className="text-blue-600 text-lg" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Business Profile</h2>
            </div>
            <button
              onClick={openBusinessEdit}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800 bg-white px-3 py-1.5 rounded-lg shadow-xs border border-blue-100"
            >
              <FiEdit2 className="mr-1.5" /> Edit
            </button>
          </div>

          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <InfoField label="Business Name" value={business.name} />
            <InfoField label="Email" value={business.email} />
            <InfoField label="Phone" value={business.phone} />
            <InfoField label="Address" value={business.address} />
            {business.website && (
              <InfoField label="Website" value={business.website} isLink />
            )}
            <div className="md:col-span-2">
              <InfoField label="Description" value={business.description || "No description provided"} isMultiline />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <div className="mx-auto w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <FiBriefcase className="text-blue-600 text-2xl" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">No Business Profile</h2>
          <p className="text-gray-600 mb-6">Set up your business profile to unlock all features</p>
          <button
            onClick={() => {
              setIsCreating(true);
              openBusinessEdit();
            }}
            className="flex items-center justify-center mx-auto px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
          >
            <FiPlusCircle className="mr-2" /> Create Business Profile
          </button>
        </div>
      )}

      {/* Owner Account Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-white p-2 rounded-lg shadow-xs mr-3">
              <FiUser className="text-blue-600 text-lg" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Owner Account</h2>
          </div>
          <button
            onClick={openOwnerEdit}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800 bg-white px-3 py-1.5 rounded-lg shadow-xs border border-blue-100"
          >
            <FiEdit2 className="mr-1.5" /> Edit
          </button>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <InfoField label="Full Name" value={owner.name} />
          <InfoField label="Email" value={owner.email} />
          <InfoField label="Phone" value={owner.phone || "Not provided"} />
        </div>
      </div>

      {/* Business Form Modal */}
      <Modal 
        isOpen={isBusinessModalOpen} 
        onClose={() => setIsBusinessModalOpen(false)}
        title={isCreating ? "Create Business Profile" : "Edit Business Profile"}
        width="max-w-2xl"
      >
        <form onSubmit={handleBusinessSubmit} className="space-y-4">
          {error && (
            <div className={`p-3 rounded-lg text-sm flex items-start ${
              error.type === 'success' 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {error.type === 'error' ? (
                <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              <span>{error.message}</span>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Business Name *"
              name="name"
              value={businessForm.name}
              onChange={handleBusinessChange}
              required
            />

            <FormInput
              label="Email *"
              type="email"
              name="email"
              value={businessForm.email}
              onChange={handleBusinessChange}
              required
            />

            <FormInput
              label="Phone *"
              type="tel"
              name="phone"
              value={businessForm.phone}
              onChange={handleBusinessChange}
              required
            />

            <FormInput
              label="Website"
              type="url"
              name="website"
              value={businessForm.website}
              onChange={handleBusinessChange}
              placeholder="https://example.com"
            />
          </div>

          <FormInput
            label="Address *"
            type="text"
            name="address"
            value={businessForm.address}
            onChange={handleBusinessChange}
            required
            fullWidth
          />

          <FormTextarea
            label="Description"
            name="description"
            value={businessForm.description}
            onChange={handleBusinessChange}
            rows={3}
          />

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsBusinessModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <SubmitButton
              loading={loading.business}
              text={isCreating ? "Create Business" : "Save Changes"}
              loadingText={isCreating ? "Creating..." : "Saving..."}
            />
          </div>
        </form>
      </Modal>

      {/* Owner Edit Modal */}
      <Modal 
        isOpen={isOwnerModalOpen} 
        onClose={() => setIsOwnerModalOpen(false)}
        title="Edit Owner Profile"
        width="max-w-md"
      >
        <form onSubmit={handleOwnerSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-start">
              <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error.message}</span>
            </div>
          )}
          
          <FormInput
            label="Full Name *"
            name="name"
            value={ownerForm.name}
            onChange={handleOwnerChange}
            required
            fullWidth
          />

          <FormInput
            label="Email *"
            type="email"
            name="email"
            value={ownerForm.email}
            onChange={handleOwnerChange}
            required
            fullWidth
          />

          <FormInput
            label="Phone"
            type="tel"
            name="phone"
            value={ownerForm.phone}
            onChange={handleOwnerChange}
            fullWidth
          />

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsOwnerModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <SubmitButton
              loading={loading.owner}
              text="Save Changes"
              loadingText="Saving..."
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

// Reusable Components
const InfoField = ({ label, value, isLink = false, isMultiline = false }) => (
  <div>
    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</h3>
    {isLink ? (
      <a 
        href={value.startsWith('http') ? value : `https://${value}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline break-all"
      >
        {value}
      </a>
    ) : isMultiline ? (
      <p className="text-gray-800 whitespace-pre-line">{value}</p>
    ) : (
      <p className="text-gray-800">{value || "-"}</p>
    )}
  </div>
);

const Modal = ({ isOpen, onClose, title, children, width = "max-w-md" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className={`bg-white rounded-xl shadow-2xl w-full ${width} max-h-[90vh] overflow-y-auto`}>
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 rounded-full p-1 hover:bg-gray-100"
          >
            <FiX size={20} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const FormInput = ({ label, type = "text", name, value, onChange, placeholder = "", required = false, fullWidth = false }) => (
  <div className={fullWidth ? "col-span-2" : ""}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
    />
  </div>
);

const FormTextarea = ({ label, name, value, onChange, rows = 3, fullWidth = false }) => (
  <div className={fullWidth ? "col-span-2" : ""}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
    />
  </div>
);

const SubmitButton = ({ loading, text, loadingText }) => (
  <button
    type="submit"
    disabled={loading}
    className={`px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 transition-all shadow-md hover:shadow-lg flex items-center justify-center min-w-[120px] ${
      loading ? "cursor-not-allowed" : ""
    }`}
  >
    {loading ? (
      <>
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {loadingText}
      </>
    ) : (
      text
    )}
  </button>
);

export default BusinessInfoForm;