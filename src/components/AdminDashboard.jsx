import React, { useState, useEffect } from "react";
import API from "../services/api";
import AdminSidebar from "./Adminsidebar";
import "./AdminDashboard.scss";

/* ─── Icons ─── */
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const UsersIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const CheckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const BlockIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
);

/* ─── Helpers ─── */
const cleanDebtorName = (raw = "") => raw.replace(/\d{8,}$/, "").trim();

const resolveDisplayName = (user) => {
  if (!user) return "—";
  if (user.business_name) return cleanDebtorName(user.business_name);
  if (user.shop_name) return user.shop_name;
  const full = [user.first_name, user.last_name].filter(Boolean).join(" ");
  if (full) return full;
  return user.username || "—";
};

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    day: "2-digit", month: "short", year: "numeric",
  });
};

/* ════════════════════════════════════════════════════════════════ */
const AdminDashboard = ({ onLogout, userData }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const [stats, setStats] = useState({ total_admins: 0, active_admins: 0, disabled_admins: 0 });

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 768) setIsSidebarOpen(false);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (userData?.username) setAdminName(userData.username);
    else {
      const stored = localStorage.getItem("user");
      if (stored) {
        const p = JSON.parse(stored);
        setAdminName(p.username || p.email || "Admin");
      }
    }
    fetchUsers();
    fetchStats();
  }, [userData]);

  const fetchStats = async () => {
    try {
      const res = await API.get(`/admins/stats/`);
      setStats(res.data);
    } catch {}
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/admins/`);
      const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
      setUsers(data);
      setStats({
        total_admins:    data.length,
        active_admins:   data.filter((u) => u.status === "Active").length,
        disabled_admins: data.filter((u) => u.status === "Disable").length,
      });
    } catch {
      alert("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      resolveDisplayName(u).toLowerCase().includes(term) ||
      u.username?.toLowerCase().includes(term) ||
      u.phone_number?.toLowerCase().includes(term) ||
      u.location?.toLowerCase().includes(term) ||
      u.business_name?.toLowerCase().includes(term)
    );
  });

  /* ═══════════════════════ RENDER ═══════════════════════ */
  return (
    <div className="admin-dashboard-container">
      <AdminSidebar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onLogout={onLogout}
        adminName={adminName}
      />

      <main className={`admin-main-content ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <div className="content-wrapper">

          {/* ── Desktop Page Header — hidden on mobile via CSS ── */}
          <div className="page-header">
            <div className="header-left">
              <h1 className="page-title">User Management</h1>
              <p className="page-subtitle">All registered and signed-up users</p>
            </div>
            <div className="header-actions">
              <div className="search-wrapper">
                <SearchIcon />
                <input
                  className="search-input"
                  placeholder="Search by name, phone, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ── Mobile Page Header — shown only on mobile via CSS ── */}
          <div className="mobile-header">
            <div className="mobile-header__text">
              <h1 className="mobile-header__title">User Management</h1>
              <p className="mobile-header__subtitle">All registered and signed-up users</p>
            </div>
            <div className="search-wrapper mobile-header__search">
              <SearchIcon />
              <input
                className="search-input"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="stats-container">
            <div className="stat-card total">
              <div className="stat-icon"><UsersIcon /></div>
              <div className="stat-content">
                <div className="stat-value">{stats.total_admins}</div>
                <div className="stat-label">Total Users</div>
              </div>
            </div>
            <div className="stat-card active">
              <div className="stat-icon"><CheckIcon /></div>
              <div className="stat-content">
                <div className="stat-value">{stats.active_admins}</div>
                <div className="stat-label">Active</div>
              </div>
            </div>
            <div className="stat-card disabled">
              <div className="stat-icon"><BlockIcon /></div>
              <div className="stat-content">
                <div className="stat-value">{stats.disabled_admins}</div>
                <div className="stat-label">Disabled</div>
              </div>
            </div>
          </div>

          {/* ── Table ── */}
          <div className="table-section">
            <div className="table-header">
              <h2 className="table-title">
                All Users <span className="count-badge">{filteredUsers.length}</span>
              </h2>
            </div>

            {/* Scrollable wrapper — key for mobile horizontal scroll */}
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="col-num">#</th>
                    <th className="col-name">Name</th>
                    <th className="col-phone">Phone</th>
                    <th className="col-status">Status</th>
                    <th className="col-date">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="state-cell">
                        <div className="state-cell__inner">
                          <div className="loading-spinner" />
                          <span>Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="state-cell">
                        <div className="state-cell__inner">No users found</div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u, i) => (
                      <tr key={u.id}>
                        <td className="col-num row-num">{i + 1}</td>
                        <td className="col-name name-cell">
                          <div className="user-avatar">
                            {resolveDisplayName(u)[0]?.toUpperCase() || "?"}
                          </div>
                          <span>{resolveDisplayName(u)}</span>
                        </td>
                        <td className="col-phone">{u.phone_number || "—"}</td>
                        <td className="col-status">
                          <span className={`status-badge ${u.status === "Active" ? "active" : "disable"}`}>
                            {u.status || "—"}
                          </span>
                        </td>
                        <td className="col-date date-cell">
                          {formatDate(u.created_date || u.date_joined)}
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
    </div>
  );
};

export default AdminDashboard;