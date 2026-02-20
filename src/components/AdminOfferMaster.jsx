// ============================================================================
// AdminOfferMaster Component — Fully redesigned with om- prefixed classes
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import AdminSidebar from './Adminsidebar';
import './AdminOfferMaster.scss';
import { API_BASE_URL } from '../services/config';

const ROWS_PER_PAGE = 8;

const AdminOfferMaster = ({ onLogout, userData }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [adminName, setAdminName]         = useState('Admin');
  const [offers, setOffers]               = useState([]);
  const [branches, setBranches]           = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen]     = useState(false);
  const [searchTerm, setSearchTerm]             = useState('');
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '', description: '', validFrom: '', validTo: '', status: 'active', files: []
  });
  const [filePreviews, setFilePreviews] = useState([]);
  const [isEditing, setIsEditing]       = useState(false);
  const [editingId, setEditingId]       = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [tableSearch, setTableSearch]   = useState('');
  const [currentPage, setCurrentPage]   = useState(1);
  const [mediaModal, setMediaModal]     = useState(null);

  // ✅ FIX: Real stats from backend instead of calculating from local array
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    scheduled: 0,
  });

  // ── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (userData?.username) {
      setAdminName(userData.username);
    } else {
      const stored = localStorage.getItem('user');
      if (stored) {
        const p = JSON.parse(stored);
        setAdminName(p.username || p.email || 'Admin');
      }
    }
    fetchOffers();
    fetchBranches();
    fetchStats(); // ✅ FIX: Fetch real stats on mount
  }, [userData]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto-dismiss alerts
  useEffect(() => {
    if (error || successMessage) {
      const t = setTimeout(() => { setError(null); setSuccessMessage(null); }, 5000);
      return () => clearTimeout(t);
    }
  }, [error, successMessage]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const handleToggleSidebar = () => setIsSidebarOpen(p => !p);
  const getAuthToken  = () => localStorage.getItem('access_token');
  const getHeaders    = () => ({
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json'
  });

  // ── API ───────────────────────────────────────────────────────────────────

  // ✅ FIX: Fetch real stats from backend
  // Previously stats were calculated from the local offers array which is wrong
  // when pagination is active — total showed only loaded page count, not real total
  const fetchStats = async () => {
    try {
      const r = await fetch(`${API_BASE_URL}/offer-master/stats/`, { headers: getHeaders() });
      if (!r.ok) throw new Error('Failed to fetch stats');
      const d = await r.json();
      setStats({
        total:     d.total     || 0,
        active:    d.active    || 0,
        inactive:  d.inactive  || 0,
        scheduled: d.scheduled || 0,
      });
    } catch (err) {
      console.error('Stats fetch failed, falling back to local count:', err);
      // Fallback: calculate from local offers array if API fails
      setStats({
        total:     offers.length,
        active:    offers.filter(o => o.status === 'active').length,
        inactive:  offers.filter(o => o.status === 'inactive').length,
        scheduled: offers.filter(o => o.status === 'scheduled').length,
      });
    }
  };

  const fetchBranches = async () => {
    try {
      const r = await fetch(`${API_BASE_URL}/branches/dropdown/`, { headers: getHeaders() });
      if (!r.ok) throw new Error('Failed to fetch branches');
      const d = await r.json();
      if (d.success) setBranches(d.branches);
    } catch (err) {
      console.error(err);
      setError('Failed to load branches');
    }
  };

  const fetchOffers = async () => {
    setLoading(true); setError(null);
    try {
      const r = await fetch(`${API_BASE_URL}/offer-master/`, { headers: getHeaders() });
      if (!r.ok) {
        if (r.status === 401) throw new Error('Session expired. Please login again.');
        throw new Error('Failed to fetch offers');
      }
      setOffers(await r.json());
    } catch (err) {
      setError(err.message || 'Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleBranchToggle = (id) => {
    setSelectedBranches(p =>
      p.includes(id) ? p.filter(x => x !== id) : [...p, id]
    );
  };

  const handleSelectAllBranches = () => {
    if (selectedBranches.length === filteredBranches.length && filteredBranches.length > 0) {
      setSelectedBranches([]);
    } else {
      setSelectedBranches(filteredBranches.map(b => b.id));
    }
  };

  const handleRemoveBranch = (id) => {
    setSelectedBranches(p => p.filter(x => x !== id));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const valid = []; const previews = [];
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) { setError(`${file.name} exceeds 10MB`); continue; }
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['jpg','jpeg','png','gif','webp','pdf'].includes(ext)) { setError(`.${ext} not allowed`); continue; }
      valid.push(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push({ url: reader.result, name: file.name, type: 'image', file });
          setFilePreviews([...previews]);
        };
        reader.readAsDataURL(file);
      } else {
        previews.push({ url: null, name: file.name, type: 'pdf', file });
        setFilePreviews([...previews]);
      }
    }
    setFormData(p => ({ ...p, files: valid }));
  };

  const handleRemoveFile = (i) => {
    setFilePreviews(p => p.filter((_, idx) => idx !== i));
    setFormData(p => ({ ...p, files: p.files.filter((_, idx) => idx !== i) }));
  };

  const handleDeleteMediaFile = async (mediaId, offerId) => {
    if (!window.confirm('Delete this file?')) return;
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE_URL}/offer-master/${offerId}/media/${mediaId}/`, {
        method: 'DELETE', headers: getHeaders()
      });
      if (!r.ok) throw new Error('Failed to delete media file');
      setSuccessMessage('File deleted successfully!');
      if (mediaModal?.offerId === offerId)
        setMediaModal(p => ({ ...p, files: p.files.filter(f => f.id !== mediaId) }));
      await fetchOffers();
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    // ✅ FIX: Validate all required fields before submitting
    // Previously only branch selection was validated — title and dates were not checked
    if (!formData.title.trim()) { setError('Offer title is required'); return; }
    if (!formData.validFrom)    { setError('Valid From date is required'); return; }
    if (!formData.validTo)      { setError('Valid To date is required'); return; }
    if (formData.validTo < formData.validFrom) { setError('Valid To must be after Valid From'); return; }
    if (!selectedBranches.length) { setError('Please select at least one branch'); return; }

    setLoading(true); setError(null); setSuccessMessage(null);
    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('description', formData.description);
      fd.append('valid_from', formData.validFrom);
      fd.append('valid_to', formData.validTo);
      fd.append('status', formData.status);
      selectedBranches.forEach(id => fd.append('branch_ids', id));
      formData.files.forEach(f => fd.append('files', f));

      const url    = isEditing ? `${API_BASE_URL}/offer-master/${editingId}/` : `${API_BASE_URL}/offer-master/`;
      const method = isEditing ? 'PATCH' : 'POST';
      const r = await fetch(url, { method, headers: { 'Authorization': `Bearer ${getAuthToken()}` }, body: fd });

      if (!r.ok) {
        // ✅ FIX: Better error extraction — show actual backend message not just generic error
        const d = await r.json();
        const msg = d.error || d.detail || Object.values(d)?.[0]?.[0] || 'Failed to save offer';
        throw new Error(msg);
      }

      setSuccessMessage(isEditing ? 'Offer updated!' : 'Offer created!');
      setFormData({ title:'', description:'', validFrom:'', validTo:'', status:'active', files:[] });
      setFilePreviews([]); setSelectedBranches([]);
      setIsEditing(false); setEditingId(null);
      await fetchOffers();
      fetchStats(); // ✅ FIX: Refresh stats after create/update
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleEdit = (offer) => {
    setFormData({
      title: offer.title, description: offer.description || '',
      validFrom: offer.valid_from, validTo: offer.valid_to,
      status: offer.status, files: []
    });
    setFilePreviews([]);
    setSelectedBranches(offer.branches?.map(b => b.id) || []);
    setIsEditing(true); setEditingId(offer.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setFormData({ title:'', description:'', validFrom:'', validTo:'', status:'active', files:[] });
    setFilePreviews([]); setSelectedBranches([]);
    setIsEditing(false); setEditingId(null); setError(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this offer and all its files?')) return;
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE_URL}/offer-master/${id}/`, { method:'DELETE', headers: getHeaders() });
      if (!r.ok) throw new Error('Failed to delete offer');
      setSuccessMessage('Offer deleted!');
      await fetchOffers();
      fetchStats(); // ✅ FIX: Refresh stats after delete
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const filteredBranches = branches.filter(b =>
    b.branch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.branch_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.shop_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOffers = offers.filter(o => {
    const q = tableSearch.toLowerCase();
    if (!q) return true;
    return (
      o.title?.toLowerCase().includes(q) ||
      o.status?.toLowerCase().includes(q) ||
      o.description?.toLowerCase().includes(q) ||
      o.branches?.some(b => b.branch_name?.toLowerCase().includes(q) || b.branch_code?.toLowerCase().includes(q))
    );
  });

  const totalPages      = Math.max(1, Math.ceil(filteredOffers.length / ROWS_PER_PAGE));
  const paginatedOffers = filteredOffers.slice((currentPage-1)*ROWS_PER_PAGE, currentPage*ROWS_PER_PAGE);

  const handleTableSearch = (e) => { setTableSearch(e.target.value); setCurrentPage(1); };

  const formatDate = (ds) => {
    if (!ds) return 'N/A';
    return new Date(ds).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="om-container">
      <AdminSidebar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={handleToggleSidebar}
        onLogout={onLogout}
        adminName={adminName}
      />

      <main className={`om-main ${isSidebarOpen ? 'om-sidebar-open' : 'om-sidebar-closed'}`}>
        <div className="om-wrapper">

          {/* ── Page Header ── */}
          <div className="om-page-header">
            <div>
              <h1 className="om-page-title">Offer Master</h1>
              <p className="om-page-sub">Create and manage offers for all branches</p>
            </div>
          </div>

          {/* ── Stats ── */}
          {/* ✅ FIX: Stats now come from backend API state, not calculated from local array */}
          <div className="om-stats-grid">
            <div className="om-stat-card">
              <div className="om-stat-icon om-icon-blue">🎁</div>
              <div><div className="om-stat-num">{stats.total}</div><div className="om-stat-lbl">Total Offers</div></div>
            </div>
            <div className="om-stat-card">
              <div className="om-stat-icon om-icon-green">✅</div>
              <div><div className="om-stat-num">{stats.active}</div><div className="om-stat-lbl">Active</div></div>
            </div>
            <div className="om-stat-card">
              <div className="om-stat-icon om-icon-yellow">🕐</div>
              <div><div className="om-stat-num">{stats.scheduled}</div><div className="om-stat-lbl">Scheduled</div></div>
            </div>
            <div className="om-stat-card">
              <div className="om-stat-icon om-icon-red">⛔</div>
              <div><div className="om-stat-num">{stats.inactive}</div><div className="om-stat-lbl">Inactive</div></div>
            </div>
          </div>

          {/* ── Alerts ── */}
          {error && (
            <div className="om-alert om-alert-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {error}
            </div>
          )}
          {successMessage && (
            <div className="om-alert om-alert-success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              {successMessage}
            </div>
          )}

          {/* ── Form Card ── */}
          <div className="om-form-card">
            <div className="om-card-header">
              <div className="om-card-header-left">
                <div className="om-card-header-icon">{isEditing ? '✏️' : '➕'}</div>
                <div>
                  <h2 className="om-card-title">{isEditing ? 'Edit Offer' : 'Create New Offer'}</h2>
                  <p className="om-card-sub">{isEditing ? 'Update offer details below' : 'Fill in details to publish a new offer'}</p>
                </div>
              </div>
              {isEditing && (
                <button className="om-cancel-header-btn" onClick={handleCancel} disabled={loading}>
                  ✕ Cancel Edit
                </button>
              )}
            </div>

            <div className="om-form-body">

              {/* Row 1: Title + Status */}
              <div className="om-grid-2">
                <div className="om-field">
                  <label className="om-label">Offer Title <span className="om-req">*</span></label>
                  <input
                    className="om-input"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Summer Sale 2024"
                    disabled={loading}
                  />
                </div>
                <div className="om-field">
                  <label className="om-label">Status <span className="om-req">*</span></label>
                  <select className="om-input" name="status" value={formData.status} onChange={handleInputChange} disabled={loading}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Valid From + Valid To */}
              <div className="om-grid-2">
                <div className="om-field">
                  <label className="om-label">Valid From <span className="om-req">*</span></label>
                  <input className="om-input" type="date" name="validFrom" value={formData.validFrom} onChange={handleInputChange} disabled={loading} />
                </div>
                <div className="om-field">
                  <label className="om-label">Valid To <span className="om-req">*</span></label>
                  <input className="om-input" type="date" name="validTo" value={formData.validTo} onChange={handleInputChange} disabled={loading} />
                </div>
              </div>

              {/* Description */}
              <div className="om-field">
                <label className="om-label">Description</label>
                <textarea
                  className="om-textarea"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter offer details..."
                  rows="3"
                  disabled={loading}
                />
              </div>

              {/* ── Branch Multi-Select Dropdown ── */}
              <div className="om-field">
                <label className="om-label">
                  Assign to Branches <span className="om-req">*</span>
                  {selectedBranches.length > 0 && (
                    <span className="om-selected-badge">{selectedBranches.length} selected</span>
                  )}
                </label>

                {/* Selected chips row */}
                {selectedBranches.length > 0 && (
                  <div className="om-chips-row">
                    {branches.filter(b => selectedBranches.includes(b.id)).map(b => (
                      <span key={b.id} className="om-chip">
                        {b.branch_name}
                        <button type="button" className="om-chip-remove" onClick={() => handleRemoveBranch(b.id)}>✕</button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Dropdown trigger */}
                <div className="om-dropdown-wrap" ref={dropdownRef}>
                  <div
                    className={`om-dropdown-trigger ${isDropdownOpen ? 'om-dd-open' : ''}`}
                    onClick={() => setIsDropdownOpen(p => !p)}
                  >
                    <span className={selectedBranches.length === 0 ? 'om-dd-placeholder' : 'om-dd-label'}>
                      {selectedBranches.length === 0 ? 'Click to select branches...' : `${selectedBranches.length} branch${selectedBranches.length > 1 ? 'es' : ''} selected`}
                    </span>
                    <svg className={`om-dd-arrow ${isDropdownOpen ? 'om-dd-arrow-up' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>

                  {isDropdownOpen && (
                    <div className="om-dropdown-menu">
                      {/* Search + Select All */}
                      <div className="om-dd-search-row">
                        <div className="om-dd-search-box">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                          </svg>
                          <input
                            type="text"
                            className="om-dd-search-input"
                            placeholder="Search branches..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            onClick={e => e.stopPropagation()}
                          />
                        </div>
                        <button
                          type="button"
                          className="om-dd-select-all"
                          onClick={e => { e.stopPropagation(); handleSelectAllBranches(); }}
                        >
                          {selectedBranches.length === filteredBranches.length && filteredBranches.length > 0 ? 'Clear all' : 'Select all'}
                        </button>
                      </div>

                      {/* List */}
                      <div className="om-dd-list">
                        {filteredBranches.length === 0 ? (
                          <div className="om-dd-empty">No branches found</div>
                        ) : filteredBranches.map(branch => {
                          const isSelected = selectedBranches.includes(branch.id);
                          return (
                            <div
                              key={branch.id}
                              className={`om-dd-item ${isSelected ? 'om-dd-item-selected' : ''}`}
                              onClick={e => { e.stopPropagation(); handleBranchToggle(branch.id); }}
                            >
                              <span className={`om-dd-checkbox ${isSelected ? 'om-dd-checkbox-checked' : ''}`}>
                                {isSelected && (
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <polyline points="20 6 9 17 4 12"/>
                                  </svg>
                                )}
                              </span>
                              <span className="om-dd-item-name">{branch.branch_name}</span>
                              <span className="om-dd-item-meta">{branch.branch_code} · {branch.shop_name}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Footer count */}
                      {selectedBranches.length > 0 && (
                        <div className="om-dd-footer">
                          {selectedBranches.length} {selectedBranches.length === 1 ? 'branch' : 'branches'} selected
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {selectedBranches.length === 0 && (
                  <small className="om-field-error">Please select at least one branch</small>
                )}
              </div>

              {/* ── File Upload ── */}
              <div className="om-field">
                <label className="om-label">Upload Files <span className="om-hint">(Images / PDFs, max 10MB each)</span></label>
                <label className={`om-file-btn ${loading ? 'om-file-btn-disabled' : ''}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  {formData.files.length > 0 ? `${formData.files.length} file${formData.files.length > 1 ? 's' : ''} selected` : 'Choose files'}
                  <input type="file" accept="image/*,.pdf" onChange={handleFileChange} disabled={loading} multiple style={{ display:'none' }}/>
                </label>
              </div>

              {/* File Previews */}
              {filePreviews.length > 0 && (
                <div className="om-previews">
                  {filePreviews.map((p, i) => (
                    <div key={i} className="om-preview-card">
                      <button type="button" className="om-preview-remove" onClick={() => handleRemoveFile(i)}>✕</button>
                      {p.type === 'image' && p.url
                        ? <img src={p.url} alt={p.name}/>
                        : <div className="om-pdf-thumb">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                            </svg>
                            <span>{p.name}</span>
                          </div>
                      }
                    </div>
                  ))}
                </div>
              )}

              {/* ── Form Actions ── */}
              <div className="om-form-actions">
                {isEditing && (
                  <button type="button" className="om-btn-cancel" onClick={handleCancel} disabled={loading}>
                    Cancel
                  </button>
                )}
                <button type="button" className="om-btn-submit" onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Saving...' : isEditing ? '✓ Update Offer' : '✓ Create Offer'}
                </button>
              </div>

            </div>
          </div>
          {/* ── End Form Card ── */}

          {/* ── Table Section ── */}
          <div className="om-table-section">
            <div className="om-table-toolbar">
              <div className="om-toolbar-left">
                <h2 className="om-table-title">
                  All Offers
                  <span className="om-count-badge">{filteredOffers.length}</span>
                </h2>
              </div>
              <div className="om-toolbar-right">
                <div className="om-search-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search offers..."
                    value={tableSearch}
                    onChange={handleTableSearch}
                  />
                </div>
              </div>
            </div>

            {loading && offers.length === 0 ? (
              <div className="om-empty-state">
                <div className="om-spinner"></div>
                <p>Loading offers...</p>
              </div>
            ) : filteredOffers.length === 0 ? (
              <div className="om-empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p>{tableSearch ? 'No offers match your search.' : 'No offers created yet.'}</p>
              </div>
            ) : (
              <>
                <div className="om-table-scroll">
                  <table className="om-table">
                    <thead>
                      <tr>
                        <th>#</th><th>Offer</th><th>Description</th><th>Validity</th>
                        <th>Branches</th><th>Files</th><th>Status</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedOffers.map((offer, idx) => (
                        <tr key={offer.id}>
                          <td className="om-td-num">{(currentPage-1)*ROWS_PER_PAGE + idx + 1}</td>

                          <td>
                            <div className="om-offer-cell">
                              {offer.media_files?.length > 0 && offer.media_files[0].media_type === 'image'
                                ? <img className="om-thumb" src={offer.media_files[0].file_url} alt={offer.title}/>
                                : <div className="om-thumb-placeholder">🎁</div>
                              }
                              <span className="om-offer-name">{offer.title}</span>
                            </div>
                          </td>

                          <td>
                            <span className="om-desc">
                              {offer.description
                                ? offer.description.length > 60 ? offer.description.slice(0, 60) + '…' : offer.description
                                : <span className="om-muted">—</span>}
                            </span>
                          </td>

                          <td>
                            <div className="om-validity">
                              <span className="om-date-from">{formatDate(offer.valid_from)}</span>
                              <span className="om-date-sep">→</span>
                              <span className="om-date-to">{formatDate(offer.valid_to)}</span>
                            </div>
                          </td>

                          <td>
                            <div className="om-branches-cell">
                              {offer.branches?.length > 0 ? (
                                <>
                                  {offer.branches.slice(0, 2).map(b => (
                                    <span key={b.id} className="om-branch-pill">🏪 {b.branch_name}</span>
                                  ))}
                                  {offer.branches.length > 2 && (
                                    <span className="om-branch-pill om-pill-more">+{offer.branches.length - 2}</span>
                                  )}
                                </>
                              ) : <span className="om-muted">—</span>}
                            </div>
                          </td>

                          <td>
                            {offer.media_count > 0 ? (
                              <button
                                className="om-files-badge"
                                onClick={() => setMediaModal({ offerId: offer.id, offerTitle: offer.title, files: offer.media_files || [] })}
                              >
                                📎 {offer.media_count} {offer.media_count === 1 ? 'file' : 'files'}
                              </button>
                            ) : <span className="om-muted">—</span>}
                          </td>

                          <td>
                            <span className={`om-status-pill om-status-${offer.status}`}>{offer.status}</span>
                          </td>

                          <td>
                            <div className="om-row-actions">
                              <button className="om-btn-edit" onClick={() => handleEdit(offer)} disabled={loading} title="Edit">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                              </button>
                              <button className="om-btn-delete" onClick={() => handleDelete(offer.id)} disabled={loading} title="Delete">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6"/>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="om-pagination">
                    <span className="om-page-info">
                      Showing {(currentPage-1)*ROWS_PER_PAGE+1}–{Math.min(currentPage*ROWS_PER_PAGE, filteredOffers.length)} of {filteredOffers.length}
                    </span>
                    <div className="om-page-btns">
                      <button className="om-page-btn" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage===1}>‹</button>
                      {Array.from({ length: totalPages }, (_, i) => i+1).map(n => (
                        <button key={n} className={`om-page-btn ${n === currentPage ? 'om-page-btn-active' : ''}`} onClick={() => setCurrentPage(n)}>{n}</button>
                      ))}
                      <button className="om-page-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage===totalPages}>›</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          {/* ── End Table ── */}

        </div>
      </main>

      {/* ── Media Modal ── */}
      {mediaModal && (
        <div className="om-modal-overlay" onClick={() => setMediaModal(null)}>
          <div className="om-modal" onClick={e => e.stopPropagation()}>
            <div className="om-modal-header">
              <div>
                <h3>Media Files</h3>
                <p>{mediaModal.offerTitle}</p>
              </div>
              <button className="om-modal-close" onClick={() => setMediaModal(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="om-modal-body">
              {mediaModal.files.length === 0 ? (
                <div className="om-modal-empty">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <p>No files remaining</p>
                </div>
              ) : (
                <div className="om-modal-grid">
                  {mediaModal.files.map(media => (
                    <div key={media.id} className="om-modal-item">
                      {media.media_type === 'image'
                        ? <img src={media.file_url} alt={media.caption || 'Offer image'}/>
                        : <div className="om-modal-pdf">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                            </svg>
                            <a href={media.file_url} target="_blank" rel="noopener noreferrer">View PDF</a>
                          </div>
                      }
                      <button
                        className="om-modal-del-btn"
                        onClick={() => handleDeleteMediaFile(media.id, mediaModal.offerId)}
                        disabled={loading}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="om-modal-footer">
              <span>{mediaModal.files.length} {mediaModal.files.length === 1 ? 'file' : 'files'} total</span>
              <button className="om-modal-close-btn" onClick={() => setMediaModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOfferMaster;