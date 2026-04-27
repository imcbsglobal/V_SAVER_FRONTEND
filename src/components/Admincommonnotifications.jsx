// ============================================================================
// AdminCommonNotifications Component - Redesigned
// Classic, Elegant Notification Management
// ============================================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import AdminSidebar from './Adminsidebar';
import './Admincommonnotifications.scss';
import API from '../services/api';

// ── FCM V1 constants & helpers (same as AdminFcmNotification) ─────────────────
const PROJECT_ID = 'vsaver-6f5a7';

const SA = {
  type: 'service_account',
  project_id: 'vsaver-6f5a7',
  private_key_id: 'd66874c450820c474be73f72183217af260dd78c',
  private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC1G5vU8zW5ThBe\nAculrfuhtTgAXiFrChiP63jv04aVepBt2NamAf8kfNOXOGHW+9kuDXABhmkOWy6k\npzv9fn6rAbm5bTv0evQ2mwZFVeDajTtvuDkMjXV1gE4aoEa9T/TavUi58G7+opMh\nze8kBO6X9c43vJid0YJLYdEuTORIUNQqYyDKA/aMNCW2HO8sV0iGYCHnqprwWsK2\nM6gVb8TAftZNcp+/m6ZM8xaVbqayAg79ezDtBfS4LGbglH3lBBRoaLucYNzzIsXB\nvJk+B3Q3fCSHlgBKhW6XvQxHCpHSqB9se9dv2DC+uxiYBhMtnsc/rYzluUsS08b5\n7I1T3qlTAgMBAAECggEAKH0VIA0FcDmDEDkviYk1bcgBTpe8udzmc9ptTZSJDIb7\nngsxpahhnYsolLCesvzX52NKrJSbjQGWkmnuz/PFJr76gflpQ3Vvfnu28a5K2CFl\n7cqOOn+viEbYbzxwxCcJcxOJHESj09qNsSuEcJWHr8JcyXoo1nN9wROLu+Gl0YKc\nJuS6IyVms7RPUssVcDw4b2Da0KNveJrzVCEU6GWAFuY9fDAK3pjuwGcvX82e2Lmq\n4YySBU0a+hRL4Yf2jPzSvgPCGFufbfEtlyyCIAjI4W6tAsjf0TjuqPSOciRuW5S8\n4Giy6VhDD+JmrABTgv7Y4Q8C+UGXm8CJBGculUMzLQKBgQDgtR8JtPbx/sUOLrUg\nfQ7fbpxtKx1qERaBSIYnvP9C9zIblN5geSTraHrSIKjnl/sq2a4/KjSz3dTVpvoM\n6XwSAEZA7JDkmmFPs25kIdSaBYEoPYyrBuKaBlRFphMT16oFyHH3UfBintKXa1Su\nmRQYo8d20/TbiR0540T5SkJMDQKBgQDOVCYUlfsISi6BACST0pecZATFSIC2qv+o\nxNCzBDSjJuvEYnb/PFVIB8Y5sXayoQCrR7mgjyzFIEe4ZtD/hmWne2yoRVJc+qV1\n8eSvZDjqs/wCNo52v6/v1gL/6MXKkAy+Mf5Wgq87AK9wI/cksdrApHHd1n2GhGPi\nLCazVPuS3wKBgBPj1Fh+nTE0dOrZdYznpO5gExaSr2rZEl3lNoLD9vBNgzDvz3NI\npdz0hZKd83V0fXYAiKzspneZViKHQjDsZeAOCCntBrJFfAGbB1VzrSbo/9K5B/+H\nf31UvBbiKWQjPdh/Mp9KsHV6S3e9t2QxBpdbv+cjwdPA4kZieJN8YDvtAoGBALvq\nF+SX1FHwffovTyDyo/JjhZTIO7Iie0YSOqFQK0CMqh3qL8a2BFXd/sN8xUZbLGjS\nolWBEJ1YkPl5as/Ob7bhykxXFnRoM1oAPO8gsFXSJqs9VPMCEhK1L3YzYjDikTiH\n/8R6sW1jamUP3H8nHLxnCO2p9BkXaoELBRQ/SgCxAoGBANqZ0NPFtsXaPwJgOtI+\nITKOXhCGu6s6p37ZndqiSXL4+qdmSgwKHPJQICfzPN2LEb9rwfJlhx245Y4/M25V\nL/N+BM3YCJxIkj4moFBnkuIWkl7aUI+mM/YpRhWA49b7BYH9jC5t+UdqqGy4fJZJ\nWhVeaPvKw0x6ey+ZwN1EK89E\n-----END PRIVATE KEY-----\n',
  client_email: 'firebase-adminsdk-fbsvc@vsaver-6f5a7.iam.gserviceaccount.com',
  client_id: '116287954951429008618',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40vsaver-6f5a7.iam.gserviceaccount.com',
  universe_domain: 'googleapis.com',
};

