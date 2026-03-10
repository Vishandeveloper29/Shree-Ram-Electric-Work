import React from 'react'

function Login() {
  return (
   <div id="loginOverlay">
        <div className="login-card">
            <div className="login-logo">
                <div className="logo-icon">⚡</div>
                <h2>Shree Ram Electric Works</h2>
                <p>Admin Panel — Motor Data System</p>
            </div>
            <div className="form-field">
                <label>Username</label>
                <input type="text" id="loginUser" placeholder="Shree Ram Electric Works" autocomplete="username" />
            </div>
            <div className="form-field">
                <label>Password</label>
                <input type="password" id="loginPass" placeholder="Enter password" autocomplete="current-password" />
            </div>
            <button className="login-btn" onClick="doLogin()">🔓 Login</button>
            <div className="login-err" id="loginErr">❌ Invalid username or password</div>
        </div>
    </div>
  )
}

export default Login