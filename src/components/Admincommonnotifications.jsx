// ============================================================================
// AdminCommonNotifications Component - Redesigned
// Classic, Elegant Notification Management
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import AdminSidebar from './Adminsidebar';
import './AdminCommonNotifications.scss';
import API from '../services/api';

const EMOJI_PRESETS = [
  { label: 'Flash Sale ⚡',     title: 'Flash Sale ⚡',              body: "Limited time offer! Grab incredible discounts before they're gone. Shop now and save big! 🔥" },
  { label: 'New Offer 🎁',      title: 'New Offer Just Dropped 🎁',  body: 'A brand new offer is waiting for you! Check it out now and grab the best deals before they expire. 🛍️' },
  { label: 'Limited Time ⏳',   title: 'Limited Time Deal ⏳',       body: "Hurry! This exclusive deal won't last long. Visit your nearest store and save big today. ⚡" },
  { label: 'Weekend Deal 🛍️',  title: 'Weekend Special 🛍️',        body: "The weekend is here! Explore amazing deals and discounts available at your favourite stores. Don't miss out! 🎉" },
  { label: 'Mega Sale 🔥',      title: 'Mega Sale Is Live 🔥',       body: 'Our biggest sale of the season is now live! Unbeatable prices across all categories. Shop now! 💥' },
  { label: 'Clearance 🏷️',     title: 'Clearance Sale 🏷️',         body: 'Stock is running out fast! Grab clearance deals at the lowest prices before they are gone for good. 🚨' },
  { label: 'Exclusive 👑',      title: 'Exclusive Member Offer 👑',  body: 'A special offer just for you! As a valued customer, enjoy exclusive discounts available for a limited time only. 🎀' },
  { label: 'Back in Stock 📦',  title: 'Back in Stock 📦',           body: 'Your favourite products are back! Limited stock available — order now before it sells out again. 🛒' },
];

