import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiEdit2, FiSave, FiX } from "react-icons/fi";
import { useAuth } from "../../../AuthProvider";
import API_BASE_URL from "../../../api";

function BusinessInfoForm() {
  const { user, token, updateUser } = useAuth();
  const [business, setBusiness] = useState(null);
  const [owner, setOwner] = useState(null);
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Business form state
  const [businessForm, setBusinessForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    description: "",
  });

  // Owner form state
  const [ownerForm, setOwnerForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        // Fetch business data
        const businessRes = await axios.get(`${API_BASE_URL}/businesses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBusiness(businessRes.data);
        setBusinessForm(businessRes.data);

        // Fetch owner data
        const ownerRes = await axios.get(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOwner(ownerRes.data);
        setOwnerForm({
          name: ownerRes.data.name,
          email: ownerRes.data.email,
          phone: ownerRes.data.phone || "",
        });
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
      }
    };

    if (token) {
      fetchBusinessData();
    }
  }, [token]);

  const handleBusinessUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.put(
        `${API_BASE_URL}/businesses/${business.id}`,
        businessForm,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setBusiness(response.data);
      setIsBusinessModalOpen(false);
    } catch (err) {
      console.error("Update error:", err);
      setError(err.response?.data?.message || "Failed to update business");
    } finally {
      setLoading(false);
    }
  };

  const handleOwnerUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.put(
        `${API_BASE_URL}/users/me`,
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
      console.error("Update error:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessChange = (e) => {
    setBusinessForm({ ...businessForm, [e.target.name]: e.target.value });
  };

  const handleOwnerChange = (e) => {
    setOwnerForm({ ...ownerForm, [e.target.name]: e.target.value });
  };

  if (!business || !owner) {
    return <div className="p-6 text-center">Loading business information...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Business Profile Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Business Profile</h2>
          <button
            onClick={() => setIsBusinessModalOpen(true)}
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
          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-gray-500">Description</h3>
            <p className="mt-1 text-gray-900">
              {business.description || "No description provided"}
            </p>
          </div>
        </div>
      </div>

      {/* Owner Account Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Owner Account</h2>
          <button
            onClick={() => setIsOwnerModalOpen(true)}
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

      {/* Business Edit Modal */}
      {isBusinessModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-semibold">Edit Business Profile</h3>
              <button onClick={() => setIsBusinessModalOpen(false)}>
                <FiX className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            <form onSubmit={handleBusinessUpdate} className="p-4 space-y-4">
              {error && (
                <div className="p-2 bg-red-100 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={businessForm.name}
                  onChange={handleBusinessChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              {/* Other business fields... */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsBusinessModalOpen(false)}
                  className="px-4 py-2 border rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-70"
                >
                  {loading ? "Saving..." : "Save Changes"}
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
              <button onClick={() => setIsOwnerModalOpen(false)}>
                <FiX className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            <form onSubmit={handleOwnerUpdate} className="p-4 space-y-4">
              {error && (
                <div className="p-2 bg-red-100 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={ownerForm.name}
                  onChange={handleOwnerChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              {/* Other owner fields... */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOwnerModalOpen(false)}
                  className="px-4 py-2 border rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-70"
                >
                  {loading ? "Saving..." : "Save Changes"}
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