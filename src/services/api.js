import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://192.168.1.45:8000/api";
 


// ── Authenticated API (for logged-in pages) ───────────────────
const API = axios.create({ baseURL: BASE });

// REQUEST: attach access token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE: auto-refresh on 401
let isRefreshing = false;
let failedQueue  = [];

function processQueue(error, token = null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
}

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers["Authorization"] = `Bearer ${token}`;
          return API(original);
        });
      }

      original._retry = true;
      isRefreshing    = true;
      const refresh   = localStorage.getItem("refresh_token");

      if (!refresh) {
        logout();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE}/token/refresh/`, { refresh });

        localStorage.setItem("access_token", data.access);
        if (data.refresh) localStorage.setItem("refresh_token", data.refresh);

        API.defaults.headers.common["Authorization"] = `Bearer ${data.access}`;
        processQueue(null, data.access);

        original.headers["Authorization"] = `Bearer ${data.access}`;
        return API(original);
      } catch (err) {
        processQueue(err, null);
        logout();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ── Public API (for QR scan pages — NO token, NO redirect) ────
// Use this in BranchOffersPage and any other public/unauthenticated page.
// Never use the main API instance there — it will redirect customers to login.
export const PUBLIC_API = axios.create({ baseURL: BASE });

// ── Logout: clears ALL keys consistently ──────────────────────
export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  localStorage.removeItem("user_data");
  delete API.defaults.headers.common["Authorization"];
  window.location.href = "/";
}

export function setAuthToken(token) {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
}

export default API;