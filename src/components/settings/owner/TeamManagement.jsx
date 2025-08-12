import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../../../api";

const TeamManagement = () => {
  // State for all team members
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  
  // State for onboarding new members
  const [onboardingData, setOnboardingData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "salesman" // default role
  });
  
  // State for editing members
  const [editingMember, setEditingMember] = useState(null);
  const [editFormData, setEditFormData] = useState({
    role: ""
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState("members");
  const [actionLogs, setActionLogs] = useState([]);

  // Available roles
  const roles = ["owner", "admin", "manager", "salesman"];

  // Fetch all team members
  const fetchTeamMembers = async () => {
    setLoadingMembers(true);
    try {
      const response = await axios.get(`${API_BASE_URL}owner/users`);
      setTeamMembers(response.data);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to fetch team members" });
    } finally {
      setLoadingMembers(false);
    }
  };

  // Fetch action logs
  const fetchActionLogs = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/changelogs`);
      setActionLogs(response.data);
    } catch (error) {
      console.error("Failed to fetch action logs:", error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchTeamMembers();
    fetchActionLogs();
  }, []);

  // Handle onboarding form changes
  const handleOnboardingChange = (e) => {
    setOnboardingData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Handle edit form changes
  const handleEditChange = (e) => {
    setEditFormData({
      role: e.target.value
    });
  };

  // Submit new team member
  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/owner/invite`, onboardingData);
      setMessage({ type: "success", text: "Invite sent successfully!" });
      setOnboardingData({ name: "", email: "", phone: "", role: "salesman" });
      fetchTeamMembers(); // Refresh the list
      fetchActionLogs(); // Refresh logs
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Error sending invite." });
    } finally {
      setLoading(false);
    }
  };

  // Start editing a member
  const startEditing = (member) => {
    setEditingMember(member);
    setEditFormData({
      role: member.role
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingMember(null);
  };

  // Submit member edits
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingMember) return;

    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/team-members/${editingMember.id}`, editFormData);
      setMessage({ type: "success", text: "Member updated successfully!" });
      setEditingMember(null);
      fetchTeamMembers(); // Refresh the list
      fetchActionLogs(); // Refresh logs
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Error updating member." });
    } finally {
      setLoading(false);
    }
  };

  // Resend invite
  const resendInvite = async (memberId) => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/team-members/${memberId}/resend-invite`);
      setMessage({ type: "success", text: "Invite resent successfully!" });
      fetchActionLogs(); // Refresh logs
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Error resending invite." });
    } finally {
      setLoading(false);
    }
  };

  // Remove team member
  const removeMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to remove this team member?")) return;
    
    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/team-members/${memberId}`);
      setMessage({ type: "success", text: "Member removed successfully!" });
      fetchTeamMembers(); // Refresh the list
      fetchActionLogs(); // Refresh logs
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Error removing member." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Team Management</h1>
      
      {/* Message display */}
      {message && (
        <div className={`mb-6 p-4 rounded ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message.text}
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
          className={`py-2 px-4 font-medium ${activeTab === "onboarding" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("onboarding")}
        >
          Onboarding
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === "actions" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("actions")}
        >
          Action Logs
        </button>
      </div>
      
      {/* Team Members Tab */}
      {activeTab === "members" && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Team Members</h2>
          
          {loadingMembers ? (
            <p>Loading team members...</p>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teamMembers.map((member) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{member.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{member.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{member.phone || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingMember?.id === member.id ? (
                          <select
                            name="role"
                            value={editFormData.role}
                            onChange={handleEditChange}
                            className="border rounded p-1"
                          >
                            {roles.map((role) => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </select>
                        ) : (
                          member.role
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {member.status === "active" ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingMember?.id === member.id ? (
                          <>
                            <button
                              onClick={handleEditSubmit}
                              className="text-blue-600 hover:text-blue-900 mr-2"
                              disabled={loading}
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(member)}
                              className="text-blue-600 hover:text-blue-900 mr-2"
                            >
                              Edit
                            </button>
                            {member.status !== "active" && (
                              <button
                                onClick={() => resendInvite(member.id)}
                                className="text-green-600 hover:text-green-900 mr-2"
                                disabled={loading}
                              >
                                Resend Invite
                              </button>
                            )}
                            <button
                              onClick={() => removeMember(member.id)}
                              className="text-red-600 hover:text-red-900"
                              disabled={loading}
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* Onboarding Tab */}
      {activeTab === "onboarding" && (
        <div className="max-w-md mx-auto p-6 bg-white rounded-md shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Onboard New Team Member</h2>
          
          <form onSubmit={handleOnboardingSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block mb-1 font-medium">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={onboardingData.name}
                onChange={handleOnboardingChange}
                required
                className="w-full px-3 py-2 border rounded"
                placeholder="Full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block mb-1 font-medium">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={onboardingData.email}
                onChange={handleOnboardingChange}
                required
                className="w-full px-3 py-2 border rounded"
                placeholder="member@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block mb-1 font-medium">Phone</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={onboardingData.phone}
                onChange={handleOnboardingChange}
                className="w-full px-3 py-2 border rounded"
                placeholder="+254 700 000000"
              />
            </div>

            <div>
              <label htmlFor="role" className="block mb-1 font-medium">Role</label>
              <select
                id="role"
                name="role"
                value={onboardingData.role}
                onChange={handleOnboardingChange}
                className="w-full px-3 py-2 border rounded"
                required
              >
                {roles.filter(role => role !== "owner").map((role) => (
                  <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Sending Invite..." : "Send Invite"}
            </button>
          </form>
        </div>
      )}
      
      {/* Action Logs Tab */}
      {activeTab === "actions" && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Action Logs</h2>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Changed By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {actionLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{log.action}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{log.target_type}: {log.target_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{log.changed_by_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;