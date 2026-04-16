// ============================================================================
// AdminCommonNotifications Component
// Layout: form + live phone preview only (no table/list)
// Mobile-optimized
// ============================================================================

import React, { useState, useEffect } from 'react';
import AdminSidebar from './Adminsidebar';
import './AdminCommonNotifications.scss';
import API from '../services/api';

const EMOJI_PRESETS = [
  { label: 'Vishu 🌸',        title: 'Happy Vishu 🌸',       body: 'Wishing you a prosperous and joyful Vishu! May this new year bring happiness and abundance to you and your family. 🌼' },
  { label: 'Onam 🌺',         title: 'Happy Onam 🌺',        body: 'Warmest Onam wishes to you and your family! May the spirit of Onam fill your home with joy and prosperity. 🌺' },
  { label: 'Diwali 🪔',       title: 'Happy Diwali 🪔',      body: 'Wishing you a bright and beautiful Diwali! May this festival of lights bring happiness, peace, and prosperity to your home. ✨' },
  { label: 'Christmas 🎄',    title: 'Merry Christmas 🎄',   body: "Season's greetings! Wishing you and your family a joyful Christmas filled with love, laughter, and warmth. 🎁" },
  { label: 'New Year 🎆',     title: 'Happy New Year 🎆',    body: 'Wishing you a wonderful New Year! May the coming year be filled with new opportunities and happiness. 🥂' },
  { label: 'Good Morning ☀️', title: 'Good Morning ☀️',      body: "Start your day with a smile! Check out today's best deals and offers just for you. Have a wonderful day! 😊" },
  { label: 'Weekend 🛍️',     title: 'Weekend Special 🛍️',  body: "The weekend is here! Explore amazing deals and discounts available at your favourite stores. Don't miss out! 🎉" },
  { label: 'Flash Sale ⚡',    title: 'Flash Sale ⚡',        body: "Limited time offer! Grab incredible discounts before they're gone. Shop now and save big! 🔥" },
];

