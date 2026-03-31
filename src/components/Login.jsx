import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API, { setAuthToken } from "../services/api";
import vmartLogo from "../assets/VMART.jpg";
import "./Login.scss";

// ─── Constants ───────────────────────────────────────────────────────────────
const OTP_LENGTH  = 6;
const OTP_SECONDS = 120;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const maskPhone = (num) => {
  const s = num.replace(/\D/g, "");
  if (s.length < 4) return num;
  return s.slice(0, 2) + "•".repeat(Math.max(0, s.length - 4)) + s.slice(-2);
};

const fmtTimer = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconError = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8"  x2="12"    y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const IconSuccess = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const IconArrow = () => (
  <svg className="btn-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

const IconBack = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const WhatsAppIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.374 0 0 5.373 0 12c0 2.108.549 4.089 1.508 5.814L.057 23.887a.75.75 0 0 0 .921.921l6.073-1.451A11.953 11.953 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.6a9.553 9.553 0 0 1-4.859-1.326l-.35-.207-3.602.86.876-3.602-.228-.37A9.555 9.555 0 0 1 2.4 12c0-5.302 4.298-9.6 9.6-9.6 5.302 0 9.6 4.298 9.6 9.6 0 5.302-4.298 9.6-9.6 9.6z"/>
  </svg>
);

