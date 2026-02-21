import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../services/config";
import { setAuthToken } from "../services/api";
import "./Login.scss";

function Login({ onAdminLogin = () => {}, onUserLogin = () => {} }) {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  // Admin state
  const [adminForm, setAdminForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  // User OTP state
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // ─── Helpers ───────────────────────────────────────────────

  const safeParseResponse = async (response) => {
    const contentType = response.headers.get("content-type") || "";
    const text = await response.text();
    if (contentType.includes("application/json")) {
      try {
        return text ? JSON.parse(text) : {};
      } catch {
        return { error: "Invalid JSON response from server.", _raw: text };
      }
    }
    return { error: "Non-JSON response from server.", _raw: text };
  };

  const startResendTimer = () => {
    setOtpTimer(60);
    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const switchTab = (toAdmin) => {
    setIsAdmin(toAdmin);
    setError("");
    setOtpSent(false);
    setPhone("");
    setOtp("");
    setAdminForm({ email: "", password: "" });
  };

  // ─── Admin Login ──────────────────────────────────────────

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!adminForm.email || !adminForm.password) {
      setError("Please enter both email and password.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminForm.email, password: adminForm.password }),
      });

      const data = await safeParseResponse(response);

      if (response.ok && data.access && data.refresh) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        setAuthToken(data.access);
        const userData = { ...data.user, is_admin: true };
        localStorage.setItem("user", JSON.stringify(userData));
        onAdminLogin(userData);
        navigate("/admin-dashboard");
        return;
      }

      setError(data?.error || "Login failed. Please check your credentials.");
      if (data?._raw) console.error("Raw server response:", data._raw);
    } catch (err) {
      console.error("Admin login error:", err);
      setError("Request failed. Check backend URL / CORS / server logs.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── User: Step 1 — Send OTP ─────────────────────────────

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError("");

    if (!phone.trim()) {
      setError("Please enter your mobile number.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/user/send-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone.trim() }),
      });

      const data = await safeParseResponse(response);

      if (response.ok) {
        setOtpSent(true);
        setOtp("");
        startResendTimer();
        // DEV ONLY — remove in production
        if (data.otp) console.log("DEV OTP:", data.otp);
      } else {
        const msg =
          data?.phone_number?.[0] || data?.error || "Failed to send OTP. Please try again.";
        setError(msg);
      }
    } catch (err) {
      console.error("Send OTP error:", err);
      setError("Request failed. Check backend URL / CORS / server logs.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── User: Step 2 — Verify OTP ───────────────────────────

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp.trim() || otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/user/verify-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone.trim(), otp: otp.trim() }),
      });

      const data = await safeParseResponse(response);

      if (response.ok && data.access && data.refresh) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        setAuthToken(data.access);
        const userData = { ...data.user, is_admin: false };
        localStorage.setItem("user", JSON.stringify(userData));
        onUserLogin(userData);
        navigate("/user-dashboard");
        return;
      }

      const msg =
        data?.error || data?.non_field_errors?.[0] || "OTP verification failed. Please try again.";
      setError(msg);
    } catch (err) {
      console.error("Verify OTP error:", err);
      setError("Request failed. Check backend URL / CORS / server logs.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────

  return (
    <div className="login-container">
      <div className="login-card">

        {/* Left panel */}
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

        {/* Right panel */}
        <div className="login-right">
          <div className="login-header">
            <h1>Sign In</h1>
            <p>Enter your credentials to continue</p>
          </div>

          {/* Tab toggle */}
          <div className="login-type-toggle">
            <button
              type="button"
              className={!isAdmin ? "active" : ""}
              onClick={() => switchTab(false)}
            >
              User Login
            </button>
            <button
              type="button"
              className={isAdmin ? "active" : ""}
              onClick={() => switchTab(true)}
            >
              Admin Login
            </button>
          </div>

          {/* Error */}
          {error && <div className="error-message">{error}</div>}

          {/* ── ADMIN: email + password ── */}
          {isAdmin && (
            <form className="login-form" onSubmit={handleAdminSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    type="email"
                    id="email"
                    value={adminForm.email}
                    onChange={(e) => setAdminForm((p) => ({ ...p, email: e.target.value }))}
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
                    value={adminForm.password}
                    onChange={(e) => setAdminForm((p) => ({ ...p, password: e.target.value }))}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                    style={{ paddingRight: "45px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
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
                <a href="#" className="forgot-password">Forgot Password?</a>
              </div>

              <button type="submit" className="login-btn" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Get Started"}
              </button>
            </form>
          )}

          {/* ── USER: phone + OTP ── */}
          {!isAdmin && (
            <form
              className="login-form"
              onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
            >
              {/* Step 1: Phone number */}
              <div className="form-group">
                <label htmlFor="phone">Mobile Number</label>
                <div className="input-wrapper">
                  <span className="input-icon">📱</span>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); if (error) setError(""); }}
                    placeholder="Enter your mobile number"
                    required
                    disabled={isLoading || otpSent}
                  />
                  {otpSent && (
                    <button
                      type="button"
                      className="change-phone-btn"
                      onClick={() => { setOtpSent(false); setOtp(""); setError(""); }}
                    >
                      Change
                    </button>
                  )}
                </div>
              </div>

              {/* Step 2: OTP input (shown after send) */}
              {otpSent && (
                <div className="form-group">
                  <label htmlFor="otp">Enter OTP</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🔑</span>
                    <input
                      type="text"
                      id="otp"
                      value={otp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setOtp(val);
                        if (error) setError("");
                      }}
                      placeholder="6-digit OTP"
                      maxLength={6}
                      inputMode="numeric"
                      required
                      disabled={isLoading}
                      className="otp-input"
                    />
                  </div>
                  <div className="otp-hint">
                    {otpTimer > 0 ? (
                      <span>Resend OTP in <strong>{otpTimer}s</strong></span>
                    ) : (
                      <button
                        type="button"
                        className="resend-btn"
                        onClick={handleSendOtp}
                        disabled={isLoading}
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>
              )}

              <button type="submit" className="login-btn" disabled={isLoading}>
                {isLoading
                  ? otpSent ? "Verifying..." : "Sending OTP..."
                  : otpSent ? "Verify & Sign In" : "Send OTP"}
              </button>
            </form>
          )}

          <div className="login-footer">
            <p>Don't have an account? <a href="#">Sign up</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;