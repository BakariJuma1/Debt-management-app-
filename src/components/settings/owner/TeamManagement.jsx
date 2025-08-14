import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../AuthProvider";
import API_BASE_URL from "../../../api";
import { X, RefreshCw, UserPlus, Users, Mail, Clock } from "lucide-react";

const TeamManagement = () => {
  const { token } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLogs, setActionLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("members");
  
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    role: "salesperson"
  });

  // Fetch team data
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
      await axios.post(
        `${API_BASE_URL}/owner/invitations`,
        inviteForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInviteForm({ name: "", email: "", role: "salesperson" });
      fetchTeamData();
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
      fetchTeamData();
    } catch (err) {
      console.error("Failed to resend invitation:", err);
      setError(err.response?.data?.message || "Failed to resend invitation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Cancel invitation
  const cancelInvitation = async (invitationId) => {
    if (!confirm("Are you sure you want to cancel this invitation?")) return;
    setLoading(true);
    try {
      await axios.delete(
        `${API_BASE_URL}/owner/invitations/${invitationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTeamData();
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
      fetchTeamData();
    } catch (err) {
      console.error("Failed to update user role:", err);
      setError("Failed to update user role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Remove user
  const removeUser = async (userId) => {
    if (!confirm("Are you sure you want to remove this user?")) return;
    setLoading(true);
    try {
      await axios.delete(
        `${API_BASE_URL}/owner/team/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTeamData();
    } catch (err) {
      console.error("Failed to remove user:", err);
      setError("Failed to remove user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
    fetchActionLogs();
  }, [token]);

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Team Management</h1>
          <p className="text-gray-600 mt-1">
            {activeTab === "members" && "Manage your team members and their roles"}
            {activeTab === "invitations" && "Send and manage invitations"}
            {activeTab === "actions" && "View recent team activity"}
          </p>
        </div>
        <button
          onClick={fetchTeamData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button 
            onClick={() => setError(null)} 
            className="text-red-700 hover:text-red-900 p-1 rounded-full hover:bg-red-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
      
      {/* Tabs */}
      <div className="flex overflow-x-auto pb-2 mb-6 scrollbar-hide">
        <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "members" ? "bg-white shadow text-blue-600" : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"}`}
            onClick={() => setActiveTab("members")}
          >
            <Users className="h-4 w-4" />
            Team Members
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "invitations" ? "bg-white shadow text-blue-600" : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"}`}
            onClick={() => setActiveTab("invitations")}
          >
            <Mail className="h-4 w-4" />
            Invitations
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "actions" ? "bg-white shadow text-blue-600" : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"}`}
            onClick={() => setActiveTab("actions")}
          >
            <Clock className="h-4 w-4" />
            Action Logs
          </button>
        </div>
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="space-y-4">
          <div className="h-10 w-full bg-gray-100 rounded-lg animate-pulse"></div>
          <div className="h-20 w-full bg-gray-100 rounded-lg animate-pulse"></div>
        </div>
      )}
      
      {/* Team Members Tab */}
      {activeTab === "members" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Team Members</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamMembers.length > 0 ? (
                  teamMembers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          disabled={loading}
                        >
                          <option value="manager">Manager</option>
                          <option value="salesperson">Salesperson</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => removeUser(user.id)}
                          className="text-red-600 hover:text-red-900 font-medium disabled:opacity-50"
                          disabled={loading}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center">
                      <div className="text-gray-500">
                        {loading ? (
                          <div className="flex justify-center">
                            <RefreshCw className="h-5 w-5 animate-spin" />
                          </div>
                        ) : (
                          "No team members found"
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Invitations Tab */}
      {activeTab === "invitations" && (
        <div className="space-y-6">
          {/* Invitation Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <UserPlus className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Invite New Member</h2>
            </div>
            <form onSubmit={sendInvitation} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm({...inviteForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({...inviteForm, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="manager">Manager</option>
                  <option value="salesperson">Salesperson</option>
                </select>
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Invitation"
                  )}
                </button>
              </div>
            </form>
          </div>
          
          {/* Pending Invitations List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Pending Invitations</h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {invitations.length} pending
              </span>
            </div>
            <div className="overflow-x-auto">
              {invitations.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invitations.map((invite) => (
                      <tr key={invite.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invite.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invite.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{invite.role}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                          <button
                            onClick={() => resendInvitation(invite.id)}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                            disabled={loading}
                          >
                            Resend
                          </button>
                          <button
                            onClick={() => cancelInvitation(invite.id)}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            disabled={loading}
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="px-6 py-8 text-center">
                  <div className="text-gray-500">
                    {loading ? (
                      <div className="flex justify-center">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                      </div>
                    ) : (
                      "No pending invitations"
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Logs Tab */}
      {activeTab === "actions" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {actionLogs.length} log{actionLogs.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="overflow-x-auto">
            {actionLogs.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {actionLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                        {log.action.replace(/_/g, ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.changed_by_name || log.changed_by}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="capitalize">{log.target_type}</span>: {log.target_name || log.target_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-8 text-center">
                <div className="text-gray-500">
                  {loading ? (
                    <div className="flex justify-center">
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    </div>
                  ) : (
                    "No action logs available"
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;