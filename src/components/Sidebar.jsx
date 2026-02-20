import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.scss';

const Sidebar = ({ isSidebarOpen, onToggleSidebar, onLogout, userName = 'User' }) => {
  const location = useLocation();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      route: '/user-dashboard',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 3h8v8H3zm0 10h8v8H3zM13 3h8v8h-8zm0 10h8v8h-8z" />
        </svg>
      ),
    },
    {
      id: 'offer-master',
      label: 'Offer Master',
      route: '/offer-master',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
        </svg>
      ),
    },
  ];

  const isActive = (route) => location.pathname === route;

  // Auto-close sidebar on route change on mobile
  useEffect(() => {
    if (window.innerWidth <= 768 && isSidebarOpen) {
      onToggleSidebar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Lock body scroll when drawer is open on mobile
  useEffect(() => {
    if (window.innerWidth <= 768) {
      document.body.style.overflow = isSidebarOpen ? 'hidden' : '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="usr-mobile-topbar">
        <button
          className="usr-mobile-hamburger"
          onClick={onToggleSidebar}
          aria-label="Open menu"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>
        <span className="usr-mobile-brand">Vsaver</span>
      </div>

      {/* ── Backdrop (mobile) ── */}
      <div
        className={`usr-sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`}
        onClick={onToggleSidebar}
        aria-hidden="true"
      />

      {/* ── Sidebar ── */}
      <aside className={`usr-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        {/* Header */}
        <div className="usr-sidebar-header">
          {isSidebarOpen ? (
            <div className="usr-branding">
              <div className="usr-brand-logo">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.94 4.34 4.34 4.34V2.84a.84.84 0 0 0-.84-.84H11.53zM14.75 13.51c0-1.14-.42-2.18-1.12-2.98l-.01.01-2.37 2.37c-.11.1-.2.25-.3.37v.01c-.65.9-1.03 1.99-1.03 3.18 0 2.96 2.4 5.35 5.35 5.35V13.5h-.52zM9.01 10.17l-.01.01c-1.14-.7-2.5-1.12-3.95-1.12C2.35 9.06 0 11.41 0 14.11v7.95h7.96c2.7 0 4.89-2.18 4.89-4.88 0-1.68-.84-3.16-2.13-4.05l-1.71-1.71v-.01c-.33-.29-.66-.66-1.01-1.01l.01-.01v-.22z" />
                </svg>
              </div>
              <div className="usr-brand-text">
                <h1 className="usr-brand-title">Vsaver</h1>
              </div>
              <button
                className="usr-close-btn"
                onClick={onToggleSidebar}
                aria-label="Close menu"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="usr-branding-collapsed">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.94 4.34 4.34 4.34V2.84a.84.84 0 0 0-.84-.84H11.53zM14.75 13.51c0-1.14-.42-2.18-1.12-2.98l-.01.01-2.37 2.37c-.11.1-.2.25-.3.37v.01c-.65.9-1.03 1.99-1.03 3.18 0 2.96 2.4 5.35 5.35 5.35V13.5h-.52zM9.01 10.17l-.01.01c-1.14-.7-2.5-1.12-3.95-1.12C2.35 9.06 0 11.41 0 14.11v7.95h7.96c2.7 0 4.89-2.18 4.89-4.88 0-1.68-.84-3.16-2.13-4.05l-1.71-1.71v-.01c-.33-.29-.66-.66-1.01-1.01l.01-.01v-.22z" />
              </svg>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="usr-nav-list">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.route}
              className={`usr-nav-item ${isActive(item.route) ? 'active' : ''}`}
            >
              <span className="usr-nav-icon">{item.icon}</span>
              {isSidebarOpen && <span className="usr-nav-label">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="usr-sidebar-footer">
          <button
            className="usr-collapse-btn"
            onClick={onToggleSidebar}
            aria-label="Toggle Sidebar"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path
                d={
                  isSidebarOpen
                    ? 'M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z'
                    : 'M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z'
                }
              />
            </svg>
            {isSidebarOpen && <span>Collapse</span>}
          </button>

          {isSidebarOpen && (
            <>
              <div className="usr-user-info">
                <div className="usr-user-avatar">{userName.charAt(0).toUpperCase()}</div>
                <div className="usr-user-details">
                  <span className="usr-user-name">{userName}</span>
                  <span className="usr-user-role">User</span>
                </div>
              </div>
              <button className="usr-logout-btn" onClick={onLogout}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 8l-1.41 1.41L17.17 11H9v2h8.17l-1.58 1.58L17 16l4-4-4-4zM5 5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h7v-2H5V5z" />
                </svg>
                Sign out
              </button>
            </>
          )}

          {!isSidebarOpen && (
            <button className="usr-logout-icon-btn" onClick={onLogout} aria-label="Logout">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 8l-1.41 1.41L17.17 11H9v2h8.17l-1.58 1.58L17 16l4-4-4-4zM5 5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h7v-2H5V5z" />
              </svg>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;