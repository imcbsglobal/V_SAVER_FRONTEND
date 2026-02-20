import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../services/config";
import { setAuthToken } from "../services/api";
import "./Login.scss";

function Login({ onAdminLogin = () => {}, onUserLogin = () => {} }) {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const safeParseResponse = async (response) => {
    const contentType = response.headers.get("content-type") || "";
    const text = await response.text();

    if (contentType.includes("application/json")) {
      try {
        return text ? JSON.parse(text) : {};
      } catch (e) {
        return { error: "Invalid JSON response from server.", _raw: text };
      }
    }

    return { error: "Non-JSON response from server.", _raw: text };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter both email and password");
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = isAdmin
        ? `${API_BASE_URL}/admin/login/`
        : `${API_BASE_URL}/user/login/`;

      const payload = {
        email: formData.email,
        password: formData.password,
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await safeParseResponse(response);

      if (response.ok && data.access && data.refresh) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);

        setAuthToken(data.access);

        const userData = {
          ...data.user,
          is_admin: isAdmin,
        };

        localStorage.setItem("user", JSON.stringify(userData));

        if (isAdmin) {
          onAdminLogin(userData);
          navigate("/admin-dashboard");
        } else {
          onUserLogin(userData);
          navigate("/user-dashboard");
        }
        return;
      }

      setError(data?.error || "Login failed. Please check your credentials.");

      if (data?._raw) {
        console.error("Raw server response:", data._raw);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Request failed. Check backend URL/CORS/server logs.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-left">
          <div className="logo-section">
            <div className="logo-circles">
              <div className="circle"></div>
              <div className="circle"></div>
              <div className="circle"></div>
            </div>
            <div className="welcome-text">
              <h2>Welcome Back!</h2>
              <p>Sign in to access your account and continue your journey with us.</p>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-header">
            <h1>Sign In</h1>
            <p>Enter your credentials to continue</p>
          </div>

          <div className="login-type-toggle">
            <button
              type="button"
              className={!isAdmin ? "active" : ""}
              onClick={() => setIsAdmin(false)}
            >
              User Login
            </button>
            <button
              type="button"
              className={isAdmin ? "active" : ""}
              onClick={() => setIsAdmin(true)}
            >
              Admin Login
            </button>
          </div>

          {error && (
            <div
              className="error-message"
              style={{
                background: "#fee",
                color: "#c33",
                padding: "12px",
                borderRadius: "20px",
                marginBottom: "20px",
                fontSize: "14px",
                border: "1px solid #fcc",
              }}
            >
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                  style={{ paddingRight: "45px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "16px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "18px",
                    padding: "5px",
                  }}
                  disabled={isLoading}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-password">
                Forgot Password?
              </a>
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Get Started"}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Don't have an account? <a href="#">Sign up</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;