const AdminCommonNotifications = ({ onLogout, userData }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminName, setAdminName]         = useState('Admin');

  // ── Form state ─────────────────────────────────────────────────────────
  const [formData, setFormData]       = useState({ title: '', body: '', image_url: '', target: 'all' });
  const [formLoading, setFormLoading] = useState(false);

  // ── Alerts ─────────────────────────────────────────────────────────────
  const [error, setError]                   = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // ── Sidebar: open on desktop, closed on mobile by default ──────────────
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Effects ────────────────────────────────────────────────────────────
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
  }, [userData]);

  useEffect(() => {
    if (error || successMessage) {
      const t = setTimeout(() => { setError(null); setSuccessMessage(null); }, 5000);
      return () => clearTimeout(t);
    }
  }, [error, successMessage]);

  // ── Form helpers ───────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const applyPreset = (preset) => {
    setFormData(p => ({ ...p, title: preset.title, body: preset.body }));
  };

  const resetForm = () => {
    setFormData({ title: '', body: '', image_url: '', target: 'all' });
  };

  // ── Send Now: create + send immediately ───────────────────────────────
  const handleCreateAndSend = async () => {
    if (!formData.title.trim()) { setError('Title is required.'); return; }
    if (!formData.body.trim())  { setError('Message body is required.'); return; }
    setFormLoading(true);
    setError(null);
    try {
      const { data } = await API.post('/notifications/common/', formData);
      const notifId = data.id;
      const res = await API.post(`/notifications/common/${notifId}/send/`);
      setSuccessMessage(res.data.message || 'Notification sent successfully!');
      resetForm();
    } catch (err) {
      const d = err?.response?.data;
      setError(typeof d === 'string' ? d : d?.error || d?.detail || 'Failed to send notification.');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="cn-container">

      {/* Dark overlay behind sidebar on mobile */}
      {isSidebarOpen && (
        <div
          className="cn-sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <AdminSidebar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(p => !p)}
        onLogout={onLogout}
        adminName={adminName}
      />

      <main className={`cn-main ${isSidebarOpen ? 'cn-sidebar-open' : 'cn-sidebar-closed'}`}>
        <div className="cn-wrapper">

          {/* ── Mobile top bar (hamburger + page title) ── */}
          <div className="cn-mobile-topbar">
            <button
              className="cn-hamburger"
              onClick={() => setIsSidebarOpen(p => !p)}
              aria-label="Toggle sidebar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6"  x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <span className="cn-mobile-title">Common Notifications</span>
          </div>

          {/* ── Page Header (desktop) ── */}
          <div className="cn-page-header">
            <h1 className="cn-page-title">Common Notifications</h1>
            <p className="cn-page-sub">Create and send festive greetings &amp; announcements to all users</p>
          </div>

          {/* ── Alerts ── */}
          {error && (
            <div className="cn-alert cn-alert-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9"  y1="9" x2="15" y2="15"/>
              </svg>
              {error}
              <button
                onClick={() => setError(null)}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}
                title="Dismiss"
              >✕</button>
            </div>
          )}
          {successMessage && (
            <div className="cn-alert cn-alert-success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {successMessage}
            </div>
          )}

          {/* ── Two-column: Form + Preview ── */}
          <div className="cn-main-grid">

            {/* Left: Form card */}
            <div className="cn-form-card">
              <div className="cn-card-header">
                <div className="cn-card-header-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </div>
                <div>
                  <p className="cn-card-title">Create Notification</p>
                  <p className="cn-card-sub">Compose and send to users instantly</p>
                </div>
              </div>

              <div className="cn-form-body">

                {/* Quick presets */}
                <div className="cn-preset-section">
                  <span className="cn-field-label">Quick presets</span>
                  <div className="cn-presets-row">
                    {EMOJI_PRESETS.map(p => (
                      <button
                        key={p.label}
                        className="cn-preset-btn"
                        onClick={() => applyPreset(p)}
                        type="button"
                        disabled={formLoading}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div className="cn-field">
                  <label className="cn-field-label">
                    Title <span className="cn-req">*</span>
                  </label>
                  <input
                    className="cn-input"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Happy Vishu 🌸"
                    maxLength={255}
                    disabled={formLoading}
                  />
                </div>

                {/* Message */}
                <div className="cn-field">
                  <label className="cn-field-label">
                    Message <span className="cn-req">*</span>
                  </label>
                  <textarea
                    className="cn-textarea"
                    name="body"
                    value={formData.body}
                    onChange={handleInputChange}
                    placeholder="Wishing you and your family a joyful and prosperous celebration! 🎉"
                    rows={3}
                    disabled={formLoading}
                  />
                </div>

                {/* Send To + Image row */}
                <div className="cn-grid-2">
                  <div className="cn-field">
                    <label className="cn-field-label">
                      Send To <span className="cn-req">*</span>
                    </label>
                    <select
                      className="cn-input"
                      name="target"
                      value={formData.target}
                      onChange={handleInputChange}
                      disabled={formLoading}
                    >
                      <option value="all">All Users</option>
                      <option value="active">Active Users Only</option>
                    </select>
                  </div>

                  <div className="cn-field">
                    <label className="cn-field-label">
                      Image <span className="cn-hint">(optional)</span>
                    </label>
                    <div className="cn-img-row">
                      <input
                        className="cn-input"
                        name="image_url"
                        value={formData.image_url}
                        onChange={handleInputChange}
                        placeholder="https://example.com/img.jpg"
                        disabled={formLoading}
                      />
                      {formData.image_url ? (
                        <img
                          src={formData.image_url}
                          alt="preview"
                          className="cn-img-thumb"
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="cn-img-placeholder">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="cn-form-actions">
                  <button
                    className="cn-btn-send-now"
                    onClick={handleCreateAndSend}
                    disabled={formLoading}
                  >
                    {formLoading ? (
                      <>
                        <span className="cn-spinner" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="22" y1="2" x2="11" y2="13"/>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                        Send Now
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>

            {/* Right: Live phone preview */}
            <div className="cn-preview-panel">
              <div className="cn-preview-card">
                <div className="cn-card-header">
                  <p className="cn-card-title">Live Preview</p>
                </div>
                <div className="cn-phone-wrap">
                  <div className="cn-phone">

                    {/* Status bar */}
                    <div className="cn-phone-bar">
                      <span>9:41</span>
                      <div className="cn-phone-signals">
                        <svg viewBox="0 0 20 12" width="16" height="12" fill="#555">
                          <rect x="0"  y="6"  width="3" height="6" rx="1"/>
                          <rect x="4"  y="4"  width="3" height="8" rx="1"/>
                          <rect x="8"  y="2"  width="3" height="10" rx="1"/>
                          <rect x="12" y="0"  width="3" height="12" rx="1"/>
                        </svg>
                        <svg viewBox="0 0 22 16" width="18" height="14" fill="none" stroke="#555" strokeWidth="2">
                          <path d="M1 7C5 2.5 8.5 1 11 1s6 1.5 10 6"/>
                          <path d="M4 10C6.5 7.5 8.7 6.5 11 6.5s4.5 1 7 3.5"/>
                          <path d="M7.5 13C9 11.5 10 11 11 11s2 .5 3.5 2"/>
                          <circle cx="11" cy="15" r="1" fill="#555" stroke="none"/>
                        </svg>
                        <svg viewBox="0 0 25 12" width="20" height="12" fill="none">
                          <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="#555"/>
                          <rect x="2" y="2" width="16" height="8" rx="2" fill="#555"/>
                          <path d="M23 4v4a2 2 0 0 0 0-4z" fill="#555"/>
                        </svg>
                      </div>
                    </div>

                    {/* Notification bubble */}
                    <div className="cn-phone-notif">
                      <div className="cn-phone-notif-head">
                        <div className="cn-phone-app-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                          </svg>
                        </div>
                        <span className="cn-phone-app-name">App</span>
                        <span className="cn-phone-time">just now</span>
                      </div>
                      <div className="cn-phone-notif-title">
                        {formData.title || 'Notification Title'}
                      </div>
                      <div className="cn-phone-notif-body">
                        {formData.body || 'Your message will appear here.'}
                      </div>
                      {formData.image_url && (
                        <img
                          src={formData.image_url}
                          alt=""
                          className="cn-phone-notif-img"
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                      )}
                    </div>

                    <div className="cn-phone-footer">Swipe to dismiss</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
          {/* ── End two-column ── */}

        </div>
      </main>

    </div>
  );
};

export default AdminCommonNotifications;