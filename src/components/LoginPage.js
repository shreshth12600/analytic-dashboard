import { useState } from "react"; 
import {STATIC_USERS} from "../utils/constants";

function LoginPage({ onLogin }) {
  const [user, setUser] = useState("admin");
  const [pass, setPass] = useState("admin123");
  const [show, setShow] = useState(false);
  const [err,  setErr]  = useState("");
  const [busy, setBusy] = useState(false);

  const handleLogin = () => {
    setErr(""); setBusy(true);
    setTimeout(() => {
      const found = STATIC_USERS.find(u => u.username === user && u.password === pass);
      if (found) { onLogin(found); }
      else       { setErr("Invalid username or password."); setBusy(false); }
    }, 600);
  };

  return (
    <div className="login-root">
      {/* Left brand panel */}
      <div className="login-brand">
        <div className="login-brand-blob-tl" />
        <div className="login-brand-blob-br" />
        <div className="login-brand-content">
          <div className="login-brand-logo-row">
            <div className="login-brand-icon">⚡</div>
            <div>
              <div className="login-brand-name">LVMV<span>/VIS</span></div>
              <div className="login-brand-tagline">Monitoring Platform</div>
            </div>
          </div>
          <div className="login-brand-desc">
            Advanced LV/MV grid analytics for distributed electrical monitoring systems.
          </div>
          <div className="login-brand-stats">
            {[["Live","PostgreSQL"],["REST","FastAPI"],["5","Modules"]].map(([v,l]) => (
              <div className="login-brand-stat" key={l}>
                <div className="login-brand-stat-val">{v}</div>
                <div className="login-brand-stat-lbl">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="login-form-panel">
        <div className="login-form-topbar">
          <span className="login-form-deco">🕊🕊</span>
        </div>
        <div className="login-form-body">
          <div className="login-form-heading">
            <div className="login-form-title">Welcome back</div>
            <div className="login-form-subtitle">Sign in to access the monitoring dashboard</div>
          </div>

          {err && <div className="login-alert">{err}</div>}

          <div className="login-field">
            <label className="login-label">Username</label>
            <input
              className="login-input"
              value={user}
              onChange={e => setUser(e.target.value)}
            />
          </div>

          <div className="login-field">
            <label className="login-label">Password</label>
            <div className="login-password-wrap">
              <input
                type={show ? "text" : "password"}
                className="login-password-input"
                value={pass}
                onChange={e => setPass(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
              />
              <button className="login-eye-btn" onClick={() => setShow(!show)}>
                {show ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <div className="login-field">
            <div className="login-hint">
              <strong>Credentials:</strong><br />
              admin / admin123 &nbsp;|&nbsp; operator / operator1
            </div>
          </div>

          <button onClick={handleLogin} disabled={busy} className="login-btn">
            {busy ? "Signing in…" : "Login"}
          </button>
        </div>

        <div className="login-form-footer">
          <span>© 2026 SIHPL</span>
          <span>Version 2.0.0</span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
