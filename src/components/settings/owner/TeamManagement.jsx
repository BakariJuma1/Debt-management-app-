import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../AuthProvider";
import API_BASE_URL from "../../../api";

const TeamManagement = () => {
  const { token } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("members");
  const [actionLogs, setActionLogs] = useState([]);
  
  // New invitation form state
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    role: "salesperson"
  });

  // Fetch team data (members + invitations)
  const fetchTeamData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/owner/team`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTeamMembers(response.data.users || []);
      setInvitations(response.data.invitations || []);
    } catch (err) {
      console.error("Failed to fetch team data:", err);
      setError("Failed to load team data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch action logs
  const fetchActionLogs = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/changelogs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActionLogs(response.data);
    } catch (err) {
      console.error("Failed to fetch action logs:", err);
      // Don't show error if it's just CORS - we'll handle it gracefully
      if (err.code !== "ERR_NETWORK") {
        setError("Failed to load action logs. Please try again.");
      }
    }
  };

  // Send new invitation
  const sendInvitation = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/owner/invitations`,
        inviteForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setInviteForm({ name: "", email: "", role: "salesperson" });
      fetchTeamData(); // Refresh the list
      setError(null);
    } catch (err) {
      console.error("Failed to send invitation:", err);
      setError(err.response?.data?.message || "Failed to send invitation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend invitation
  const resendInvitation = async (invitationId) => {
    setLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/owner/invitations/${invitationId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTeamData(); // Refresh data
      setError(null);
    } catch (err) {
      console.error("Failed to resend invitation:", err);
      setError(err.response?.data?.message || "Failed to resend invitation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Cancel invitation
  const cancelInvitation = async (invitationId) => {
    if (!window.confirm("Are you sure you want to cancel this invitation?")) return;
    
    setLoading(true);
    try {
      await axios.delete(
        `${API_BASE_URL}/owner/invitations/${invitationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTeamData(); // Refresh data
      setError(null);
    } catch (err) {
      console.error("Failed to cancel invitation:", err);
      setError("Failed to cancel invitation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Update user role
  const updateUserRole = async (userId, newRole) => {
    setLoading(true);
    try {
      await axios.put(
        `${API_BASE_URL}/owner/team/${userId}`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTeamData(); // Refresh data
      setError(null);
    } catch (err) {
      console.error("Failed to update user role:", err);
      setError("Failed to update user role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Remove user
  const removeUser = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this user?")) return;
    
    setLoading(true);
    try {
      await axios.delete(
        `${API_BASE_URL}/owner/team/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTeamData(); // Refresh data
      setError(null);
    } catch (err) {
      console.error("Failed to remove user:", err);
      setError("Failed to remove user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchTeamData();
    fetchActionLogs();
  }, [token]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Team Management</h1>
      
      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
          {error}
          <button 
            onClick={() => setError(null)} 
            className="float-right font-bold"
          >
            ×
          </button>
        </div>
      )}
      
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 font-medium ${activeTab === "members" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("members")}
        >
          Team Members
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === "invitations" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("invitations")}
        >
          Invitations
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === "actions" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("actions")}
        >
          Action Logs
        </button>
      </div>
      
      {/* Loading state */}
      {loading && <div className="text-center py-4">Loading...</div>}
      
      {/* Team Members Tab */}
      {activeTab === "members" && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teamMembers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                      className="border rounded p-1"
                      disabled={loading}
                    >
                      <option value="manager">Manager</option>
                      <option value="salesperson">Salesperson</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => removeUser(user.id)}
                      className="text-red-600 hover:text-red-800"
                      disabled={loading}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Invitations Tab */}
      {activeTab === "invitations" && (
        <div className="space-y-6">
          {/* Invitation Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Send New Invitation</h2>
            <form onSubmit={sendInvitation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({...inviteForm, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({...inviteForm, role: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="manager">Manager</option>
                  <option value="salesperson">Salesperson</option>
                </select>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Send Invitation
              </button>
            </form>
          </div>
          
          {/* Pending Invitations List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <h2 className="text-xl font-semibold p-6">Pending Invitations</h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invitations.map((invite) => (
                  <tr key={invite.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{invite.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{invite.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{invite.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <button
                        onClick={() => resendInvitation(invite.id)}
                        className="text-blue-600 hover:text-blue-800"
                        disabled={loading}
                      >
                        Resend
                      </button>
                      <button
                        onClick={() => cancelInvitation(invite.id)}
                        className="text-red-600 hover:text-red-800"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Logs Tab */}
      {activeTab === "actions" && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Action Logs</h2>
            {actionLogs.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {actionLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{log.action}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{log.changed_by_name || log.changed_by}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{log.target_type}: {log.target_name || log.target_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {loading ? "Loading action logs..." : "No action logs available"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;