import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiEdit2, FiSave, FiX, FiPlusCircle } from "react-icons/fi";
import { useAuth } from "../../../AuthProvider";
import API_BASE_URL from "../../../api";

function BusinessInfoForm() {
  const { user, token, updateUser } = useAuth();
  const [business, setBusiness] = useState(null);
  const [owner, setOwner] = useState(null);
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [loading, setLoading] = useState({ business: false, owner: false });
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Initialize form states with all required fields
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
        setBusinessForm(response.data);
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
      const config = { 
        headers: { 
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        } 
      };

      let response;
      if (isCreating) {
        response = await axios.post(
          `${API_BASE_URL}/businesses`,
          businessForm,
          config
        );
        setIsCreating(false);
      } else {
        response = await axios.put(
          `${API_BASE_URL}/businesses/${business.id}`,
          businessForm,
          config
        );
      }

      setBusiness(response.data);
      updateUser({ ...user, hasBusiness: true });
      setIsBusinessModalOpen(false);
    } catch (err) {
      console.error("Business operation failed:", err);
      setError(
        err.response?.data?.message || 
        (isCreating ? "Failed to create business" : "Failed to update business")
      );
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
      setError(err.response?.data?.message || "Failed to update profile");
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
    return <div className="p-6 text-center">Loading information...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Business Section */}
      {business ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Business Profile</h2>
            <button
              onClick={openBusinessEdit}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <FiEdit2 className="mr-1" /> Edit
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Business Name</h3>
              <p className="mt-1 text-gray-900">{business.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mt-1 text-gray-900">{business.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Phone</h3>
              <p className="mt-1 text-gray-900">{business.phone}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Address</h3>
              <p className="mt-1 text-gray-900">{business.address}</p>
            </div>
            {business.website && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Website</h3>
                <p className="mt-1 text-blue-600 hover:underline">
                  <a href={business.website.startsWith('http') ? business.website : `https://${business.website}`} target="_blank" rel="noopener noreferrer">
                    {business.website}
                  </a>
                </p>
              </div>
            )}
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="mt-1 text-gray-900">
                {business.description || "No description provided"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">No Business Profile</h2>
          <p className="text-gray-600 mb-6">You need to set up your business profile to continue</p>
          <button
            onClick={() => {
              setIsCreating(true);
              openBusinessEdit();
            }}
            className="flex items-center justify-center mx-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FiPlusCircle className="mr-2" /> Create Business Profile
          </button>
        </div>
      )}

      {/* Owner Account Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Owner Account</h2>
          <button
            onClick={openOwnerEdit}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FiEdit2 className="mr-1" /> Edit
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
            <p className="mt-1 text-gray-900">{owner.name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Email</h3>
            <p className="mt-1 text-gray-900">{owner.email}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Phone</h3>
            <p className="mt-1 text-gray-900">{owner.phone || "Not provided"}</p>
          </div>
        </div>
      </div>

      {/* Business Form Modal */}
      {isBusinessModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-semibold">
                {isCreating ? "Create Business Profile" : "Edit Business Profile"}
              </h3>
              <button 
                onClick={() => setIsBusinessModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleBusinessSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {error && (
                <div className="md:col-span-2 p-2 bg-red-100 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={businessForm.name}
                  onChange={handleBusinessChange}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={businessForm.email}
                  onChange={handleBusinessChange}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={businessForm.phone}
                  onChange={handleBusinessChange}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={businessForm.address}
                  onChange={handleBusinessChange}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={businessForm.website}
                  onChange={handleBusinessChange}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={businessForm.description}
                  onChange={handleBusinessChange}
                  rows={3}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2 flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsBusinessModalOpen(false)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading.business}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-70 flex items-center justify-center"
                >
                  {loading.business ? (
                    <>
                      <FiSave className="animate-spin mr-2" />
                      {isCreating ? "Creating..." : "Saving..."}
                    </>
                  ) : isCreating ? "Create Business" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Owner Edit Modal */}
      {isOwnerModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-semibold">Edit Owner Profile</h3>
              <button 
                onClick={() => setIsOwnerModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleOwnerSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-2 bg-red-100 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={ownerForm.name}
                  onChange={handleOwnerChange}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={ownerForm.email}
                  onChange={handleOwnerChange}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={ownerForm.phone}
                  onChange={handleOwnerChange}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOwnerModalOpen(false)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading.owner}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-70 flex items-center justify-center"
                >
                  {loading.owner ? (
                    <>
                      <FiSave className="animate-spin mr-2" />
                      Saving...
                    </>
                  ) : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BusinessInfoForm;