import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API, { setAuthToken } from "../services/api";
import vmartLogo from "../assets/VMART.jpg";
import "./Login.scss";

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconError = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8"  x2="12"    y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
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
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const ErrorBox = ({ msg }) => msg ? (
  <div className="error-box"><IconError />{msg}</div>
) : null;

// ── OTP Step Component ────────────────────────────────────────────────────────
// USER LOGIN — OtpStep component (commented out, used only for customer OTP flow)
// const OtpStep = ({ otp, otpRefs, phone, error, isLoading, resendTimer,
//                    onVerify, onChange, onKeyDown, onPaste, onResend, onBack }) => (
//   <>
//     <button type="button" className="back-btn" onClick={onBack}>
//       <IconBack /> Back
//     </button>
//
//     <h1 className="greeting">Enter OTP</h1>
//     <p className="sub">
//       Sent via SMS to&nbsp;
//       <strong>+91 {phone.replace(/\D/g, "").replace(/(\d{5})(\d{5})/, "$1 $2")}</strong>
//     </p>
//     <ErrorBox msg={error} />
//
//     <form onSubmit={onVerify} noValidate>
//       <div className="otp-row">
//         {otp.map((digit, i) => (
//           <input
//             key={i}
//             ref={el => otpRefs.current[i] = el}
//             type="text"
//             inputMode="numeric"
//             maxLength={1}
//             value={digit}
//             onChange={e => onChange(i, e)}
//             onKeyDown={e => onKeyDown(i, e)}
//             onPaste={i === 0 ? onPaste : undefined}
//             className={`otp-cell ${digit ? "otp-cell--filled" : ""}`}
//             disabled={isLoading}
//             autoFocus={i === 0}
//             autoComplete="one-time-code"
//           />
//         ))}
//       </div>
//
//       <div className="resend-row">
//         {resendTimer > 0
//           ? <span className="resend-timer">Resend in {resendTimer}s</span>
//           : <button type="button" className="resend-btn" onClick={onResend} disabled={isLoading}>Resend OTP</button>
//         }
//       </div>
//
//       <button type="submit" className="login-btn login-btn--teal"
//         disabled={isLoading || otp.join("").length < 6}>
//         {isLoading ? <><span className="spinner" />Verifying…</> : <>Verify & Sign In<IconArrow /></>}
//       </button>
//     </form>
//   </>
// );

