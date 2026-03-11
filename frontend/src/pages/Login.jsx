import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../api';
import '../admin.css';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter email and password.'); return; }
    setLoading(true);
    try {
      const data = await loginAdmin(email, password);
      localStorage.setItem('srew_token', data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="loginOverlay" style={{ position: 'fixed', inset: 0, background: 'linear-gradient(135deg,var(--navy) 0%,var(--navy2) 50%,#1a3a5c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">⚡</div>
          <h2>Shree Ram Electric Works</h2>
          <p>Admin Panel — Motor Data System</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="form-field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@shreeram.com"
              autoComplete="username"
            />
          </div>
          <div className="form-field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>
          {error && <div className="login-err" style={{ display: 'block' }}>❌ {error}</div>}
          <button type="submit" className="login-btn" style={{ marginTop: '16px' }} disabled={loading}>
            {loading ? '⏳ Logging in...' : '🔓 Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
