import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

export default function MyProfile() {
  const [business, setBusiness] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        // if (!token) {
        //   navigate('/login');
        //   return;
        // }

        const decoded = jwtDecode(token);
        const userId = decoded.sub;

        // Fetch user data
        const userResponse = await axios.get(`/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(userResponse.data);

        // Fetch business data based on user role
        const businessResponse = await axios.get('/business/my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (businessResponse.data) {
          setBusiness(businessResponse.data);
        }

        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch profile data');
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  if (loading) return <div className="text-center py-8">Loading profile...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Business Profile Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Business Profile</h2>
        
        {business ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">{business.name}</h3>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Owner:</span> {user?.name || 'N/A'}
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Email:</span> {business.email}
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Phone:</span> {business.phone}
              </p>
              {business.website && (
                <p className="text-gray-600 mb-1">
                  <span className="font-medium">Website:</span> 
                  <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                    {business.website}
                  </a>
                </p>
              )}
            </div>
            
            <div>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Address:</span> {business.address}
              </p>
              {business.description && (
                <div className="mt-4">
                  <h4 className="font-medium mb-1">Description:</h4>
                  <p className="text-gray-600">{business.description}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">No business associated with your account</p>
            {user?.role === 'owner' && (
              <button 
                onClick={() => navigate('/business/create')}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Create Business
              </button>
            )}
          </div>
        )}
      </div>

      {/* User Profile Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Profile</h2>
        
        {user && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">{user.name}</h3>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Email:</span> {user.email}
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Role:</span> 
                <span className={`ml-1 px-2 py-1 text-xs rounded-full ${
                  user.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                  user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {user.role}
                </span>
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Joined:</span> {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
            
            <div>
              {business && user.role !== 'owner' && (
                <p className="text-gray-600 mb-1">
                  <span className="font-medium">Associated with:</span> {business.name}
                </p>
              )}
              
              {/* Add more user details here */}
              <div className="mt-4">
                <button 
                  onClick={() => navigate('/profile/edit')}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition mr-3"
                >
                  Edit Profile
                </button>
                
                {user.role === 'owner' && business && (
                  <button 
                    onClick={() => navigate(`/business/edit/${business.id}`)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    Edit Business
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}