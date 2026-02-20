import React, { useState, useEffect } from 'react';
import AdminSidebar from './Adminsidebar';
import './AdminBranchMaster.scss';
import { API_BASE_URL } from '../services/config';

const ROWS_PER_PAGE = 8;

const AdminBranchMaster = ({ onLogout, userData }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [adminName, setAdminName] = useState('Admin');
  const [branches, setBranches] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // List of all users for dropdown
  const [formData, setFormData] = useState({
    user: '', // Which user/shop this branch belongs to
    branch_name: '',
    branch_code: '',
    location: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    contact_number: '',
    email: '',
    manager_name: '',
    manager_phone: '',
    status: 'active'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Table state
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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

    fetchBranches();
    fetchAllUsers(); // Fetch users for dropdown
  }, [userData]);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const getAuthToken = () => {
    return localStorage.getItem('access_token');
  };

  const getHeaders = () => {
    return {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json'
    };
  };

  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  // Fetch all users for dropdown
  const fetchAllUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/dropdown/`, {
        headers: getHeaders()
      });

      if (!response.ok) {
        console.error('Failed to fetch users for dropdown');
        return;
      }

      const data = await response.json();
      setAllUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchBranches = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/branch-master/`, {
        headers: getHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        throw new Error('Failed to fetch branches');
      }

      const data = await response.json();
      setBranches(data);
    } catch (err) {
      console.error('Error fetching branches:', err);
      setError(err.message || 'Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('user', formData.user);
      formDataToSend.append('branch_name', formData.branch_name);
      formDataToSend.append('branch_code', formData.branch_code);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('state', formData.state);
      formDataToSend.append('pincode', formData.pincode);
      formDataToSend.append('country', formData.country);
      formDataToSend.append('contact_number', formData.contact_number);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('manager_name', formData.manager_name);
      formDataToSend.append('manager_phone', formData.manager_phone);
      formDataToSend.append('status', formData.status);


      const url = isEditing
        ? `${API_BASE_URL}/branch-master/${editingId}/`
        : `${API_BASE_URL}/branch-master/`;

      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save branch');
      }

      setSuccessMessage(isEditing ? 'Branch updated successfully!' : 'Branch created successfully!');

      resetForm();
      await fetchBranches();
    } catch (err) {
      console.error('Error saving branch:', err);
      setError(err.message || 'Failed to save branch');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (branch) => {
    setFormData({
      user: branch.user, // User ID
      branch_name: branch.branch_name,
      branch_code: branch.branch_code,
      location: branch.location || '',
      address: branch.address || '',
      city: branch.city || '',
      state: branch.state || '',
      pincode: branch.pincode || '',
      country: branch.country || 'India',
      contact_number: branch.contact_number || '',
      email: branch.email || '',
      manager_name: branch.manager_name || '',
      manager_phone: branch.manager_phone || '',
      status: branch.status
    });


    setIsEditing(true);
    setEditingId(branch.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      user: '',
      branch_name: '',
      branch_code: '',
      location: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      contact_number: '',
      email: '',
      manager_name: '',
      manager_phone: '',
      status: 'active'
    });
    setImagePreview(null);
    setIsEditing(false);
    setEditingId(null);
    setError(null);
  };

  const handleDelete = async (branchId) => {
    if (!window.confirm('Are you sure you want to delete this branch?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/branch-master/${branchId}/`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to delete branch');
      }

      setSuccessMessage('Branch deleted successfully!');
      await fetchBranches();
    } catch (err) {
      console.error('Error deleting branch:', err);
      setError(err.message || 'Failed to delete branch');
    } finally {
      setLoading(false);
    }
  };

  // ── Derived table data ──
  const filteredBranches = branches.filter(b => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      b.branch_name?.toLowerCase().includes(q) ||
      b.branch_code?.toLowerCase().includes(q) ||
      b.city?.toLowerCase().includes(q) ||
      b.location?.toLowerCase().includes(q) ||
      b.state?.toLowerCase().includes(q) ||
      b.user_info?.shop_name?.toLowerCase().includes(q) ||
      b.manager_name?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredBranches.length / ROWS_PER_PAGE));
  const paginatedBranches = filteredBranches.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const stats = {
    total:    branches.length,
    active:   branches.filter(b => b.status === 'active').length,
    inactive: branches.filter(b => b.status === 'inactive').length,
  };

  return (
    <div className="admin-branch-master-container">
      <AdminSidebar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={handleToggleSidebar}
        onLogout={onLogout}
        adminName={adminName}
      />

      <main className={`branch-main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="content-wrapper">

          {/* Page Header */}
          <div className="page-header">
            <div className="header-left">
              <h1 className="page-title">Branch Master</h1>
              <p className="page-subtitle">Manage all branch locations</p>
            </div>
          </div>

          {/* Stats Strip */}
          <div className="stats-strip">
            <div className="stat-card">
              <div className="stat-icon blue">🏢</div>
              <div>
                <div className="stat-num">{stats.total}</div>
                <div className="stat-lbl">Total Branches</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">✅</div>
              <div>
                <div className="stat-num">{stats.active}</div>
                <div className="stat-lbl">Active</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon red">⛔</div>
              <div>
                <div className="stat-num">{stats.inactive}</div>
                <div className="stat-lbl">Inactive</div>
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="alert alert-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {error}
            </div>
          )}

          {successMessage && (
            <div className="alert alert-success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              {successMessage}
            </div>
          )}

          {/* Form Card */}
          <div className="form-card">
            <div className="card-header">
              <h2>{isEditing ? '✏️ Edit Branch' : '➕ Add New Branch'}</h2>
            </div>

            <form onSubmit={handleSubmit} className="branch-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Assign to User/Shop *</label>
                  <select
                    name="user"
                    value={formData.user}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Select User/Shop</option>
                    {allUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.shop_name || user.username} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Branch Name *</label>
                  <input
                    type="text"
                    name="branch_name"
                    value={formData.branch_name}
                    onChange={handleInputChange}
                    placeholder="e.g., Main Branch"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Branch Code *</label>
                  <input
                    type="text"
                    name="branch_code"
                    value={formData.branch_code}
                    onChange={handleInputChange}
                    placeholder="e.g., BR001"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Downtown"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    disabled={loading}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Street address"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="Pincode"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="Country"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Contact Number</label>
                  <input
                    type="tel"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleInputChange}
                    placeholder="+91 1234567890"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="branch@example.com"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Manager Name</label>
                  <input
                    type="text"
                    name="manager_name"
                    value={formData.manager_name}
                    onChange={handleInputChange}
                    placeholder="Manager name"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Manager Phone</label>
                  <input
                    type="tel"
                    name="manager_phone"
                    value={formData.manager_phone}
                    onChange={handleInputChange}
                    placeholder="+91 9876543210"
                    disabled={loading}
                  />
                </div>
              </div>


              <div className="form-actions">
                {isEditing && (
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (isEditing ? 'Update Branch' : 'Create Branch')}
                </button>
              </div>
            </form>
          </div>

          {/* ── Jira-style Table Section ── */}
          <div className="branches-table-section">

            {/* Toolbar */}
            <div className="table-toolbar">
              <div className="table-toolbar-left">
                <h2>
                  All Branches
                  <span className="branch-count-badge">{filteredBranches.length}</span>
                </h2>
              </div>
              <div className="table-toolbar-right">
                <div className="search-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search branches…"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
            </div>

            {/* Loading */}
            {loading && branches.length === 0 ? (
              <div className="table-empty-state">
                <div className="loading-spinner"></div>
                <p>Loading branches…</p>
              </div>

            ) : filteredBranches.length === 0 ? (
              <div className="table-empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <p>{searchQuery ? 'No branches match your search.' : 'No branches created yet.'}</p>
              </div>

            ) : (
              <>
                <div className="table-scroll-wrap">
                  <table className="branches-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Branch</th>
                        <th>Shop Owner</th>
                        <th>Location</th>
                        <th>Address</th>
                        <th>Contact</th>
                        <th>Manager</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedBranches.map((branch, idx) => (
                        <tr key={branch.id}>
                          {/* # */}
                          <td className="row-num">
                            {(currentPage - 1) * ROWS_PER_PAGE + idx + 1}
                          </td>

                          {/* Branch */}
                          <td>
                            <div className="branch-cell">
                              {branch.branch_image_url ? (
                                <img
                                  className="branch-thumb"
                                  src={branch.branch_image_url}
                                  alt={branch.branch_name}
                                />
                              ) : (
                                <div className="branch-thumb-placeholder">🏢</div>
                              )}
                              <div>
                                <div className="branch-cell-name">{branch.branch_name}</div>
                                <span className="branch-cell-code">{branch.branch_code}</span>
                              </div>
                            </div>
                          </td>

                          {/* Shop Owner */}
                          <td>
                            {branch.user_info && (
                              <span className="shop-owner-pill">
                                🏪 {branch.user_info.shop_name || branch.user_info.username}
                              </span>
                            )}
                          </td>

                          {/* Location */}
                          <td>
                            <div className="location-cell">
                              <span className="location-city">
                                {[branch.city, branch.state].filter(Boolean).join(', ') || branch.location || '—'}
                              </span>
                              <span className="location-area">{branch.location}</span>
                            </div>
                          </td>

                          {/* Address */}
                          <td>
                            <div className="contact-cell">
                              {branch.address
                                ? <span>{branch.address}</span>
                                : <span style={{ color: '#97a0af' }}>—</span>
                              }
                              {branch.pincode && (
                                <span className="contact-email">{branch.pincode}</span>
                              )}
                            </div>
                          </td>

                          {/* Contact */}
                          <td>
                            <div className="contact-cell">
                              {branch.contact_number
                                ? <span>{branch.contact_number}</span>
                                : <span style={{ color: '#97a0af' }}>—</span>
                              }
                              {branch.email && (
                                <span className="contact-email">{branch.email}</span>
                              )}
                            </div>
                          </td>

                          {/* Manager */}
                          <td>
                            <div className="contact-cell">
                              {branch.manager_name
                                ? <span className="manager-name">{branch.manager_name}</span>
                                : <span style={{ color: '#97a0af' }}>—</span>
                              }
                              {branch.manager_phone && (
                                <span>{branch.manager_phone}</span>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td>
                            <span className={`status-pill ${branch.status}`}>
                              {branch.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td>
                            <div className="table-actions">
                              <button
                                className="tbl-btn-edit"
                                onClick={() => handleEdit(branch)}
                                disabled={loading}
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                              <button
                                className="tbl-btn-delete"
                                onClick={() => handleDelete(branch.id)}
                                disabled={loading}
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="table-pagination">
                    <span className="pagination-info">
                      Showing {(currentPage - 1) * ROWS_PER_PAGE + 1}–{Math.min(currentPage * ROWS_PER_PAGE, filteredBranches.length)} of {filteredBranches.length}
                    </span>
                    <div className="pagination-btns">
                      <button
                        className="pag-btn"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >‹</button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                        <button
                          key={n}
                          className={`pag-btn ${n === currentPage ? 'active' : ''}`}
                          onClick={() => setCurrentPage(n)}
                        >
                          {n}
                        </button>
                      ))}
                      <button
                        className="pag-btn"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >›</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          {/* ── End Table Section ── */}

        </div>
      </main>
    </div>
  );
};

export default AdminBranchMaster;