function loadJsrsasign() {
  return new Promise((resolve, reject) => {
    if (window.KJUR) { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jsrsasign/10.9.0/jsrsasign-all-min.js';
    s.onload  = resolve;
    s.onerror = () => reject(new Error('Failed to load jsrsasign'));
    document.head.appendChild(s);
  });
}

async function getFcmOAuthToken() {
  await loadJsrsasign();
  const now = Math.floor(Date.now() / 1000);
  const jwt = window.KJUR.jws.JWS.sign(
    'RS256',
    JSON.stringify({ alg: 'RS256', typ: 'JWT' }),
    JSON.stringify({
      iss  : SA.client_email,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud  : 'https://oauth2.googleapis.com/token',
      iat  : now,
      exp  : now + 3600,
    }),
    SA.private_key
  );
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method : 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body   : new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion : jwt,
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token)
    throw new Error(data.error_description || data.error || 'Token exchange failed');
  return data.access_token;
}

async function sendFcmToAll(title, body, imageUrl) {
  // Fetch all FCM tokens from DB
  const token = localStorage.getItem('access_token');
  const res = await fetch('https://vsaver.in/api/push/fcm-tokens/', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  const fcmTokens = (data.tokens || []).map(t => t.fcm_token).filter(Boolean);

  if (fcmTokens.length === 0) return { sent: 0, total: 0 };

  const oauthToken = await getFcmOAuthToken();
  let sent = 0;

  for (const tok of fcmTokens) {
    const payload = {
      message: {
        token: tok,
        notification: {
          title,
          body,
          ...(imageUrl && { image: imageUrl }),
        },
        android: {
          notification: {
            channel_id: 'default',
            ...(imageUrl && { image: imageUrl }),
          },
        },
        ...(imageUrl && { data: { imageUrl } }),
      },
    };
    try {
      const r = await fetch(
        `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`,
        {
          method : 'POST',
          headers: {
            'Content-Type' : 'application/json',
            'Authorization': `Bearer ${oauthToken}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const d = await r.json();
      if (r.ok && d.name) sent++;
    } catch { /* skip failed token */ }
  }

  return { sent, total: fcmTokens.length };
}
// ─────────────────────────────────────────────────────────────────────────────

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

  // Resolve image — prefer resolved_image_url (file upload), fall back to image_url (URL string)
  // Both are checked so the card works even before the image migration is applied
  const displayImage = n.resolved_image_url || n.image_url || null;

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
        <div className="acn-notif-card-content-row">
          <div className="acn-notif-card-text">
            <div className="acn-notif-card-title">{n.title}</div>
            {n.body && <div className="acn-notif-card-message">{n.body}</div>}
          </div>
          {/* Shows image from file upload (resolved_image_url) or URL string (image_url) */}
          {displayImage && (
            <div className="acn-notif-card-image-wrap">
              <img
                src={displayImage}
                alt="Notification"
                className="acn-notif-card-image"
                onError={e => { e.target.style.display = 'none'; }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="acn-notif-card-footer">
        {n.status === 'sent' && (
          <span className="acn-notif-card-devices">
            <PeopleIcon />
            Sent
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

  // ── Image state ──────────────────────────────────────────────────────────────
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploadMode, setImageUploadMode] = useState('file'); // 'file' | 'url'
  const [imageUrl, setImageUrl] = useState('');
  const imageInputRef = useRef(null);
  // ─────────────────────────────────────────────────────────────────────────────

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
      const list = Array.isArray(data) ? data : (data.results || []);
      // Debug: log first item to verify image fields are coming through
      if (list.length > 0) {
        console.log('[Notifications] Sample item image fields:', {
          resolved_image_url: list[0].resolved_image_url,
          image_url: list[0].image_url,
        });
      }
      setNotifications(list);
    } catch (err) {
      console.error('[Notifications] Fetch error:', err);
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

  // ── Image handlers ───────────────────────────────────────────────────────────
  const handleImageFileChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_MB = 5;
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Image must be smaller than ${MAX_MB} MB.`);
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, GIF, WebP).');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageUrl('');
    if (imageInputRef.current) imageInputRef.current.value = '';
  };
  // ─────────────────────────────────────────────────────────────────────────────

  const resetForm = () => {
    setFormData({ title: '', body: '', target: 'all' });
    setScheduledAt('');
    clearImage();
  };

  const isScheduled = !!scheduledAt;

  const handleSubmit = async () => {
    if (!formData.title.trim()) { setError('Title is required.'); return; }
    if (!formData.body.trim()) { setError('Message body is required.'); return; }

    setFormLoading(true);
    setError(null);

    // Resolve image URL for FCM
    let resolvedImageUrl = '';
    if (imageFile) {
      // For file uploads we need a public URL — use object URL as preview only;
      // actual public URL comes after backend save below
    } else if (imageUploadMode === 'url' && imageUrl.trim()) {
      resolvedImageUrl = imageUrl.trim();
    }

    try {
      // 1️⃣  Save to backend (existing flow — unchanged)
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('body', formData.body);
      fd.append('target', formData.target);

      if (isScheduled) {
        fd.append('scheduled_at', toUTCISO(scheduledAt));
      }

      if (imageFile) {
        fd.append('image', imageFile);
      } else if (imageUploadMode === 'url' && imageUrl.trim()) {
        fd.append('image_url', imageUrl.trim());
      }

      const { data: createdData } = await API.post('/notifications/common/', fd);

      // Resolve public image URL from saved record for FCM
      resolvedImageUrl = createdData.resolved_image_url || createdData.image_url || resolvedImageUrl;

      // 2️⃣  Send via FCM V1 directly (only for immediate sends, not scheduled)
      if (!isScheduled) {
        try {
          const { sent, total } = await sendFcmToAll(
            formData.title.trim(),
            formData.body.trim(),
            resolvedImageUrl
          );

          // Patch sent_count back to DB so history shows correct device count
          try {
            await API.patch(`/notifications/common/${createdData.id}/`, { sent_count: sent });
          } catch { /* non-fatal — history will just show 0 */ }

          setSuccessMessage(
            `Notification sent to ${sent} of ${total} device(s) via FCM V1 ✅`
          );
        } catch (fcmErr) {
          // FCM failed but backend save succeeded — still show success
          setSuccessMessage(
            (createdData.message || 'Notification saved.') +
            ` (FCM send failed: ${fcmErr.message})`
          );
        }
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

              {/* ── Image Attachment ─────────────────────────────────────── */}
              <div className="acn-field">
                <label className="acn-field-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="12" height="12">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  Notification Image
                  <span className="acn-hint">(optional)</span>
                </label>

                {/* Mode toggle */}
                <div className="acn-img-mode-toggle">
                  <button
                    type="button"
                    className={`acn-img-mode-btn ${imageUploadMode === 'file' ? 'acn-img-mode-btn--active' : ''}`}
                    onClick={() => { setImageUploadMode('file'); clearImage(); }}
                    disabled={formLoading}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    className={`acn-img-mode-btn ${imageUploadMode === 'url' ? 'acn-img-mode-btn--active' : ''}`}
                    onClick={() => { setImageUploadMode('url'); clearImage(); }}
                    disabled={formLoading}
                  >
                    Paste URL
                  </button>
                </div>

                {imageUploadMode === 'file' ? (
                  imagePreview ? (
                    /* Preview of selected file */
                    <div className="acn-img-preview-wrap">
                      <img src={imagePreview} alt="Preview" className="acn-img-preview" />
                      <div className="acn-img-preview-meta">
                        <span className="acn-img-preview-name">{imageFile?.name}</span>
                        <span className="acn-img-preview-size">
                          {imageFile ? `${(imageFile.size / 1024).toFixed(0)} KB` : ''}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="acn-img-clear-btn"
                        onClick={clearImage}
                        disabled={formLoading}
                        title="Remove image"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        Remove
                      </button>
                    </div>
                  ) : (
                    /* Drop zone */
                    <div
                      className="acn-img-dropzone"
                      onClick={() => !formLoading && imageInputRef.current?.click()}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          const fakeEvent = { target: { files: [file] } };
                          handleImageFileChange(fakeEvent);
                        }
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="acn-img-dropzone-icon">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <span className="acn-img-dropzone-text">
                        <strong>Click to upload</strong> or drag & drop
                      </span>
                      <span className="acn-img-dropzone-hint">JPG, PNG, GIF, WebP · max 5 MB</span>
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        className="acn-img-hidden-input"
                        onChange={handleImageFileChange}
                        disabled={formLoading}
                      />
                    </div>
                  )
                ) : (
                  /* URL input mode */
                  <div className="acn-img-url-wrap">
                    <input
                      type="url"
                      className="acn-input"
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={e => setImageUrl(e.target.value)}
                      disabled={formLoading}
                    />
                    {imageUrl.trim() && (
                      <div className="acn-img-url-preview-wrap">
                        <img
                          src={imageUrl}
                          alt="URL Preview"
                          className="acn-img-url-preview"
                          onError={e => { e.target.style.display = 'none'; }}
                          onLoad={e => { e.target.style.display = 'block'; }}
                          style={{ display: 'none' }}
                        />
                        <button
                          type="button"
                          className="acn-img-clear-btn"
                          onClick={clearImage}
                          disabled={formLoading}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* ── End Image Attachment ──────────────────────────────────── */}

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