// ══════════════════════════════════════════════════════════════════════════════
//  Main Component
// ══════════════════════════════════════════════════════════════════════════════
function Login({ onAdminLogin = () => {}, onUserLogin = () => {} }) {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("customer"); // "admin" | "customer"

  // ── shared ─────────────────────────────────────────────────────────────────
  const [isLoading,  setIsLoading]  = useState(false);
  const [error,      setError]      = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ── admin form ─────────────────────────────────────────────────────────────
  const [adminForm,    setAdminForm]    = useState({ email: "", password: "", clientId: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // ── customer OTP flow ──────────────────────────────────────────────────────
  const [custStep,  setCustStep]  = useState("phone"); // "phone" | "otp"
  const [phone,     setPhone]     = useState("");
  const [otp,       setOtp]       = useState(Array(OTP_LENGTH).fill(""));
  const [timer,     setTimer]     = useState(OTP_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef(null);
  const otpRefs  = useRef([]);

  // ── reset state when switching tabs ──────────────────────────────────────
  const switchTab = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setError("");
    setSuccessMsg("");
    setCustStep("phone");
    setPhone("");
    setOtp(Array(OTP_LENGTH).fill(""));
    clearInterval(timerRef.current);
    setCanResend(false);
    setTimer(OTP_SECONDS);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  // ── OTP countdown ────────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    setTimer(OTP_SECONDS);
    setCanResend(false);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); setCanResend(true); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // ── Admin submit ──────────────────────────────────────────────────────────
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!adminForm.email || !adminForm.password) {
      setError("Please enter both email and password.");
      return;
    }
    if (!adminForm.clientId.trim()) {
      setError("Please enter your Client ID.");
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await API.post(`/admin/login/`, {
        email:     adminForm.email,
        password:  adminForm.password,
        client_id: adminForm.clientId.trim(),
      });
      if (data.access && data.refresh) {
        localStorage.setItem("access_token",  data.access);
        localStorage.setItem("refresh_token", data.refresh);
        setAuthToken(data.access);
        const userData = { ...data.user, is_admin: true };
        localStorage.setItem("user", JSON.stringify(userData));
        onAdminLogin(userData);
        navigate("/admin-dashboard");
        return;
      }
      setError(data?.error || "Login failed. Please check your credentials.");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || "Request failed. Check backend URL / CORS / server logs.");
    } finally { setIsLoading(false); }
  };

  // ── Customer: send OTP ─────────────────────────────────────────────────────
  // Backend: POST /api/user/request-otp/  { phone_number }
  const handleSendOtp = async (e) => {
    e.preventDefault();
    const raw = phone.replace(/\D/g, "");
    if (!raw || raw.length < 7) { setError("Please enter a valid phone number."); return; }
    setIsLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      await API.post(`/user/request-otp/`, { phone_number: raw });
      setSuccessMsg("OTP sent to your WhatsApp!");
      setCustStep("otp");
      startTimer();
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err?.response?.data?.error || "Phone number not found. Please try again.");
    } finally { setIsLoading(false); }
  };

  // ── Customer: verify OTP ───────────────────────────────────────────────────
  // Backend: POST /api/user/verify-otp/  { phone_number, otp }
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setError(`Please enter the complete ${OTP_LENGTH}-digit OTP.`);
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const raw = phone.replace(/\D/g, "");
      const { data } = await API.post(`/user/verify-otp/`, { phone_number: raw, otp: code });
      if (data.access && data.refresh) {
        clearInterval(timerRef.current);
        localStorage.setItem("access_token",  data.access);
        localStorage.setItem("refresh_token", data.refresh);
        setAuthToken(data.access);
        const userData = { ...data.user, is_admin: false };
        localStorage.setItem("user", JSON.stringify(userData));
        onUserLogin(userData);
        navigate("/dashboard");
        return;
      }
      setError(data?.error || "Invalid OTP. Please try again.");
      setOtp(Array(OTP_LENGTH).fill(""));
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch (err) {
      setError(err?.response?.data?.error || "Invalid OTP. Please try again.");
      setOtp(Array(OTP_LENGTH).fill(""));
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } finally { setIsLoading(false); }
  };

  // ── Customer: resend OTP ───────────────────────────────────────────────────
  const handleResend = async () => {
    if (!canResend) return;
    setError(""); setSuccessMsg("");
    setOtp(Array(OTP_LENGTH).fill(""));
    setIsLoading(true);
    try {
      const raw = phone.replace(/\D/g, "");
      await API.post(`/user/request-otp/`, { phone_number: raw });
      setSuccessMsg("A new OTP has been sent to your WhatsApp!");
      startTimer();
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to resend OTP.");
    } finally { setIsLoading(false); }
  };

  // ── OTP input handlers ────────────────────────────────────────────────────
  const handleOtpChange = (idx, val) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next  = [...otp]; next[idx] = digit; setOtp(next);
    if (error) setError("");
    if (digit && idx < OTP_LENGTH - 1) otpRefs.current[idx + 1]?.focus();
    if (next.every(d => d)) setTimeout(() => handleVerifyOtp(), 80);
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === "Backspace") {
      if (otp[idx]) { const n = [...otp]; n[idx] = ""; setOtp(n); }
      else if (idx > 0) otpRefs.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowLeft"  && idx > 0)              otpRefs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < OTP_LENGTH - 1) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    [...pasted].forEach((ch, i) => { if (i < OTP_LENGTH) next[i] = ch; });
    setOtp(next);
    if (error) setError("");
    otpRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    if (next.every(d => d)) setTimeout(() => handleVerifyOtp(), 80);
  };

  // ── Error / Success boxes ─────────────────────────────────────────────────
  const ErrorBox = ({ msg }) => msg ? (
    <div className="error-box"><IconError />{msg}</div>
  ) : null;

  const SuccessBox = ({ msg }) => msg ? (
    <div className="success-box"><IconSuccess />{msg}</div>
  ) : null;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="login-page">

      {/* ══════ LEFT ══════ */}
      <div className="login-left">
        <span className="blob blob-top" />
        <span className="blob blob-bottom" />
        <div className="brand-card">
          <img src={vmartLogo} alt="VMART" className="brand-logo" />
        </div>
        <p className="brand-tagline">Your trusted partner in every journey.</p>

        {activeTab === "customer" && (
          <div className="wa-illustration">
            
           
            <div className="wa-dots">
              <span /><span /><span />
            </div>
          </div>
        )}
      </div>

      {/* ══════ RIGHT ══════ */}
      <div className="login-right">
        <span className="deco-ring deco-ring--1" />
        <span className="deco-ring deco-ring--2" />

        <div className="form-box">

          {/* ── Tab switcher ──────────────────────────────────────────── */}
          <div className="tab-switcher">
            <button
              type="button"
              className={`tab-btn ${activeTab === "customer" ? "tab-btn--active" : ""}`}
              onClick={() => switchTab("customer")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Customer
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "admin" ? "tab-btn--active" : ""}`}
              onClick={() => switchTab("admin")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Admin
            </button>
            <span className={`tab-indicator ${activeTab === "admin" ? "tab-indicator--right" : ""}`} />
          </div>

          {/* ════════════════════════════════════════════════════════════ */}
          {/*  CUSTOMER PANEL                                              */}
          {/* ════════════════════════════════════════════════════════════ */}
          {activeTab === "customer" && (
            <>
              {/* ── Step 1: Phone ──────────────────────────────────────── */}
              {custStep === "phone" && (
                <>
                  <div className="step-row">
                    <span className="step-dot step-dot--active" />
                    <span className="step-dot" />
                  </div>

                  <div className="badge-row">
                    <div className="badge badge--green">
                      <span className="badge__dot badge__dot--green" />
                      Customer Login
                    </div>
                  </div>

                  <h1 className="greeting">Hello there 👋</h1>
                  <p  className="sub">Enter your registered phone number to continue</p>

                  <ErrorBox msg={error} />

                  <form onSubmit={handleSendOtp} noValidate>
                    <div className={`field ${focusedField === "phone" ? "field--focused" : ""}`}>
                      <label htmlFor="cust-phone">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.08 4.18 2 2 0 0 1 5.07 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L9.91 9.91a16 16 0 0 0 6.18 6.18l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        Phone Number
                      </label>
                      <div className="phone-wrap">
                        <span className="phone-prefix">+91</span>
                        <input
                          id="cust-phone"
                          type="tel"
                          inputMode="numeric"
                          value={phone}
                          maxLength={10}
                          onChange={(e) => {
                            setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                            if (error) setError("");
                          }}
                          onFocus={() => setFocusedField("phone")}
                          onBlur={() => setFocusedField(null)}
                          placeholder="98765 43210"
                          required
                          disabled={isLoading}
                          autoComplete="tel"
                        />
                      </div>
                      <span className="field__bar" />
                    </div>

                    <button
                      type="submit"
                      className="login-btn login-btn--wa"
                      disabled={isLoading || phone.replace(/\D/g, "").length < 7}
                    >
                      {isLoading
                        ? <><span className="spinner" />Checking number…</>
                        : <><WhatsAppIcon size={17} />Send OTP via WhatsApp</>
                      }
                    </button>
                  </form>

                  <p className="form-footer">
                    🔒 A one-time password will be sent to your WhatsApp &nbsp;·&nbsp; VMART &copy; {new Date().getFullYear()}
                  </p>
                </>
              )}

              {/* ── Step 2: OTP ────────────────────────────────────────── */}
              {custStep === "otp" && (
                <>
                  <div className="step-row">
                    <span className="step-dot step-dot--done" />
                    <span className="step-dot step-dot--active" />
                  </div>

                  <button
                    type="button"
                    className="back-btn"
                    onClick={() => {
                      clearInterval(timerRef.current);
                      setCustStep("phone");
                      setOtp(Array(OTP_LENGTH).fill(""));
                      setError(""); setSuccessMsg("");
                    }}
                  >
                    <IconBack /> Back
                  </button>

                  <h1 className="greeting">Check WhatsApp</h1>
                  <p  className="sub">Enter the 6-digit code we sent you</p>

                  <div className="masked-chip">
                    <WhatsAppIcon size={14} />
                    +91 {maskPhone(phone)}
                  </div>

                  <ErrorBox msg={error} />
                  {!error && <SuccessBox msg={successMsg} />}

                  <form onSubmit={handleVerifyOtp} noValidate>
                    <div style={{ marginBottom: 4 }}>
                      <label className="otp-label">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                          <rect x="3" y="11" width="18" height="11" rx="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        One-Time Password
                      </label>

                      <div className="otp-grid">
                        {otp.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={(el) => (otpRefs.current[idx] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            className={digit ? "otp-filled" : ""}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            onPaste={idx === 0 ? handleOtpPaste : undefined}
                            disabled={isLoading}
                            autoComplete="one-time-code"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="otp-meta">
                      <span className="otp-timer">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        {canResend ? "Code expired" : `Expires in ${fmtTimer(timer)}`}
                      </span>
                      <button
                        type="button"
                        className="resend-btn"
                        onClick={handleResend}
                        disabled={!canResend || isLoading}
                      >
                        Resend OTP
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="login-btn"
                      disabled={isLoading || otp.join("").length < OTP_LENGTH}
                    >
                      {isLoading
                        ? <><span className="spinner" />Verifying…</>
                        : <>Verify &amp; Sign In<IconArrow /></>
                      }
                    </button>
                  </form>

                  <p className="form-footer">
                    🔒 OTP valid for {Math.floor(OTP_SECONDS / 60)} minutes &nbsp;·&nbsp; VMART &copy; {new Date().getFullYear()}
                  </p>
                </>
              )}
            </>
          )}

          {/* ════════════════════════════════════════════════════════════ */}
          {/*  ADMIN PANEL                                                 */}
          {/* ════════════════════════════════════════════════════════════ */}
          {activeTab === "admin" && (
            <>
              <div className="badge-row">
                <div className="badge badge--orange">
                  <span className="badge__dot" />
                  Admin Portal
                </div>
              </div>

              <h1 className="greeting">Welcome Back</h1>
              <p  className="sub">Sign in to access your dashboard</p>

              <ErrorBox msg={error} />

              <form onSubmit={handleAdminSubmit} noValidate>

                {/* Client ID */}
                <div className={`field ${focusedField === "clientId" ? "field--focused" : ""} ${adminForm.clientId ? "field--filled" : ""}`}>
                  <label htmlFor="adm-client">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2"/>
                      <path d="M16 7V5a2 2 0 0 0-4 0v2"/>
                      <line x1="12" y1="12" x2="12" y2="16"/>
                    </svg>
                    Client ID
                  </label>
                  <input
                    id="adm-client" type="text"
                    value={adminForm.clientId}
                    onChange={(e) => { setAdminForm(p => ({ ...p, clientId: e.target.value })); if (error) setError(""); }}
                    onFocus={() => setFocusedField("clientId")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="e.g. 111"
                    required disabled={isLoading}
                    autoComplete="off"
                  />
                  <span className="field__bar" />
                </div>

                {/* Email */}
                <div className={`field ${focusedField === "email" ? "field--focused" : ""} ${adminForm.email ? "field--filled" : ""}`}>
                  <label htmlFor="adm-email">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    Email Address
                  </label>
                  <input
                    id="adm-email" type="email"
                    value={adminForm.email}
                    onChange={(e) => { setAdminForm(p => ({ ...p, email: e.target.value })); if (error) setError(""); }}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="admin@example.com"
                    required disabled={isLoading}
                  />
                  <span className="field__bar" />
                </div>

                {/* Password */}
                <div className={`field ${focusedField === "password" ? "field--focused" : ""} ${adminForm.password ? "field--filled" : ""}`}>
                  <label htmlFor="adm-pw">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    Password
                  </label>
                  <div className="pw-wrap">
                    <input
                      id="adm-pw" type={showPassword ? "text" : "password"}
                      value={adminForm.password}
                      onChange={(e) => { setAdminForm(p => ({ ...p, password: e.target.value })); if (error) setError(""); }}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="••••••••"
                      required disabled={isLoading}
                    />
                    <button type="button" className="eye-btn" tabIndex={-1}
                      onClick={() => setShowPassword(v => !v)} disabled={isLoading}>
                      {showPassword
                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                  <span className="field__bar" />
                </div>

                {/* Remember */}
                <label className="remember">
                  <span className="remember__check">
                    <input type="checkbox" />
                    <span className="remember__box" />
                  </span>
                  Keep me signed in
                </label>

                <button type="submit" className="login-btn" disabled={isLoading}>
                  {isLoading
                    ? <><span className="spinner" />Signing in…</>
                    : <>Sign In<IconArrow /></>
                  }
                </button>
              </form>

              <p className="form-footer">
                🔒 Secure admin access &nbsp;·&nbsp; VMART &copy; {new Date().getFullYear()}
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default Login;