function getMinDatetime() {
  const d = new Date(Date.now() + 60000);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toUTCISO(localStr) {
  if (!localStr) return null;
  return new Date(localStr).toISOString();
}

function formatScheduled(localStr) {
  if (!localStr) return '';
  return new Date(localStr).toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// Icons
function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

function StatusBadge({ status }) {
  if (status === 'sent') {
    return (
      <span className="acn-badge acn-badge--sent">
        <CheckIcon />
        Sent
      </span>
    );
  }
  if (status === 'scheduled') {
    return <span className="acn-badge acn-badge--scheduled">Scheduled</span>;
  }
  return <span className="acn-badge acn-badge--draft">Draft</span>;
}

function NotifCard({ n, onDelete, deleteId }) {
  const isDeleting = deleteId === n.id;
  const timeLabel = n.status === 'sent'
    ? timeAgo(n.sent_at)
    : n.scheduled_at
      ? formatScheduled(n.scheduled_at)
      : '—';

  return (
    <div className={`acn-notif-card ${n.status === 'scheduled' ? 'acn-notif-card--scheduled' : ''} ${n.status === 'sent' ? 'acn-notif-card--sent' : ''}`}>
      <div className="acn-notif-card-bar">
        <div className="acn-notif-card-approw">
          <div className="acn-notif-card-appicon">
            <BellIcon />
          </div>
          <span className="acn-notif-card-appname">Notification</span>
          <span className="acn-notif-card-dot">·</span>
          <span className="acn-notif-card-time">{timeLabel}</span>
        </div>

        <div className="acn-notif-card-actions">
          {n.status === 'sent' && n.sent_at && (
            <span className="acn-notif-card-sent-date">
              Sent {formatDate(n.sent_at)}
            </span>
          )}
          {n.status !== 'sent' && <StatusBadge status={n.status} />}
          <button
            className="acn-delete-btn"
            onClick={() => onDelete(n.id)}
            disabled={isDeleting}
            title="Delete"
          >
            {isDeleting ? <span className="acn-spinner acn-spinner--red" /> : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="acn-notif-card-body">
        <div className="acn-notif-card-title">{n.title}</div>
        {n.body && <div className="acn-notif-card-message">{n.body}</div>}
      </div>

      <div className="acn-notif-card-footer">
        {n.status === 'sent' && (
          <span className="acn-notif-card-devices">
            <PeopleIcon />
            {n.sent_count} devices reached
          </span>
        )}
        {n.status === 'scheduled' && (
          <span className="acn-notif-card-schedinfo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="13" height="13">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Sends {formatScheduled(n.scheduled_at)}
          </span>
        )}
        {n.status === 'sent' && n.sent_at && (
          <span className="acn-notif-card-sentat">Sent {formatDate(n.sent_at)}</span>
        )}
      </div>
    </div>
  );
}

const AdminCommonNotifications = ({ onLogout, userData }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminName, setAdminName] = useState('Admin');

  const [formData, setFormData] = useState({ title: '', body: '', target: 'all' });
  const [scheduledAt, setScheduledAt] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const onResize = () => setIsSidebarOpen(window.innerWidth >= 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

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

  const fetchNotifications = useCallback(async () => {
    setListLoading(true);
    try {
      const { data } = await API.get('/notifications/common/');
      setNotifications(Array.isArray(data) ? data : (data.results || []));
    } catch {
      // silent fail
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const applyPreset = preset => {
    setFormData(p => ({ ...p, title: preset.title, body: preset.body }));
  };

  const resetForm = () => {
    setFormData({ title: '', body: '', target: 'all' });
    setScheduledAt('');
  };

  const isScheduled = !!scheduledAt;

  const handleSubmit = async () => {
    if (!formData.title.trim()) { setError('Title is required.'); return; }
    if (!formData.body.trim()) { setError('Message body is required.'); return; }

    setFormLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        scheduled_at: isScheduled ? toUTCISO(scheduledAt) : null,
      };

      const { data } = await API.post('/notifications/common/', payload);

      if (!isScheduled) {
        const res = await API.post(`/notifications/common/${data.id}/send/`);
        setSuccessMessage(res.data.message || 'Notification sent successfully!');
      } else {
        setSuccessMessage(`Notification scheduled for ${formatScheduled(scheduledAt)} ✅`);
      }

      resetForm();
      fetchNotifications();
    } catch (err) {
      const d = err?.response?.data;
      if (d && typeof d === 'object') {
        setError(Object.values(d).flat().join(' '));
      } else {
        setError(typeof d === 'string' ? d : 'Failed to process notification.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    setDeleteId(id);
    try {
      await API.delete(`/notifications/common/${id}/`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch {
      setError('Failed to delete notification.');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="acn-container">
      {isSidebarOpen && (
        <div className="acn-sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      <AdminSidebar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(p => !p)}
        onLogout={onLogout}
        adminName={adminName}
      />

      <main className={`acn-main ${isSidebarOpen ? 'acn-sidebar-open' : 'acn-sidebar-closed'}`}>
        <div className="acn-wrapper">

          <div className="acn-mobile-topbar">
            <button className="acn-hamburger" onClick={() => setIsSidebarOpen(p => !p)} aria-label="Toggle sidebar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <span className="acn-mobile-title">Notifications</span>
          </div>

          <div className="acn-page-header">
            <div className="acn-header-content">
              <h1 className="acn-page-title">Notification Center</h1>
              <p className="acn-page-sub">Create, schedule, and manage notifications sent to your users</p>
            </div>
          </div>

          {error && (
            <div className="acn-alert acn-alert-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <span>{error}</span>
              <button onClick={() => setError(null)} className="acn-alert-close">×</button>
            </div>
          )}

          {successMessage && (
            <div className="acn-alert acn-alert-success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          <div className="acn-form-card">
            <div className="acn-card-header">
              <div className="acn-card-header-content">
                <h2 className="acn-card-title">Compose Notification</h2>
                <p className="acn-card-sub">Send instantly or schedule for later</p>
              </div>
            </div>

            <div className="acn-form-body">

              <div className="acn-preset-section">
                <label className="acn-field-label">Quick Templates</label>
                <div className="acn-presets-row">
                  {EMOJI_PRESETS.map(p => (
                    <button 
                      key={p.label} 
                      className="acn-preset-btn" 
                      onClick={() => applyPreset(p)} 
                      type="button" 
                      disabled={formLoading}
                      title={p.title}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="acn-field">
                <label className="acn-field-label">Title <span className="acn-req">*</span></label>
                <input
                  className="acn-input"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter notification title"
                  maxLength={255}
                  disabled={formLoading}
                />
              </div>

              <div className="acn-field">
                <label className="acn-field-label">Message <span className="acn-req">*</span></label>
                <textarea
                  className="acn-textarea"
                  name="body"
                  value={formData.body}
                  onChange={handleInputChange}
                  placeholder="Enter notification message"
                  rows={4}
                  disabled={formLoading}
                />
              </div>

              <div className="acn-grid-2">
                <div className="acn-field">
                  <label className="acn-field-label">Send To <span className="acn-req">*</span></label>
                  <select 
                    className="acn-input" 
                    name="target" 
                    value={formData.target} 
                    onChange={handleInputChange} 
                    disabled={formLoading}
                  >
                    <option value="all">All Users</option>
                    <option value="active">Active Users Only</option>
                  </select>
                </div>
                <div className="acn-field">
                  <label className="acn-field-label">Schedule <span className="acn-hint">(optional)</span></label>
                  <input
                    type="datetime-local"
                    className="acn-input"
                    min={getMinDatetime()}
                    value={scheduledAt}
                    onChange={e => setScheduledAt(e.target.value)}
                    disabled={formLoading}
                  />
                </div>
              </div>

              {scheduledAt && (
                <div className="acn-schedule-preview">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <div>Scheduled for <strong>{formatScheduled(scheduledAt)}</strong></div>
                </div>
              )}

              <div className="acn-form-actions">
                <button
                  className={`acn-btn-submit ${isScheduled ? 'acn-btn-submit--schedule' : ''}`}
                  onClick={handleSubmit}
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <><span className="acn-spinner" />{isScheduled ? 'Scheduling…' : 'Sending…'}</>
                  ) : isScheduled ? (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      Schedule Notification
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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

          <div className="acn-history-section">
            <div className="acn-history-header">
              <div>
                <h2 className="acn-history-title">History</h2>
                <p className="acn-history-sub">Auto-refreshes every 30 seconds</p>
              </div>
              <button 
                className="acn-refresh-btn" 
                onClick={fetchNotifications} 
                disabled={listLoading}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={listLoading ? 'acn-spin' : ''}>
                  <polyline points="23 4 23 10 17 10"/>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
                Refresh
              </button>
            </div>

            {listLoading && notifications.length === 0 ? (
              <div className="acn-history-empty">
                <span className="acn-spinner acn-spinner--dark" />
                <span>Loading notifications…</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="acn-history-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <span>No notifications yet</span>
              </div>
            ) : (
              <div className="acn-notif-cards-list">
                {notifications.map(n => (
                  <NotifCard
                    key={n.id}
                    n={n}
                    onDelete={handleDelete}
                    deleteId={deleteId}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminCommonNotifications;