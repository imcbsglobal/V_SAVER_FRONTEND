import React, { useState, useEffect } from "react";
import axios from "axios";

/* ------------ ICONS ------------ */
const LogOutIcon = () => <span>⎋</span>;
const EditIcon = () => <span>✎</span>;
const TrashIcon = () => <span>🗑</span>;

const AdminDashboard = ({ onLogout }) => {
  const [admins, setAdmins] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

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

  const API_BASE_URL = "http://127.0.0.1:8000/api";

  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  /* ------------ API ------------ */
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/admins/`, {
        headers: getAuthHeaders(),
      });
      setAdmins(res.data);
      calculateStats(res.data);
    } catch {
      alert("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const addAdmin = async () => {
    try {
      await axios.post(`${API_BASE_URL}/admins/`, newAdmin, {
        headers: getAuthHeaders(),
      });
      fetchAdmins();
      setShowAddForm(false);
      resetNewAdmin();
      alert("✅ User added successfully");
    } catch {
      alert("❌ Failed to add user");
    }
  };

  const deleteAdmin = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await axios.delete(`${API_BASE_URL}/admins/${id}/`, {
      headers: getAuthHeaders(),
    });
    fetchAdmins();
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

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

  const colors = {
    primary: "#00897b",
    dark: "#00695c",
    bg: "linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)",
    white: "#ffffff",
    gray: "#555",
    border: "#b2dfdb",
    danger: "#d32f2f"
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: colors.bg,
      padding: 40
    }}>

      {/* TOP BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            background: colors.primary,
            fontSize: 15,
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "10px 22px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(22,163,74,0.4)"
          }}
        >
          + Add User
        </button>

        <div style={{ display: "flex", gap: 12 }}>
          <input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: `1px solid ${colors.border}`,
              minWidth: 220
            }}
          />
          <button
            onClick={onLogout}
            style={{
              background: colors.danger,
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "0 20px",
              cursor: "pointer",
            }}
          >
            <LogOutIcon /> Logout
          </button>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: "flex", gap: 20, marginBottom: 28 }}>
        {[
          { label: "Total", value: stats.total_admins },
          { label: "Active", value: stats.active_admins },
          { label: "Disabled", value: stats.disabled_admins },
        ].map((s, i) => (
          <div key={i}
            style={{
              background: colors.white,
              padding: "18px 26px",
              borderRadius: 14,
              border: `3px solid ${colors.border}`,
              minWidth: 160,
              textAlign: "center",
            }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: colors.primary }}>
              {s.value}
            </div>
            <div style={{ fontSize: 14, color: colors.gray }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <div
        style={{
          background: colors.white,
          borderRadius: 18,
          overflowX: "auto",
          border: `2px solid ${colors.border}`,
          padding: 10
        }}
      >
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 10px" }}>
          <thead>
            <tr style={{ background: colors.primary, color: "#fff" }}>
              {["#", "Shop", "Username", "Password", "Email", "Phone", "Amount", "Location", "Status", "Days", "Validity", "Edit", "Delete"]
                .map((h, i) => (
                  <th key={i} style={{ padding: "14px 16px", fontSize: 14 }}>
                    {h}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="13" style={{ textAlign: "center", padding: 30 }}>Loading...</td></tr>
            ) : (
              filteredAdmins.map((u, i) => (
                <tr key={u.id}
                  style={{
                    background: colors.white,
                    borderRadius: 14,
                    boxShadow: "0 4px 15px rgba(0,0,0,0.08)"
                  }}
                >
                  {[i + 1, u.shop_name, u.username, "••••••", u.email, u.phone_number,
                    `₹ ${u.amount}`, u.location, u.status, u.no_days,
                    `${u.validity_start || "-"} – ${u.validity_end || "-"}`]
                    .map((val, idx) => (
                      <td key={idx}
                        style={{
                          padding: "14px 18px",
                          fontSize: 14,
                          color: "#14532D"
                        }}
                      >
                        {val}
                      </td>
                    ))}
                  <td style={{ padding: "14px 18px" }}>
                    <EditIcon />
                  </td>
                  <td
                    onClick={() => deleteAdmin(u.id)}
                    style={{ padding: "14px 18px", cursor: "pointer", color: "#DC2626" }}
                  >
                    <TrashIcon />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ADD USER MODAL */}
      {showAddForm && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: colors.white,
            padding: 30,
            borderRadius: 18,
            width: "90%",
            maxWidth: 500,
            maxHeight: "90vh",
            overflowY: "auto",
            border: `3px solid ${colors.border}`,
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
          }}>
            <h2 style={{
              color: colors.primary,
              textAlign: "center",
              marginBottom: 25,
              fontWeight: 800,
              fontSize: 22
            }}>
              ➕ Add New User
            </h2>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 16
            }}>
              <div>
                <label style={{
                  display: "block",
                  marginBottom: 6,
                  color: colors.dark,
                  fontWeight: 700,
                  fontSize: 13
                }}>
                  Customer Name
                </label>
                <input
                  type="text"
                  name="customer_name"
                  value={newAdmin.customer_name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, customer_name: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: `2px solid ${colors.border}`,
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => (e.target.style.borderColor = colors.primary)}
                  onBlur={(e) => (e.target.style.borderColor = colors.border)}
                />
              </div>

              <div>
                <label style={{
                  display: "block",
                  marginBottom: 6,
                  color: colors.dark,
                  fontWeight: 700,
                  fontSize: 13
                }}>
                  Shop Name
                </label>
                <input
                  type="text"
                  name="shop_name"
                  value={newAdmin.shop_name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, shop_name: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: `2px solid ${colors.border}`,
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => (e.target.style.borderColor = colors.primary)}
                  onBlur={(e) => (e.target.style.borderColor = colors.border)}
                />
              </div>

              <div>
                <label style={{
                  display: "block",
                  marginBottom: 6,
                  color: colors.dark,
                  fontWeight: 700,
                  fontSize: 13
                }}>
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={newAdmin.username}
                  onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: `2px solid ${colors.border}`,
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => (e.target.style.borderColor = colors.primary)}
                  onBlur={(e) => (e.target.style.borderColor = colors.border)}
                />
              </div>

              <div>
                <label style={{
                  display: "block",
                  marginBottom: 6,
                  color: colors.dark,
                  fontWeight: 700,
                  fontSize: 13
                }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: `2px solid ${colors.border}`,
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => (e.target.style.borderColor = colors.primary)}
                  onBlur={(e) => (e.target.style.borderColor = colors.border)}
                />
              </div>

              <div>
                <label style={{
                  display: "block",
                  marginBottom: 6,
                  color: colors.dark,
                  fontWeight: 700,
                  fontSize: 13
                }}>
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: `2px solid ${colors.border}`,
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => (e.target.style.borderColor = colors.primary)}
                  onBlur={(e) => (e.target.style.borderColor = colors.border)}
                />
              </div>

              <div>
                <label style={{
                  display: "block",
                  marginBottom: 6,
                  color: colors.dark,
                  fontWeight: 700,
                  fontSize: 13
                }}>
                  Phone Number
                </label>
                <input
                  type="number"
                  name="phone_number"
                  value={newAdmin.phone_number}
                  onChange={(e) => setNewAdmin({ ...newAdmin, phone_number: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: `2px solid ${colors.border}`,
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => (e.target.style.borderColor = colors.primary)}
                  onBlur={(e) => (e.target.style.borderColor = colors.border)}
                />
              </div>

              <div>
                <label style={{
                  display: "block",
                  marginBottom: 6,
                  color: colors.dark,
                  fontWeight: 700,
                  fontSize: 13
                }}>
                  Amount (₹)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={newAdmin.amount}
                  onChange={(e) => setNewAdmin({ ...newAdmin, amount: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: `2px solid ${colors.border}`,
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => (e.target.style.borderColor = colors.primary)}
                  onBlur={(e) => (e.target.style.borderColor = colors.border)}
                />
              </div>

              <div>
                <label style={{
                  display: "block",
                  marginBottom: 6,
                  color: colors.dark,
                  fontWeight: 700,
                  fontSize: 13
                }}>
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={newAdmin.location}
                  onChange={(e) => setNewAdmin({ ...newAdmin, location: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: `2px solid ${colors.border}`,
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => (e.target.style.borderColor = colors.primary)}
                  onBlur={(e) => (e.target.style.borderColor = colors.border)}
                />
              </div>

              <div>
                <label style={{
                  display: "block",
                  marginBottom: 6,
                  color: colors.dark,
                  fontWeight: 700,
                  fontSize: 13
                }}>
                  Status
                </label>
                <select
                  name="status"
                  value={newAdmin.status}
                  onChange={(e) => setNewAdmin({ ...newAdmin, status: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: `2px solid ${colors.border}`,
                    fontSize: 14,
                    outline: "none",
                    cursor: "pointer",
                    boxSizing: "border-box"
                  }}
                >
                  <option value="Active">Active</option>
                  <option value="Disable">Disable</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: "block",
                  marginBottom: 6,
                  color: colors.dark,
                  fontWeight: 700,
                  fontSize: 13
                }}>
                  No. of Days
                </label>
                <input
                  type="number"
                  name="no_days"
                  value={newAdmin.no_days}
                  onChange={(e) => setNewAdmin({ ...newAdmin, no_days: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: `2px solid ${colors.border}`,
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => (e.target.style.borderColor = colors.primary)}
                  onBlur={(e) => (e.target.style.borderColor = colors.border)}
                />
              </div>

              <div>
                <label style={{
                  display: "block",
                  marginBottom: 6,
                  color: colors.dark,
                  fontWeight: 700,
                  fontSize: 13
                }}>
                  Validity Start
                </label>
                <input
                  type="date"
                  name="validity_start"
                  value={newAdmin.validity_start}
                  onChange={(e) => setNewAdmin({ ...newAdmin, validity_start: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: `2px solid ${colors.border}`,
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => (e.target.style.borderColor = colors.primary)}
                  onBlur={(e) => (e.target.style.borderColor = colors.border)}
                />
              </div>

              <div>
                <label style={{
                  display: "block",
                  marginBottom: 6,
                  color: colors.dark,
                  fontWeight: 700,
                  fontSize: 13
                }}>
                  Validity End
                </label>
                <input
                  type="date"
                  name="validity_end"
                  value={newAdmin.validity_end}
                  onChange={(e) => setNewAdmin({ ...newAdmin, validity_end: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: `2px solid ${colors.border}`,
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => (e.target.style.borderColor = colors.primary)}
                  onBlur={(e) => (e.target.style.borderColor = colors.border)}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 25 }}>
              <button onClick={() => setShowAddForm(false)} style={{
                flex: 1,
                padding: "12px 20px",
                borderRadius: 12,
                border: `2px solid ${colors.border}`,
                background: "#f5f5f5",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 14
              }}>
                Cancel
              </button>

              <button onClick={addAdmin} style={{
                flex: 1,
                background: colors.primary,
                color: "#fff",
                padding: "12px 20px",
                borderRadius: 12,
                border: "none",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
              }}>
                ✅ Add User
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;