// ══════════════════════════════════════════════════════════════════════════════
//  Main Component
// ══════════════════════════════════════════════════════════════════════════════
function Login({ onAdminLogin = () => {}/*, onUserLogin = () => {}*/ }) {
  const navigate = useNavigate();

  const [mode,         setMode]         = useState("admin");
  const [isLoading,    setIsLoading]    = useState(false);
  const [error,        setError]        = useState("");
  const [focusedField, setFocusedField] = useState(null);

  // ── Admin state ──────────────────────────────────────────────────────────
  const [adminForm,    setAdminForm]    = useState({ email: "", password: "", clientId: "" });
  const [showPassword, setShowPassword] = useState(false);

  // ── Customer state (commented out — user login disabled) ─────────────────
  // const [custSubMode, setCustSubMode] = useState("login");
  // const [custStep,    setCustStep]    = useState(1);
  // const [phone,       setPhone]       = useState("");
  // const [email,       setEmail]       = useState("");
  // const [name,        setName]        = useState("");
  // const [otp,         setOtp]         = useState(["", "", "", "", "", ""]);
  // const [resendTimer, setResendTimer] = useState(0);
  // const otpRefs = useRef([]);

  const switchMode = (m) => { setMode(m); setError(""); /*resetCustState();*/ };

  // USER LOGIN — customer sub-mode switcher and state reset (commented out)
  // const switchCustSubMode = (sub) => { setCustSubMode(sub); setError(""); resetCustState(); };
  // const resetCustState = () => {
  //   setCustStep(1); setPhone(""); setEmail(""); setName("");
  //   setOtp(["", "", "", "", "", ""]); setResendTimer(0);
  // };

  // ══ ADMIN SUBMIT ══════════════════════════════════════════════════════════
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!adminForm.email || !adminForm.password) { setError("Please enter both email and password."); return; }
    if (!adminForm.clientId.trim())               { setError("Please enter your Client ID."); return; }
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

  // ══ RESEND TIMER (commented out — used only for user OTP flow) ════════════
  // const startResend = () => {
  //   setResendTimer(30);
  //   const id = setInterval(() => {
  //     setResendTimer(prev => { if (prev <= 1) { clearInterval(id); return 0; } return prev - 1; });
  //   }, 1000);
  // };

  // ══ SEND OTP — LOGIN (commented out — user login disabled) ════════════════
  // const handleLoginSendOtp = async (e) => {
  //   e.preventDefault();
  //   setError("");
  //   const clean = phone.replace(/\D/g, "");
  //   if (clean.length < 10) { setError("Please enter a valid 10-digit mobile number."); return; }
  //   setIsLoading(true);
  //   try {
  //     await API.post("/user/request-otp/", { phone_number: clean });
  //     setCustStep(2);
  //     startResend();
  //   } catch (err) {
  //     const status = err?.response?.status;
  //     const msg    = err?.response?.data?.error || "";
  //     if (status === 404) setError("This number is not registered. Please sign up first.");
  //     else                setError(msg || "Failed to send OTP. Please try again.");
  //   } finally { setIsLoading(false); }
  // };

  // ══ SEND OTP — SIGN UP (commented out — user login disabled) ══════════════
  // const handleSignupSendOtp = async (e) => {
  //   e.preventDefault();
  //   setError("");
  //   const clean = phone.replace(/\D/g, "");
  //   if (!name.trim())        { setError("Please enter your full name."); return; }
  //   if (clean.length < 10)   { setError("Please enter a valid 10-digit mobile number."); return; }
  //   setIsLoading(true);
  //   try {
  //     await API.post("/user/request-otp-signup/", {
  //       phone_number: clean,
  //       name:         name.trim(),
  //     });
  //     setCustStep(2);
  //     startResend();
  //   } catch (err) {
  //     const msg = err?.response?.data?.error || "";
  //     if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("registered customer"))
  //       setError(msg);
  //     else
  //       setError(msg || "Failed to send OTP. Please try again.");
  //   } finally { setIsLoading(false); }
  // };

  // ══ RESEND OTP (commented out — user login disabled) ══════════════════════
  // const handleResend = async () => {
  //   if (resendTimer > 0) return;
  //   setError("");
  //   setOtp(["", "", "", "", "", ""]);
  //   setIsLoading(true);
  //   const endpoint = custSubMode === "login" ? "/user/request-otp/" : "/user/request-otp-signup/";
  //   try {
  //     const payload = { phone_number: phone.replace(/\D/g, "") };
  //     if (custSubMode === "signup") payload.name = name.trim();
  //     await API.post(endpoint, payload);
  //     startResend();
  //   } catch (err) {
  //     setError(err?.response?.data?.error || "Failed to resend OTP.");
  //   } finally { setIsLoading(false); }
  // };

  // ══ VERIFY OTP — LOGIN (commented out — user login disabled) ══════════════
  // const handleLoginVerifyOtp = async (e) => {
  //   e.preventDefault();
  //   setError("");
  //   const otpVal = otp.join("");
  //   if (otpVal.length < 6) { setError("Please enter the complete 6-digit OTP."); return; }
  //   setIsLoading(true);
  //   try {
  //     const { data } = await API.post("/user/verify-otp/", {
  //       phone_number: phone.replace(/\D/g, ""),
  //       otp:          otpVal,
  //     });
  //     if (data.access && data.refresh) {
  //       localStorage.setItem("access_token",  data.access);
  //       localStorage.setItem("refresh_token", data.refresh);
  //       const userData = { ...data.user, is_admin: false };
  //       localStorage.setItem("user", JSON.stringify(userData));
  //       onUserLogin(userData);
  //       navigate("/user-dashboard");
  //     }
  //   } catch (err) {
  //     const msg = err?.response?.data?.error || "";
  //     if (msg.toLowerCase().includes("expired"))      setError("OTP expired. Please request a new one.");
  //     else if (msg.toLowerCase().includes("invalid")) setError("Incorrect OTP. Please try again.");
  //     else                                             setError(msg || "Verification failed. Please try again.");
  //   } finally { setIsLoading(false); }
  // };

  // ══ VERIFY OTP — SIGN UP (commented out — user login disabled) ════════════
  // const handleSignupVerifyOtp = async (e) => {
  //   e.preventDefault();
  //   setError("");
  //   const otpVal = otp.join("");
  //   if (otpVal.length < 6) { setError("Please enter the complete 6-digit OTP."); return; }
  //   setIsLoading(true);
  //   try {
  //     const { data } = await API.post("/user/verify-otp-signup/", {
  //       phone_number: phone.replace(/\D/g, ""),
  //       otp:          otpVal,
  //       name:         name.trim(),
  //       email:        email.trim() || undefined,
  //     });
  //     if (data.access && data.refresh) {
  //       localStorage.setItem("access_token",  data.access);
  //       localStorage.setItem("refresh_token", data.refresh);
  //       const userData = { ...data.user, is_admin: false };
  //       localStorage.setItem("user", JSON.stringify(userData));
  //       onUserLogin(userData);
  //       navigate("/user-dashboard");
  //     }
  //   } catch (err) {
  //     const msg = err?.response?.data?.error || "";
  //     if (msg.toLowerCase().includes("expired"))      setError("OTP expired. Please request a new one.");
  //     else if (msg.toLowerCase().includes("invalid")) setError("Incorrect OTP. Please try again.");
  //     else                                             setError(msg || "Verification failed. Please try again.");
  //   } finally { setIsLoading(false); }
  // };

  // ══ OTP INPUT HANDLERS (commented out — user login disabled) ══════════════
  // const handleOtpChange = (i, e) => {
  //   const val = e.target.value.replace(/\D/g, "");
  //   if (!val) return;
  //   const digit = val.slice(-1);
  //   const next = [...otp];
  //   next[i] = digit;
  //   setOtp(next);
  //   if (i < 5) otpRefs.current[i + 1]?.focus();
  //   if (error) setError("");
  // };

  // const handleOtpKey = (i, e) => {
  //   if (e.key === "Backspace") {
  //     e.preventDefault();
  //     const next = [...otp];
  //     if (otp[i]) {
  //       next[i] = "";
  //       setOtp(next);
  //     } else if (i > 0) {
  //       next[i - 1] = "";
  //       setOtp(next);
  //       otpRefs.current[i - 1]?.focus();
  //     }
  //   }
  // };

  // const handleOtpPaste = (e) => {
  //   e.preventDefault();
  //   const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
  //   const next = ["", "", "", "", "", ""];
  //   pasted.split("").forEach((d, idx) => { next[idx] = d; });
  //   setOtp(next);
  //   otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  // };

  // ── shared OtpStep props (commented out — user login disabled) ────────────
  // const otpStepProps = {
  //   otp, otpRefs, phone, error, isLoading, resendTimer,
  //   onChange:  handleOtpChange,
  //   onKeyDown: handleOtpKey,
  //   onPaste:   handleOtpPaste,
  //   onResend:  handleResend,
  //   onBack:    () => { setCustStep(1); setError(""); setOtp(["","","","","",""]); },
  // };

  // ══════════════════════════════════════════════════════════════════════════
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
      </div>

      {/* ══════ RIGHT ══════ */}
      <div className="login-right">
        <span className="deco-ring deco-ring--1" />
        <span className="deco-ring deco-ring--2" />

        <div className="form-box">

          {/* ── Top-level Tabs (both tabs commented out — showing admin form directly) ── */}
          {/* <div className="mode-tabs">
            <button type="button"
              className={`mode-tab ${mode === "admin" ? "mode-tab--active" : ""}`}
              onClick={() => switchMode("admin")}>
              Admin
            </button>
            <button type="button"
              className={`mode-tab ${mode === "customer" ? "mode-tab--active mode-tab--active-teal" : ""}`}
              onClick={() => switchMode("customer")}>
              Customer
            </button>
          </div> */}

          {/* ════════ ADMIN ════════ */}
          {mode === "admin" && (
            <>
              <div className="badge-row">
                <div className="badge badge--orange">
                  <span className="badge__dot" />Admin Portal
                </div>
              </div>
              <h1 className="greeting">Welcome Back</h1>
              <p className="sub">Sign in to access your dashboard</p>
              <ErrorBox msg={error} />

              <form onSubmit={handleAdminSubmit} noValidate>
                {/* Client ID */}
                <div className={`field ${focusedField === "clientId" ? "field--focused" : ""} ${adminForm.clientId ? "field--filled" : ""}`}>
                  <label htmlFor="adm-client">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2"/><line x1="12" y1="12" x2="12" y2="16"/>
                    </svg>Client ID
                  </label>
                  <input id="adm-client" type="text" value={adminForm.clientId}
                    onChange={(e) => { setAdminForm(p => ({ ...p, clientId: e.target.value })); if (error) setError(""); }}
                    onFocus={() => setFocusedField("clientId")} onBlur={() => setFocusedField(null)}
                    placeholder="e.g. 111" required disabled={isLoading} autoComplete="off" />
                  <span className="field__bar" />
                </div>

                {/* Email */}
                <div className={`field ${focusedField === "email" ? "field--focused" : ""} ${adminForm.email ? "field--filled" : ""}`}>
                  <label htmlFor="adm-email">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>Email Address
                  </label>
                  <input id="adm-email" type="email" value={adminForm.email}
                    onChange={(e) => { setAdminForm(p => ({ ...p, email: e.target.value })); if (error) setError(""); }}
                    onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)}
                    placeholder="admin@example.com" required disabled={isLoading} />
                  <span className="field__bar" />
                </div>

                {/* Password */}
                <div className={`field ${focusedField === "password" ? "field--focused" : ""} ${adminForm.password ? "field--filled" : ""}`}>
                  <label htmlFor="adm-pw">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>Password
                  </label>
                  <div className="pw-wrap">
                    <input id="adm-pw" type={showPassword ? "text" : "password"} value={adminForm.password}
                      onChange={(e) => { setAdminForm(p => ({ ...p, password: e.target.value })); if (error) setError(""); }}
                      onFocus={() => setFocusedField("password")} onBlur={() => setFocusedField(null)}
                      placeholder="••••••••" required disabled={isLoading} />
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

                <label className="remember">
                  <span className="remember__check">
                    <input type="checkbox" /><span className="remember__box" />
                  </span>
                  Keep me signed in
                </label>

                <button type="submit" className="login-btn" disabled={isLoading}>
                  {isLoading ? <><span className="spinner" />Signing in…</> : <>Sign In<IconArrow /></>}
                </button>
              </form>

              <p className="form-footer">🔒 Secure admin access &nbsp;·&nbsp; VMART &copy; {new Date().getFullYear()}</p>
            </>
          )}

          {/* ════════ CUSTOMER (commented out — user login disabled) ════════ */}
          {/* {mode === "customer" && (
            <>
              <div className="badge-row">
                <div className="badge badge--teal">
                  <span className="badge__dot badge__dot--teal" />Customer Portal
                </div>
              </div>

              {custStep === 1 && (
                <div className="mode-tabs mode-tabs--sub">
                  <button type="button"
                    className={`mode-tab mode-tab--sub ${custSubMode === "login" ? "mode-tab--active mode-tab--active-teal" : ""}`}
                    onClick={() => switchCustSubMode("login")}>
                    Login
                  </button>
                  <button type="button"
                    className={`mode-tab mode-tab--sub ${custSubMode === "signup" ? "mode-tab--active mode-tab--active-teal" : ""}`}
                    onClick={() => switchCustSubMode("signup")}>
                    Sign Up
                  </button>
                </div>
              )}

              {custSubMode === "login" && custStep === 1 && (
                <>
                  <h1 className="greeting">Welcome Back</h1>
                  <p className="sub">Enter your registered mobile number</p>
                  <ErrorBox msg={error} />

                  <form onSubmit={handleLoginSendOtp} noValidate>
                    <div className={`field ${focusedField === "lphone" ? "field--focused field--focused-teal" : ""} ${phone ? "field--filled" : ""}`}>
                      <label htmlFor="login-phone">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.6 3.38 2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.73a16 16 0 0 0 6.37 6.37l.9-.9a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>Mobile Number <span className="req-star">*</span>
                      </label>
                      <div className="phone-wrap">
                        <span className="phone-prefix">+91</span>
                        <input id="login-phone" type="tel" value={phone}
                          onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); if (error) setError(""); }}
                          onFocus={() => setFocusedField("lphone")} onBlur={() => setFocusedField(null)}
                          placeholder="10-digit number" required disabled={isLoading}
                          maxLength={10} autoComplete="tel" />
                      </div>
                      <span className="field__bar field__bar--teal" />
                    </div>

                    <button type="submit" className="login-btn login-btn--teal"
                      disabled={isLoading || phone.replace(/\D/g, "").length < 10}>
                      {isLoading ? <><span className="spinner" />Sending OTP…</> : <>Send OTP<IconArrow /></>}
                    </button>
                  </form>

                  <p className="switch-hint">
                    New user?&nbsp;
                    <button type="button" className="link-btn" onClick={() => switchCustSubMode("signup")}>
                      Sign up here
                    </button>
                  </p>
                </>
              )}

              {custSubMode === "login" && custStep === 2 && (
                <OtpStep {...otpStepProps} onVerify={handleLoginVerifyOtp} />
              )}

              {custSubMode === "signup" && custStep === 1 && (
                <>
                  <h1 className="greeting">Create Account</h1>
                  <p className="sub">Sign up with your mobile — OTP via SMS</p>
                  <ErrorBox msg={error} />

                  <form onSubmit={handleSignupSendOtp} noValidate>
                    <div className={`field ${focusedField === "sname" ? "field--focused field--focused-teal" : ""} ${name ? "field--filled" : ""}`}>
                      <label htmlFor="signup-name">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>Full Name <span className="req-star">*</span>
                      </label>
                      <input id="signup-name" type="text" value={name}
                        onChange={(e) => { setName(e.target.value); if (error) setError(""); }}
                        onFocus={() => setFocusedField("sname")} onBlur={() => setFocusedField(null)}
                        placeholder="Your full name" required disabled={isLoading} autoComplete="name" />
                      <span className="field__bar field__bar--teal" />
                    </div>

                    <div className={`field ${focusedField === "sphone" ? "field--focused field--focused-teal" : ""} ${phone ? "field--filled" : ""}`}>
                      <label htmlFor="signup-phone">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.6 3.38 2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.73a16 16 0 0 0 6.37 6.37l.9-.9a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>Mobile Number <span className="req-star">*</span>
                      </label>
                      <div className="phone-wrap">
                        <span className="phone-prefix">+91</span>
                        <input id="signup-phone" type="tel" value={phone}
                          onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); if (error) setError(""); }}
                          onFocus={() => setFocusedField("sphone")} onBlur={() => setFocusedField(null)}
                          placeholder="10-digit number" required disabled={isLoading}
                          maxLength={10} autoComplete="tel" />
                      </div>
                      <span className="field__bar field__bar--teal" />
                    </div>

                    <div className={`field ${focusedField === "semail" ? "field--focused field--focused-teal" : ""} ${email ? "field--filled" : ""}`}>
                      <label htmlFor="signup-email">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                        </svg>Email Address <span className="opt-tag">optional</span>
                      </label>
                      <input id="signup-email" type="email" value={email}
                        onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
                        onFocus={() => setFocusedField("semail")} onBlur={() => setFocusedField(null)}
                        placeholder="you@example.com" disabled={isLoading} autoComplete="email" />
                      <span className="field__bar field__bar--teal" />
                    </div>

                    <button type="submit" className="login-btn login-btn--teal"
                      disabled={isLoading || !name.trim() || phone.replace(/\D/g, "").length < 10}>
                      {isLoading ? <><span className="spinner" />Sending OTP…</> : <>Send OTP<IconArrow /></>}
                    </button>
                  </form>

                  <p className="switch-hint">
                    Already registered?&nbsp;
                    <button type="button" className="link-btn" onClick={() => switchCustSubMode("login")}>
                      Login here
                    </button>
                  </p>
                </>
              )}

              {custSubMode === "signup" && custStep === 2 && (
                <OtpStep {...otpStepProps} onVerify={handleSignupVerifyOtp} />
              )}

              <p className="form-footer">🔒 Secure customer access &nbsp;·&nbsp; VMART &copy; {new Date().getFullYear()}</p>
            </>
          )} */}

        </div>
      </div>
    </div>
  );
}

export default Login;