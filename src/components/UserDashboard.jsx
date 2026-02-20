import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import './UserDashboard.scss';
import { API_BASE_URL } from '../services/config';

const UserDashboard = ({ onLogout, userData }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userName, setUserName] = useState('User');
  const [shopName, setShopName] = useState('');
  const [stats, setStats] = useState({
    total_offer_masters: 0,
    active_offer_masters: 0,
    active_offers: 0,
    total_products: 0,
  });
  const [branches, setBranches] = useState([]);
  const [recentOffers, setRecentOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [branchLoading, setBranchLoading] = useState(true);

  useEffect(() => {
    if (userData) {
      setUserName(userData.username || 'User');
      setShopName(userData.shop_name || '');
    } else {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUserName(parsed.username || parsed.email || 'User');
        setShopName(parsed.shop_name || '');
      }
    }
    fetchDashboardStats();
    fetchPublicBranches();
    fetchRecentOffers();
  }, [userData]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/dashboard/stats/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setStats(await res.json());
    } catch (e) {
      console.error('Stats error:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicBranches = async () => {
    setBranchLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/public/branches/`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.branches) setBranches(data.branches.slice(0, 4));
      }
    } catch (e) {
      console.error('Branches error:', e);
    } finally {
      setBranchLoading(false);
    }
  };

  const fetchRecentOffers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/public/offers/`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.offers) setRecentOffers(data.offers.slice(0, 4));
      }
    } catch (e) {
      console.error('Offers error:', e);
    }
  };

  const handleToggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleRefresh = () => {
    fetchDashboardStats();
    fetchPublicBranches();
    fetchRecentOffers();
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getOfferStatus = (offer) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const from = new Date(offer.valid_from);
    const to = new Date(offer.valid_to); to.setHours(23, 59, 59, 999);
    if (today < from) return 'upcoming';
    if (today > to) return 'expired';
    return 'active';
  };

  const statCards = [
    {
      key: 'total_offer_masters',
      label: 'Total Offers',
      desc: 'All campaigns created',
      color: 'orange',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
        </svg>
      ),
    },
    {
      key: 'active_offer_masters',
      label: 'Live Campaigns',
      desc: 'Currently active offers',
      color: 'green',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
        </svg>
      ),
    },
    {
      key: 'active_offers',
      label: 'Active Products',
      desc: 'Products in promotion',
      color: 'blue',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      ),
    },
    {
      key: 'total_products',
      label: 'Total Products',
      desc: 'In your inventory',
      color: 'purple',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="ud-root">
      <div className="ud-layout">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={handleToggleSidebar}
          onLogout={onLogout}
          userName={userName}
        />

        <main className={`ud-main ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="ud-inner">

            {/* Topbar */}
            <header className="ud-topbar">
              <div className="ud-topbar-left">
                <p className="ud-greeting">{getGreeting()}</p>
                <h1 className="ud-username">
                  {userName}
                  {shopName && <span className="ud-shopname"> · {shopName}</span>}
                </h1>
              </div>
              <button className="ud-refresh-btn" onClick={handleRefresh} disabled={loading}>
                <svg
                  className={`ud-refresh-icon${loading ? ' spin' : ''}`}
                  width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5"
                >
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                <span>{loading ? 'Refreshing…' : 'Refresh'}</span>
              </button>
            </header>

            {/* Hero */}
            <div className="ud-hero">
              <div className="ud-hero-blob ud-hero-blob--1" />
              <div className="ud-hero-blob ud-hero-blob--2" />
              <div className="ud-hero-content">
                <div className="ud-hero-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42z" />
                  </svg>
                  Offer Management Hub
                </div>
                <h2 className="ud-hero-title">Manage Your Offers &amp; Branches</h2>
                <p className="ud-hero-sub">
                  Track all your active promotions, monitor branch performance, and stay on top of your offer campaigns — all in one place.
                </p>
                <a href="/offer-master" className="ud-hero-cta">
                  View All Offers
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                  </svg>
                </a>
              </div>
              <div className="ud-hero-visual">
                <div className="ud-orb ud-orb--1" />
                <div className="ud-orb ud-orb--2" />
                <div className="ud-orb ud-orb--3" />
              </div>
            </div>

            {/* Stats */}
            <section className="ud-stats-section">
              <div className="ud-section-header">
                <span className="ud-section-label">Overview</span>
                <h3 className="ud-section-title">Key Metrics</h3>
              </div>
              <div className="ud-stats-grid">
                {statCards.map((card) => (
                  <div key={card.key} className={`ud-stat-card ud-stat-card--${card.color}`}>
                    <div className="ud-stat-top">
                      <div className={`ud-stat-icon ud-stat-icon--${card.color}`}>{card.icon}</div>
                    </div>
                    <div className="ud-stat-body">
                      {loading ? (
                        <>
                          <div className="ud-skeleton ud-skeleton--value" />
                          <div className="ud-skeleton ud-skeleton--label" />
                        </>
                      ) : (
                        <>
                          <span className="ud-stat-value">{stats[card.key] ?? 0}</span>
                          <span className="ud-stat-label">{card.label}</span>
                          <span className="ud-stat-desc">{card.desc}</span>
                        </>
                      )}
                    </div>
                    <div className="ud-stat-glow" />
                  </div>
                ))}
              </div>
            </section>

            {/* Two-col: Recent Offers + Branches */}
            <div className="ud-two-col">

              {/* Recent Offers */}
              <section className="ud-panel">
                <div className="ud-panel-header">
                  <div>
                    <span className="ud-section-label">Latest</span>
                    <h3 className="ud-section-title">Recent Offers</h3>
                  </div>
                  <a href="/offer-master" className="ud-panel-link">
                    View all
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                    </svg>
                  </a>
                </div>
                <div className="ud-panel-body">
                  {recentOffers.length === 0 ? (
                    <div className="ud-empty">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <p>No offers available yet</p>
                    </div>
                  ) : recentOffers.map((offer) => {
                    const status = getOfferStatus(offer);
                    return (
                      <div key={offer.id} className="ud-offer-row">
                        <div className="ud-offer-row-left">
                          <div className={`ud-offer-dot ud-offer-dot--${status}`} />
                          <div className="ud-offer-info">
                            <span className="ud-offer-title">{offer.title}</span>
                            <span className="ud-offer-dates">
                              {formatDate(offer.valid_from)} → {formatDate(offer.valid_to)}
                            </span>
                          </div>
                        </div>
                        <span className={`ud-offer-badge ud-offer-badge--${status}`}>
                          {status === 'active' ? 'Active' : status === 'upcoming' ? 'Upcoming' : 'Expired'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Branches */}
              <section className="ud-panel">
                <div className="ud-panel-header">
                  <div>
                    <span className="ud-section-label">Locations</span>
                    <h3 className="ud-section-title">Active Branches</h3>
                  </div>
                  <a href="/offer-master" className="ud-panel-link">
                    Explore
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                    </svg>
                  </a>
                </div>
                <div className="ud-panel-body">
                  {branchLoading ? (
                    [1, 2, 3].map((i) => (
                      <div key={i} className="ud-branch-row">
                        <div className="ud-skeleton" style={{ width: 36, height: 36, borderRadius: 6, flexShrink: 0 }} />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                          <div className="ud-skeleton" style={{ width: '60%', height: 13 }} />
                          <div className="ud-skeleton" style={{ width: '40%', height: 11 }} />
                        </div>
                      </div>
                    ))
                  ) : branches.length === 0 ? (
                    <div className="ud-empty">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                      <p>No branches found</p>
                    </div>
                  ) : branches.map((branch) => (
                    <div key={branch.id} className="ud-branch-row">
                      <div className="ud-branch-avatar">
                        {branch.branch_image_url
                          ? <img src={branch.branch_image_url} alt={branch.branch_name} />
                          : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                            </svg>
                          )}
                      </div>
                      <div className="ud-branch-info">
                        <span className="ud-branch-name">{branch.branch_name}</span>
                        <span className="ud-branch-loc">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                          </svg>
                          {branch.location}
                        </span>
                      </div>
                      {branch.active_offers_count > 0 && (
                        <span className="ud-branch-count">
                          {branch.active_offers_count} offer{branch.active_offers_count !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;