import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

        .srew-login-wrap {
          position: fixed; inset: 0; display: flex; align-items: center; justify-content: center;
          padding: 16px; z-index: 9999;
          background: #0a1628;
          background-image:
            radial-gradient(ellipse at 20% 65%, rgba(249,115,22,.14) 0%, transparent 52%),
            radial-gradient(ellipse at 82% 18%, rgba(56,189,248,.07) 0%, transparent 46%);
          font-family: 'DM Sans', -apple-system, sans-serif;
        }
        .srew-login-card {
          background: #fff; border-radius: 20px; padding: 40px 36px 34px;
          width: 100%; max-width: 400px;
          box-shadow: 0 32px 80px rgba(0,0,0,.45);
          animation: lgCardIn .3s ease;
        }
        @keyframes lgCardIn {
          from { opacity: 0; transform: translateY(-24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .srew-login-top { text-align: center; margin-bottom: 32px; }
        .srew-login-icon {
          width: 62px; height: 62px; border-radius: 18px; margin: 0 auto 16px;
          background: linear-gradient(135deg, #f97316, #ea6003);
          display: flex; align-items: center; justify-content: center; font-size: 1.9rem;
          box-shadow: 0 8px 24px rgba(249,115,22,.38);
        }
        .srew-login-top h2 {
          font-family: 'Sora', sans-serif; font-size: 1.25rem; font-weight: 800;
          color: #0a1628; margin-bottom: 5px; letter-spacing: -.3px;
        }
        .srew-login-top p { font-size: .82rem; color: #64748b; }
        .srew-login-field { margin-bottom: 14px; }
        .srew-login-field label {
          display: block; font-size: .67rem; font-weight: 700; color: #64748b;
          text-transform: uppercase; letter-spacing: .7px; margin-bottom: 6px;
        }
        .srew-login-field input {
          width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0;
          border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: .9rem;
          outline: none; color: #0f172a; background: #fff; transition: all .18s; box-sizing: border-box;
        }
        .srew-login-field input:focus {
          border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,.1);
        }
        .srew-login-err {
          background: #fee2e2; color: #b91c1c; border-radius: 9px; padding: 10px 14px;
          font-size: .83rem; font-weight: 600; margin-bottom: 14px;
          display: flex; align-items: center; gap: 8px;
        }
        .srew-login-btn {
          width: 100%; padding: 13px; border: none; border-radius: 11px; cursor: pointer;
          background: linear-gradient(135deg, #f97316, #ea6003); color: #fff;
          font-family: 'Sora', sans-serif; font-size: .95rem; font-weight: 700;
          letter-spacing: .2px; transition: all .2s; margin-top: 6px;
          box-shadow: 0 4px 16px rgba(249,115,22,.3);
        }
        .srew-login-btn:hover:not(:disabled) {
          opacity: .9; transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(249,115,22,.4);
        }
        .srew-login-btn:disabled { opacity: .6; cursor: not-allowed; }
        .srew-login-divider {
          text-align: center; margin: 20px 0 0;
        }
        .srew-login-back {
          display: inline-flex; align-items: center; gap: 5px;
          color: #64748b; font-size: .8rem; text-decoration: none; transition: all .18s;
        }
        .srew-login-back:hover { color: #f97316; }
      `}</style>

      <div className="srew-login-wrap">
        <div className="srew-login-card">
          <div className="srew-login-top">
            <div className="srew-login-icon">⚡</div>
            <h2>Shree Ram Electric Works</h2>
            <p>Admin Panel — Motor Data System</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="srew-login-field">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@shreeram.com"
                autoComplete="username"
              />
            </div>
            <div className="srew-login-field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>
            {error && <div className="srew-login-err">❌ {error}</div>}
            <button type="submit" className="srew-login-btn" disabled={loading}>
              {loading ? '⏳ Logging in…' : '🔓 Login to Admin Panel'}
            </button>
          </form>

          <div className="srew-login-divider">
            <a href="/" className="srew-login-back">← Back to Motor Catalogue</a>
          </div>
        </div>
      </div>
    </>
  );
}
