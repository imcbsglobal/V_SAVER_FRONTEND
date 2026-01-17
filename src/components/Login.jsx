// ✅ STYLE MATCHED LOGIN (Green theme + Glass UI)
// ✅ NO LOGIC CHANGED
import React, { useState } from 'react';

const Login = ({ onAdminLogin = () => {}, onUserLogin = () => {} }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginType, setLoginType] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setDebugInfo(null);

    if (!credentials.email || !credentials.password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    try {
      const endpoint =
        loginType === 'admin'
          ? 'http://127.0.0.1:8000/api/admin/login/'
          : 'http://127.0.0.1:8000/api/user/login/';

      const payload = {
        email: credentials.email,
        password: credentials.password,
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      let data = text ? JSON.parse(text) : {};
      setDebugInfo({ status: response.status, body: data });

      if (response.ok && data.access && data.refresh) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));

        if (loginType === 'admin') onAdminLogin(data.user);
        else onUserLogin(data.user);

        window.location.href = loginType === 'admin' ? '/admin-dashboard' : '/user-dashboard';
        return;
      }

      setError(data.error || 'Login failed');

    } catch (err) {
      setError('Network error. Backend must be running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #e0f2f1, #b2dfdb)',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      padding: 20
    }}>

      {/* ✅ Glass Card */}
      <div style={{
        width: '100%',
        maxWidth: 420,
        padding: 40,
        borderRadius: 20,
        background: 'rgba(255,255,255,0.92)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
        backdropFilter: 'blur(10px)',
      }}>

        <h2 style={{
          textAlign: 'center',
          color: '#00695c',
          fontWeight: 800,
          fontSize: 28,
          marginBottom: 10
        }}>
          OFFER LIVE
        </h2>

        <p style={{
          textAlign: 'center',
          color: '#555',
          fontSize: 14,
          marginBottom: 25
        }}>
          Login to your Offer Live account
        </p>

        {/* ✅ Admin / User Toggle */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          marginBottom: 25,
          background: '#e0f2f1',
          borderRadius: 30,
          overflow: 'hidden'
        }}>
          <button
            type="button"
            onClick={() => setLoginType('admin')}
            style={{
              padding: 12,
              border: 'none',
              fontWeight: 700,
              background: loginType === 'admin' ? '#00897b' : 'transparent',
              color: loginType === 'admin' ? '#fff' : '#00695c',
              cursor: 'pointer'
            }}
          >
            👤 ADMIN
          </button>

          <button
            type="button"
            onClick={() => setLoginType('user')}
            style={{
              padding: 12,
              border: 'none',
              fontWeight: 700,
              background: loginType === 'user' ? '#00897b' : 'transparent',
              color: loginType === 'user' ? '#fff' : '#00695c',
              cursor: 'pointer'
            }}
          >
            🏪 USER
          </button>
        </div>

        {error && (
          <div style={{
            background: '#ffebee',
            color: '#c62828',
            padding: 10,
            borderRadius: 10,
            marginBottom: 15,
            fontSize: 13,
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* ✅ Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <input
            type="email"
            placeholder="Username / Email"
            value={credentials.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            style={inputStyle}
          />
<div style={{ position: 'relative', width: '100%' }}>
  <input
    type={showPassword ? 'text' : 'password'}
    placeholder="Password"
    value={credentials.password}
    onChange={(e) => handleInputChange('password', e.target.value)}
    required
    style={{
      ...inputStyle,
      width: '100%',          // ✅ FORCE SAME WIDTH AS EMAIL
      boxSizing: 'border-box',
      paddingRight: 50        // ✅ SPACE FOR EYE ICON
    }}
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    style={{
      position: 'absolute',
      right: 14,
      top: '50%',
      transform: 'translateY(-50%)',
      border: 'none',
      background: 'none',
      cursor: 'pointer'
    }}
  >
    {showPassword ? '👁️' : '👁️‍🗨️'}
  </button>
</div>


          <button
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: 10,
              padding: 14,
              borderRadius: 12,
              border: 'none',
              fontWeight: 800,
              fontSize: 16,
              color: '#fff',
              background: 'linear-gradient(135deg, #00897b, #00695c)',
              cursor: 'pointer',
              boxShadow: '0 5px 15px rgba(0,137,123,0.4)'
            }}
          >
            {isLoading ? 'Signing In...' : 'LOGIN'}
          </button>
        </form>

        <p style={{
          marginTop: 18,
          textAlign: 'center',
          fontSize: 13,
          color: '#00695c'
        }}>
          Forgot Password? Click Here
        </p>

        {/* ✅ Debug (kept as it is) */}
        {debugInfo && (
          <pre style={{ marginTop: 12, padding: 12, background: '#fafafa', borderRadius: 8, fontSize: 12 }}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        )}

      </div>
    </div>
  );
};

const inputStyle = {
  padding: 14,
  borderRadius: 12,
  border: '2px solid #b2dfdb',
  outline: 'none',
  fontSize: 14
};

const eyeBtn = {
  position: 'absolute',
  right: 12,
  top: '50%',
  transform: 'translateY(-50%)',
  border: 'none',
  background: 'none',
  cursor: 'pointer'
};

export default Login;
