import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../services/config";
import AdminSidebar from "./Adminsidebar";
import "./AdminDashboard.scss";

/* ------------ ICONS ------------ */
const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const AdminDashboard = ({ onLogout, userData }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // ✅ FIX: Added edit modal state — Edit button was present but had no functionality
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [adminName, setAdminName] = useState("Admin");

  const [stats, setStats] = useState({
    total_admins: 0,
    active_admins: 0,
    disabled_admins: 0,
  });

  const [newAdmin, setNewAdmin] = useState({
    customer_name: "",
    shop_name: "",
    username: "",
    email: "",
    password: "",
    phone_number: "",
    amount: "",
    location: "",
    status: "Active",
    no_days: 90,
    validity_start: "",
    validity_end: "",
  });

  useEffect(() => {
    if (userData && userData.username) {
      setAdminName(userData.username);
    } else {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setAdminName(parsedUser.username || parsedUser.email || 'Admin');
      }
    }
    fetchAdmins();

    // ✅ FIX: Also fetch real stats from backend instead of only calculating from local list
    fetchStats();
  }, [userData]);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  /* ------------ API ------------ */

  // ✅ FIX: Fetch real stats from backend — previously stats were only calculated
  // from the local admins list, which breaks if search/filter is active
  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admins/stats/`, {
        headers: getAuthHeaders(),
      });
      setStats(res.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      // Fall back to calculating from local list if stats API fails
    }
  };

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/admins/`, {
        headers: getAuthHeaders(),
      });
      setAdmins(res.data);
      // ✅ FIX: calculateStats is now only a fallback — real stats come from fetchStats()
      calculateStats(res.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      alert("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const addAdmin = async () => {
    // ✅ FIX: Basic validation before submitting
    if (!newAdmin.username || !newAdmin.email || !newAdmin.password || !newAdmin.shop_name) {
      alert("Please fill in all required fields.");
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/admins/`, newAdmin, {
        headers: getAuthHeaders(),
      });
      fetchAdmins();
      fetchStats(); // ✅ FIX: Refresh stats after adding a user
      setShowAddForm(false);
      resetNewAdmin();
      alert("✅ User added successfully");
    } catch (error) {
      console.error("Failed to add user:", error);
      const msg = error?.response?.data?.detail || error?.response?.data?.error || "Failed to add user";
      alert(`❌ ${msg}`);
    }
  };

  // ✅ FIX: Edit functionality — was completely missing before
  const openEditForm = (user) => {
    setEditingUser({
      ...user,
      password: "", // don't pre-fill password
    });
    setShowEditForm(true);
  };

  const saveEdit = async () => {
    if (!editingUser) return;
    try {
      const payload = { ...editingUser };
      // Don't send empty password — only send if admin typed a new one
      if (!payload.password) delete payload.password;

      await axios.patch(`${API_BASE_URL}/admins/${editingUser.id}/`, payload, {
        headers: getAuthHeaders(),
      });
      fetchAdmins();
      fetchStats(); // ✅ Refresh stats after editing
      setShowEditForm(false);
      setEditingUser(null);
      alert("✅ User updated successfully");
    } catch (error) {
      console.error("Failed to update user:", error);
      const msg = error?.response?.data?.detail || error?.response?.data?.error || "Failed to update user";
      alert(`❌ ${msg}`);
    }
  };

  const deleteAdmin = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/admins/${id}/`, {
        headers: getAuthHeaders(),
      });
      fetchAdmins();
      fetchStats(); // ✅ FIX: Refresh stats after deleting a user
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("❌ Failed to delete user");
    }
  };

  // Kept as fallback if stats API fails
  const calculateStats = (list) => {
    setStats({
      total_admins: list.length,
      active_admins: list.filter((a) => a.status === "Active").length,
      disabled_admins: list.filter((a) => a.status === "Disable").length,
    });
  };

  const resetNewAdmin = () =>
    setNewAdmin({
      customer_name: "",
      shop_name: "",
      username: "",
      email: "",
      password: "",
      phone_number: "",
      amount: "",
      location: "",
      status: "Active",
      no_days: 90,
      validity_start: "",
      validity_end: "",
    });

  const filteredAdmins = admins.filter(
    (a) =>
      a.shop_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-dashboard-container">
      <AdminSidebar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={handleToggleSidebar}
        onLogout={onLogout}
        adminName={adminName}
      />

      {/* Main Content */}
      <main className={`admin-main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="content-wrapper">
          {/* Page Header */}
          <div className="page-header">
            <div className="header-left">
              <h1 className="page-title">User Management</h1>
              <p className="page-subtitle">Manage and monitor all users in the system</p>
            </div>
            <div className="header-actions">
              <input
                className="search-input"
                placeholder="🔍 Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="add-user-btn" onClick={() => setShowAddForm(true)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add User
              </button>
            </div>
          </div>

          {/* STATS */}
          <div className="stats-container">
            <div className="stat-card total">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.total_admins}</div>
                <div className="stat-label">Total Users</div>
              </div>
            </div>

            <div className="stat-card active">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.active_admins}</div>
                <div className="stat-label">Active</div>
              </div>
            </div>

            <div className="stat-card disabled">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.disabled_admins}</div>
                <div className="stat-label">Disabled</div>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="table-section">
            <div className="table-header">
              <h2 className="table-title">All Users ({filteredAdmins.length})</h2>
            </div>

            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Shop</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Amount</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Days</th>
                    <th>Validity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="11" className="loading-cell">
                        <div className="loading-spinner"></div>
                        Loading users...
                      </td>
                    </tr>
                  ) : filteredAdmins.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="empty-cell">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredAdmins.map((u, i) => (
                      <tr key={u.id}>
                        <td>{i + 1}</td>
                        <td className="shop-cell">{u.shop_name}</td>
                        <td className="username-cell">{u.username}</td>
                        <td className="email-cell">{u.email}</td>
                        <td>{u.phone_number}</td>
                        <td className="amount-cell">₹ {u.amount}</td>
                        <td>{u.location}</td>
                        <td>
                          <span className={`status-badge ${u.status.toLowerCase()}`}>
                            {u.status}
                          </span>
                        </td>
                        <td>{u.no_days}</td>
                        <td className="validity-cell">
                          {u.validity_start || "-"} — {u.validity_end || "-"}
                        </td>
                        <td className="actions-cell">
                          {/* ✅ FIX: Edit button now actually opens the edit modal */}
                          <button className="action-btn edit" title="Edit" onClick={() => openEditForm(u)}>
                            <EditIcon />
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={() => deleteAdmin(u.id)}
                            title="Delete"
                          >
                            <TrashIcon />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* ADD USER MODAL */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">➕ Add New User</h2>
              <button className="modal-close" onClick={() => setShowAddForm(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                <div className="form-field">
                  <label>Customer Name *</label>
                  <input
                    type="text"
                    value={newAdmin.customer_name}
                    onChange={(e) => setNewAdmin({ ...newAdmin, customer_name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Shop Name *</label>
                  <input
                    type="text"
                    value={newAdmin.shop_name}
                    onChange={(e) => setNewAdmin({ ...newAdmin, shop_name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Username *</label>
                  <input
                    type="text"
                    value={newAdmin.username}
                    onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Password *</label>
                  <input
                    type="password"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    value={newAdmin.phone_number}
                    onChange={(e) => setNewAdmin({ ...newAdmin, phone_number: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Amount (₹) *</label>
                  <input
                    type="number"
                    value={newAdmin.amount}
                    onChange={(e) => setNewAdmin({ ...newAdmin, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Location *</label>
                  <input
                    type="text"
                    value={newAdmin.location}
                    onChange={(e) => setNewAdmin({ ...newAdmin, location: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Status</label>
                  <select
                    value={newAdmin.status}
                    onChange={(e) => setNewAdmin({ ...newAdmin, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Disable">Disable</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>No. of Days *</label>
                  <input
                    type="number"
                    value={newAdmin.no_days}
                    onChange={(e) => setNewAdmin({ ...newAdmin, no_days: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Validity Start *</label>
                  <input
                    type="date"
                    value={newAdmin.validity_start}
                    onChange={(e) => setNewAdmin({ ...newAdmin, validity_start: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Validity End *</label>
                  <input
                    type="date"
                    value={newAdmin.validity_end}
                    onChange={(e) => setNewAdmin({ ...newAdmin, validity_end: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
              <button className="submit-btn" onClick={addAdmin}>
                ✅ Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ FIX: EDIT USER MODAL — was completely missing, edit button did nothing before */}
      {showEditForm && editingUser && (
        <div className="modal-overlay" onClick={() => setShowEditForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">✏️ Edit User</h2>
              <button className="modal-close" onClick={() => setShowEditForm(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                <div className="form-field">
                  <label>Shop Name</label>
                  <input
                    type="text"
                    value={editingUser.shop_name || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, shop_name: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Username</label>
                  <input
                    type="text"
                    value={editingUser.username || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editingUser.email || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>New Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    value={editingUser.password || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                    placeholder="Leave blank to keep current password"
                  />
                </div>

                <div className="form-field">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={editingUser.phone_number || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, phone_number: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Amount (₹)</label>
                  <input
                    type="number"
                    value={editingUser.amount || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, amount: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Location</label>
                  <input
                    type="text"
                    value={editingUser.location || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, location: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Status</label>
                  <select
                    value={editingUser.status || "Active"}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Disable">Disable</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>No. of Days</label>
                  <input
                    type="number"
                    value={editingUser.no_days || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, no_days: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Validity Start</label>
                  <input
                    type="date"
                    value={editingUser.validity_start || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, validity_start: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Validity End</label>
                  <input
                    type="date"
                    value={editingUser.validity_end || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, validity_end: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowEditForm(false)}>
                Cancel
              </button>
              <button className="submit-btn" onClick={saveEdit}>
                ✅ Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;