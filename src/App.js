import { useState, useEffect, useCallback } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import "./styles.css";

// ─── CONFIG ── change this to your backend URL ───────────────────────────────
const API_BASE = "http://localhost:8000";

// ─── STATIC LOGIN (no database needed) ──────────────────────────────────────
const STATIC_USERS = [
  { username: "admin",    password: "admin123",  role: "admin",  name: "Administrator" },
  { username: "operator", password: "operator1", role: "viewer", name: "Operator"      },
];

// ─── PIE COLORS ──────────────────────────────────────────────────────────────
const PIE_COLORS = ["#8A0066","#B0007A","#185FA5","#1D9E75","#BA7517","#A32D2D"];

// ─── API FETCH HOOK ───────────────────────────────────────────────────────────
function useApi(path) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(() => {
    if (!path) return;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}${path}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
        return r.json();
      })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [path]);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, refetch: load };
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt   = (v, d = 1) => (v == null ? "—" : Number(v).toFixed(d));
const fmtDT = s => (s ? s.replace("T", " ").slice(0, 19) : "—");

// Determine processing-time colour class
function procClass(ms) {
  if (ms > 300) return "td-proc-err";
  if (ms > 100) return "td-proc-warn";
  return "td-proc-ok";
}

// ─── SPINNER ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="spinner-wrap">
      <div className="spinner-circle" />
      <span className="spinner-label">Loading from database…</span>
    </div>
  );
}

// ─── ERROR BOX ────────────────────────────────────────────────────────────────
function ErrBox({ msg }) {
  return (
    <div className="err-box">
      <strong>⚠ Failed to load data</strong><br />
      {msg}<br />
      <span className="err-box-sub">Make sure the FastAPI backend is running on {API_BASE}</span>
    </div>
  );
}

// ─── KPI CARD ─────────────────────────────────────────────────────────────────
const COLOR_MAP = {
  primary: "kpi-icon--primary",
  info:    "kpi-icon--info",
  success: "kpi-icon--success",
  warning: "kpi-icon--warning",
  danger:  "kpi-icon--danger",
  accent:  "kpi-icon--accent",
};

// Accept color as a token string ("primary","info","success","warning","danger","accent")
function KpiCard({ label, value, sub, icon, color = "primary" }) {
  const iconCls = COLOR_MAP[color] || "kpi-icon--primary";
  return (
    <div className="kpi-card">
      <div className={`kpi-icon ${iconCls}`}>{icon}</div>
      <div>
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{value}</div>
        {sub && <div className="kpi-sub">{sub}</div>}
      </div>
    </div>
  );
}

// ─── CARD ─────────────────────────────────────────────────────────────────────
function Card({ title, children, action }) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">{title}</span>
        {action}
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

// ─── STATUS BADGE ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cls = status === "warn" ? "badge-status--warn"
            : status === "err"  ? "badge-status--err"
            : "badge-status--ok";
  const lbl = status === "warn" ? "WARN" : status === "err" ? "ERR" : "OK";
  return <span className={`badge-status ${cls}`}>{lbl}</span>;
}

// ─── MODULE BADGE ─────────────────────────────────────────────────────────────
function ModuleBadge({ name }) {
  const cls = name === "THD"           ? "badge-module--thd"
            : name === "Power Quality" ? "badge-module--pq"
            : name === "Geospatial"    ? "badge-module--geo"
            : name === "Overview"      ? "badge-module--overview"
            : "badge-module--default";
  return <span className={`badge-module ${cls}`}>{name}</span>;
}

// ─── EXPORT BUTTON ────────────────────────────────────────────────────────────
function ExportBtn({ data, filename }) {
  const go = () => {
    if (!data?.length) return alert("No data to export.");
    const keys = Object.keys(data[0]);
    const csv  = [keys.join(","), ...data.map(r => keys.map(k => String(r[k] ?? "")).join(","))].join("\n");
    const a    = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
      download: filename,
    });
    a.click();
  };
  return (
    <button onClick={go} className="btn-export">⬇ Export CSV</button>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
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

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const NAV = [
  { id: "overview",     label: "Overview",      icon: "📊" },
  { id: "thd",          label: "THD",           icon: "⚡" },
  { id: "powerquality", label: "Power Quality", icon: "🔋" },
  { id: "geospatial",   label: "Geospatial",    icon: "🗺"  },
  { id: "summary",      label: "Summary Data",  icon: "📋" },
];

function Sidebar({ active, setActive, collapsed, setCollapsed }) {
  return (
    <div className={`sidebar ${collapsed ? "sidebar--collapsed" : "sidebar--expanded"}`}>
      <div className="sidebar-logo-wrap">
        <div className="sidebar-logo-icon">⚡</div>
        {!collapsed && (
          <div>
            <div className="sidebar-logo-name">LVMV<span>/VIS</span></div>
            <div className="sidebar-logo-sub">MONITORING</div>
          </div>
        )}
      </div>
      <nav className="sidebar-nav">
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`sidebar-nav-btn ${active === item.id ? "sidebar-nav-btn--active" : ""}`}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>
      <button onClick={() => setCollapsed(!collapsed)} className="sidebar-collapse-btn">
        {collapsed ? "→" : "← Collapse"}
      </button>
    </div>
  );
}

// ─── TOPBAR ───────────────────────────────────────────────────────────────────
const TITLES = {
  overview:     "Overview Dashboard",
  thd:          "THD Analytics",
  powerquality: "Power Quality",
  geospatial:   "Geospatial Trends",
  summary:      "Summary Data",
};

function Topbar({ page, user, onLogout }) {
  return (
    <div className="topbar">
      <div>
        <span className="topbar-breadcrumb-prefix">Dashboard / </span>
        <span className="topbar-breadcrumb-page">{TITLES[page]}</span>
      </div>
      <div className="topbar-right">
        <div className="topbar-live-badge">● Live DB</div>
        <span className="topbar-user">👤 {user.name}</span>
        <button onClick={onLogout} className="topbar-logout-btn">Logout</button>
      </div>
    </div>
  );
}

// ─── OVERVIEW PAGE ────────────────────────────────────────────────────────────
function OverviewPage() {
  const { data: kpis,   loading: kl, error: ke } = useApi("/api/overview/kpis");
  const { data: stats,  loading: sl, error: se } = useApi("/api/overview/stats");
  const { data: trends, loading: tl }            = useApi("/api/overview/trends?days=30");
  const { data: hourly, loading: hl }            = useApi("/api/overview/hourly");
  const { data: logs,   loading: ll }            = useApi("/api/overview/logs?limit=10");

  const chartData = (trends || []).reduce((acc, row) => {
    const key = row.module_name.replace(/ /g, "");
    const ex  = acc.find(r => r.date === row.date);
    if (ex) ex[key] = Number(row.avg_time);
    else acc.push({ date: row.date, [key]: Number(row.avg_time) });
    return acc;
  }, []);

  const pieData    = (stats || []).map(m => ({ name: m.module_name, value: Number(m.count) }));
  const hourlyFmt  = (hourly || []).map(h => ({
    hour: `${String(h.hour).padStart(2, "0")}:00`,
    avg: Number(h.avg_time), min: Number(h.min_time), max: Number(h.max_time),
  }));

  return (
    <div className="page-root">
      {(ke || se) && <ErrBox msg={ke || se} />}

      {/* KPIs */}
      <div className="kpi-row">
        {kl ? <Spinner /> : <>
          <KpiCard label="Total Records"   value={Number(kpis?.total_records || 0).toLocaleString()} sub="All modules" icon="📦" color="primary" />
          <KpiCard label="Avg Processing"  value={`${fmt(kpis?.avg_time)}ms`} sub="Global mean" icon="⏱" color="info" />
          <KpiCard label="Fastest Module"  value={kpis?.fastest_module?.module_name || "—"} sub={`${fmt(kpis?.fastest_module?.avg_time)}ms avg`} icon="🚀" color="success" />
          <KpiCard label="Slowest Module"  value={kpis?.slowest_module?.module_name || "—"} sub={`${fmt(kpis?.slowest_module?.avg_time)}ms avg`} icon="🐢" color="warning" />
          <KpiCard label="Errors / Warns"  value={`${kpis?.total_errors || 0} / ${kpis?.total_warnings || 0}`} sub="Status counts" icon="⚠" color="danger" />
        </>}
      </div>

      {/* Trend + Pie */}
      <div className="grid-2-1">
        <Card title="30-Day Processing Trends by Module">
          {tl ? <Spinner /> : chartData.length === 0
            ? <ErrBox msg="No trend data returned. Check module_processing_logs table has data." />
            : (
              <ResponsiveContainer width="100%" height={230}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={Math.floor(chartData.length / 6) || 1} />
                  <YAxis tick={{ fontSize: 10 }} unit="ms" />
                  <Tooltip formatter={v => [`${fmt(v)}ms`, ""]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="THD"          stroke="#8A0066" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="PowerQuality" name="Power Quality" stroke="#185FA5" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="Geospatial"   stroke="#1D9E75"  dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="Overview"     stroke="#BA7517"  dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
        </Card>
        <Card title="Module Distribution">
          {sl ? <Spinner /> : (
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => [`${v} records`, ""]} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Hourly + Bar */}
      <div className="grid-2">
        <Card title="Hourly Processing Pattern">
          {hl ? <Spinner /> : (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={hourlyFmt}>
                <defs>
                  <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#8A0066" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8A0066" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e8f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 9 }} interval={3} />
                <YAxis tick={{ fontSize: 10 }} unit="ms" />
                <Tooltip formatter={v => [`${fmt(v)}ms`, ""]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Area type="monotone" dataKey="avg" stroke="#8A0066" fill="url(#ag)" strokeWidth={2} name="Avg (ms)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>
        <Card title="Min / Avg / Max by Module">
          {sl ? <Spinner /> : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={stats || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e8f0" />
                <XAxis dataKey="module_name" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} unit="ms" />
                <Tooltip formatter={v => [`${fmt(v)}ms`, ""]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="min_time" name="Min" fill="#1D9E75" radius={[3, 3, 0, 0]} />
                <Bar dataKey="avg_time" name="Avg" fill="#8A0066" radius={[3, 3, 0, 0]} />
                <Bar dataKey="max_time" name="Max" fill="#A32D2D" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Logs table */}
      <Card title="Recent Processing Logs" action={<ExportBtn data={logs || []} filename="overview_logs.csv" />}>
        {ll ? <Spinner /> : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  {["#","Module","Start","End","Processing (ms)","Status"].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(logs || []).map((r) => (
                  <tr key={r.id}>
                    <td className="td-muted">{r.id}</td>
                    <td><ModuleBadge name={r.module_name} /></td>
                    <td className="td-mono-sm">{fmtDT(r.startdatetime)}</td>
                    <td className="td-mono-sm">{fmtDT(r.enddatetime)}</td>
                    <td className={procClass(r.processing_time)}>{fmt(r.processing_time)}</td>
                    <td><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── THD PAGE ─────────────────────────────────────────────────────────────────
function ThdPage() {
  const { data: stats,  loading: sl, error: se } = useApi("/api/thd/stats");
  const { data: trends, loading: tl }            = useApi("/api/thd/trends?days=30");
  const { data: hourly, loading: hl }            = useApi("/api/thd/hourly");
  const { data: byLoc,  loading: bl }            = useApi("/api/thd/by-location");
  const { data: logs,   loading: ll }            = useApi("/api/thd/logs?limit=10");

  return (
    <div className="page-root">
      {se && <ErrBox msg={se} />}
      <div className="kpi-row">
        {sl ? <Spinner /> : <>
          <KpiCard label="THD Records"    value={Number(stats?.count || 0).toLocaleString()} sub="Total records" icon="⚡" color="primary" />
          <KpiCard label="Avg Processing" value={`${fmt(stats?.avg_time)}ms`} icon="⏱" color="info" />
          <KpiCard label="Min Processing" value={`${fmt(stats?.min_time)}ms`} sub="Best case" icon="🏃" color="success" />
          <KpiCard label="Max Processing" value={`${fmt(stats?.max_time)}ms`} sub="Worst case" icon="🐌" color="danger" />
          <KpiCard label="Avg THD Value"  value={`${fmt(stats?.avg_thd_value)}%`} icon="📈" color="warning" />
        </>}
      </div>

      <div className="grid-2">
        <Card title="THD Daily Processing Trend">
          {tl ? <Spinner /> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trends || []}>
                <defs>
                  <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#8A0066" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8A0066" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={4} />
                <YAxis tick={{ fontSize: 10 }} unit="ms" />
                <Tooltip formatter={v => [`${fmt(v)}ms`, ""]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Area type="monotone" dataKey="avg_time" stroke="#8A0066" fill="url(#tg)" strokeWidth={2} name="Avg (ms)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>
        <Card title="Hourly Distribution">
          {hl ? <Spinner /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={hourly || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e8f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} unit="ms" />
                <Tooltip formatter={v => [`${fmt(v)}ms`, ""]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="avg_time" fill="#8A0066" radius={[4, 4, 0, 0]} name="Avg (ms)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <Card title="Processing by Location">
        {bl ? <Spinner /> : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byLoc || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e8f0" />
              <XAxis type="number" tick={{ fontSize: 10 }} unit="ms" />
              <YAxis dataKey="location" type="category" tick={{ fontSize: 10 }} width={110} />
              <Tooltip formatter={v => [`${fmt(v)}ms`, ""]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="avg_time" fill="#B0007A" radius={[0, 4, 4, 0]} name="Avg (ms)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card title="THD Log Records" action={<ExportBtn data={logs || []} filename="thd_logs.csv" />}>
        {ll ? <Spinner /> : (
          <div className="table-scroll">
            <table className="data-table data-table--sm">
              <thead>
                <tr>
                  {["#","Start","End","Proc (ms)","THD%","Voltage (kV)","Location","Status"].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(logs || []).map((r) => (
                  <tr key={r.id}>
                    <td className="td-muted">{r.id}</td>
                    <td className="td-mono">{fmtDT(r.startdatetime)}</td>
                    <td className="td-mono">{fmtDT(r.enddatetime)}</td>
                    <td className={procClass(r.processing_time)}>{fmt(r.processing_time)}</td>
                    <td>{fmt(r.thd_value)}</td>
                    <td>{fmt(r.voltage_level)}</td>
                    <td>{r.location || "—"}</td>
                    <td><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── POWER QUALITY PAGE ───────────────────────────────────────────────────────
function PowerQualityPage() {
  const { data: stats,   loading: sl, error: se } = useApi("/api/powerquality/stats");
  const { data: trends,  loading: tl }            = useApi("/api/powerquality/trends?days=30");
  const { data: dist,    loading: dl }            = useApi("/api/powerquality/distribution");
  const { data: scatter, loading: scl }           = useApi("/api/powerquality/scatter?limit=150");
  const { data: logs,    loading: ll }            = useApi("/api/powerquality/logs?limit=10");

  return (
    <div className="page-root">
      {se && <ErrBox msg={se} />}
      <div className="kpi-row">
        {sl ? <Spinner /> : <>
          <KpiCard label="PQ Records"       value={Number(stats?.count || 0).toLocaleString()} icon="🔋" color="info" />
          <KpiCard label="Avg Processing"   value={`${fmt(stats?.avg_time)}ms`} icon="⏱" color="primary" />
          <KpiCard label="Avg Voltage"      value={`${fmt(stats?.avg_voltage)}V`} icon="⚡" color="warning" />
          <KpiCard label="Avg Power Factor" value={fmt(stats?.avg_power_factor, 3)} icon="📊" color="success" />
          <KpiCard label="Avg Frequency"    value={`${fmt(stats?.avg_frequency)}Hz`} icon="〰" color="accent" />
        </>}
      </div>

      <div className="grid-3-2">
        <Card title="Voltage & Processing Time Trends">
          {tl ? <Spinner /> : (
            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={trends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F5" />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={4} />
                <YAxis yAxisId="l" tick={{ fontSize: 10 }} unit="ms" />
                <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10 }} unit="V" />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line yAxisId="l" type="monotone" dataKey="avg_time"    name="Avg Time (ms)"   stroke="#185FA5" strokeWidth={2} dot={false} />
                <Line yAxisId="r" type="monotone" dataKey="avg_voltage" name="Avg Voltage (V)"  stroke="#BA7517" strokeWidth={2} dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
        <Card title="Processing Distribution">
          {dl ? <Spinner /> : (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={dist || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F5" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="range" type="category" tick={{ fontSize: 10 }} width={70} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="count" fill="#185FA5" radius={[0, 4, 4, 0]} name="Count" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <Card title="Scatter — Processing Time vs Power Factor">
        {scl ? <Spinner /> : (
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F5" />
              <XAxis dataKey="x" name="Processing (ms)" tick={{ fontSize: 10 }} unit="ms" />
              <YAxis dataKey="y" name="Power Factor"     tick={{ fontSize: 10 }} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} content={({ active, payload }) => {
                if (active && payload?.length) return (
                  <div className="card" style={{ padding: "8px 12px", fontSize: 11 }}>
                    <div>Processing: <strong>{payload[0]?.value}ms</strong></div>
                    <div>Power Factor: <strong>{payload[1]?.value}</strong></div>
                  </div>
                );
                return null;
              }} />
              <Scatter data={scatter || []} fill="#185FA5" opacity={0.65} />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card title="Power Quality Log Records" action={<ExportBtn data={logs || []} filename="pq_logs.csv" />}>
        {ll ? <Spinner /> : (
          <div className="table-scroll">
            <table className="data-table data-table--sm">
              <thead>
                <tr>
                  {["#","Start","Proc (ms)","Voltage (V)","Current (A)","PF","Freq (Hz)","Act. Power","Status"].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(logs || []).map((r) => (
                  <tr key={r.id}>
                    <td className="td-muted">{r.id}</td>
                    <td className="td-mono">{fmtDT(r.startdatetime)}</td>
                    <td className={procClass(r.processing_time)}>{fmt(r.processing_time)}</td>
                    <td>{fmt(r.voltage)}</td>
                    <td>{fmt(r.current)}</td>
                    <td>{fmt(r.power_factor, 3)}</td>
                    <td>{fmt(r.frequency)}</td>
                    <td>{fmt(r.active_power)}</td>
                    <td><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── GEOSPATIAL PAGE ──────────────────────────────────────────────────────────
function GeospatialPage() {
  const { data: stats,   loading: sl, error: se } = useApi("/api/geospatial/stats");
  const { data: trends,  loading: tl }            = useApi("/api/geospatial/trends?days=30");
  const { data: byArea,  loading: al }            = useApi("/api/geospatial/by-area");
  const { data: heatmap, loading: hl }            = useApi("/api/geospatial/heatmap");
  const { data: logs,    loading: ll }            = useApi("/api/geospatial/logs?limit=10");

  const DAYS    = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const heatVal = (day, h) => Number((heatmap || []).find(c => c.day === day && Number(c.hour) === h)?.value || 0);
  const heatMax = Math.max(...(heatmap || []).map(c => Number(c.value)), 1);

  return (
    <div className="page-root">
      {se && <ErrBox msg={se} />}
      <div className="kpi-row">
        {sl ? <Spinner /> : <>
          <KpiCard label="Geo Records"         value={Number(stats?.count || 0).toLocaleString()} icon="🗺" color="success" />
          <KpiCard label="Avg Processing"      value={`${fmt(stats?.avg_time)}ms`} icon="⏱" color="primary" />
          <KpiCard label="Min Processing"      value={`${fmt(stats?.min_time)}ms`} icon="🏃" color="success" />
          <KpiCard label="Max Processing"      value={`${fmt(stats?.max_time)}ms`} icon="🐌" color="danger" />
          <KpiCard label="Areas / Substations" value={`${stats?.unique_areas || 0} / ${stats?.unique_substations || 0}`} icon="📍" color="info" />
        </>}
      </div>

      <div className="grid-2">
        <Card title="Processing Timeline + 7-Day Moving Avg">
          {tl ? <Spinner /> : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8F5F0" />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={4} />
                <YAxis tick={{ fontSize: 10 }} unit="ms" />
                <Tooltip formatter={v => [`${fmt(v)}ms`, ""]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="avg_time"   name="Daily Avg" stroke="#1D9E75" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="moving_avg" name="7-day MA"  stroke="#8A0066" strokeWidth={2.5} dot={false} strokeDasharray="5 3" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
        <Card title="Avg Processing by Area">
          {al ? <Spinner /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byArea || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8F5F0" />
                <XAxis dataKey="area" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} unit="ms" />
                <Tooltip formatter={v => [`${fmt(v)}ms`, ""]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="avg_time" fill="#1D9E75" radius={[4, 4, 0, 0]} name="Avg (ms)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <Card title="Activity Heatmap — Day × Hour (last 30 days)">
        {hl ? <Spinner /> : (
          <div className="table-scroll">
            <div
              className="heatmap-grid"
              style={{ gridTemplateColumns: `56px repeat(24, 1fr)` }}
            >
              <div className="heatmap-corner" />
              {Array.from({ length: 24 }, (_, h) => (
                <div key={h} className="heatmap-hour-label">{h}</div>
              ))}
              {DAYS.map(day => [
                <div key={day + "l"} className="heatmap-day-label">{day}</div>,
                ...Array.from({ length: 24 }, (_, h) => {
                  const v  = heatVal(day, h);
                  const op = v === 0 ? 0.04 : 0.08 + (v / heatMax) * 0.92;
                  return (
                    <div
                      key={`${day}-${h}`}
                      className="heatmap-cell"
                      style={{ background: `rgba(138,0,102,${op})` }}
                    />
                  );
                }),
              ])}
            </div>
            <div className="heatmap-legend">
              <span>Low</span>
              {[0.08, 0.3, 0.5, 0.7, 0.92].map(o => (
                <div
                  key={o}
                  className="heatmap-legend-swatch"
                  style={{ background: `rgba(138,0,102,${o})` }}
                />
              ))}
              <span>High</span>
            </div>
          </div>
        )}
      </Card>

      <Card title="Geospatial Log Records" action={<ExportBtn data={logs || []} filename="geo_logs.csv" />}>
        {ll ? <Spinner /> : (
          <div className="table-scroll">
            <table className="data-table data-table--sm">
              <thead>
                <tr>
                  {["#","Start","Proc (ms)","Area","Substation","MV Feeder","Lat","Lng","Status"].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(logs || []).map((r) => (
                  <tr key={r.id}>
                    <td className="td-muted">{r.id}</td>
                    <td className="td-mono">{fmtDT(r.startdatetime)}</td>
                    <td className={procClass(r.processing_time)}>{fmt(r.processing_time)}</td>
                    <td>{r.area || "—"}</td>
                    <td>{r.substation || "—"}</td>
                    <td>{r.mv_feeder || "—"}</td>
                    <td className="td-mono">{fmt(r.latitude, 4)}</td>
                    <td className="td-mono">{fmt(r.longitude, 4)}</td>
                    <td><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── SUMMARY PAGE ─────────────────────────────────────────────────────────────
function SummaryPage() {
  const { data: stats,   loading: sl, error: se } = useApi("/api/summary/stats");
  const { data: daily,   loading: dl }            = useApi("/api/summary/daily?days=30");
  const { data: compare, loading: cl }            = useApi("/api/summary/comparison");

  const totalRecords = (stats || []).reduce((s, m) => s + Number(m.count), 0);
  const avgAll = stats?.length
    ? Math.round((stats || []).reduce((s, m) => s + Number(m.avg_time), 0) / stats.length)
    : 0;

  const dailyChart = (daily || []).reduce((acc, row) => {
    const d   = String(row.stat_date || "").slice(0, 10);
    const key = row.module_name.replace(/ /g, "");
    const ex  = acc.find(r => r.date === d);
    if (ex) ex[key] = Number(row.avg_time);
    else acc.push({ date: d, [key]: Number(row.avg_time) });
    return acc;
  }, []).slice(-15);

  return (
    <div className="page-root">
      {se && <ErrBox msg={se} />}
      <div className="kpi-row">
        <KpiCard label="Total Records"  value={totalRecords.toLocaleString()} sub="All modules live" icon="📦" color="primary" />
        <KpiCard label="Global Avg"     value={`${avgAll}ms`} icon="📊" color="info" />
        <KpiCard label="Active Modules" value={(stats || []).length} sub="Tracked modules" icon="🔌" color="success" />
        {(stats || []).length > 0 && (
          <KpiCard
            label="Most Active"
            value={(stats.reduce((a, b) => Number(a.count) > Number(b.count) ? a : b)).module_name}
            sub="By record count" icon="🏆" color="warning"
          />
        )}
      </div>

      <Card title="Aggregated Module Statistics (live)" action={<ExportBtn data={stats || []} filename="summary.csv" />}>
        {sl ? <Spinner /> : (
          <table className="data-table">
            <thead>
              <tr>
                {["Module","Records","Share","Min (ms)","Avg (ms)","Median (ms)","Max (ms)","Errors","Warns","Health"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(stats || []).map((row, i) => {
                const share  = totalRecords ? Math.round(Number(row.count) / totalRecords * 100) : 0;
                const health = Number(row.avg_time) < 200 ? "ok" : Number(row.avg_time) < 400 ? "warn" : "err";
                return (
                  <tr key={row.module_name}>
                    <td><ModuleBadge name={row.module_name} /></td>
                    <td className="td-bold">{Number(row.count).toLocaleString()}</td>
                    <td>
                      <div className="share-cell">
                        <div className="share-track">
                          <div className="share-fill" style={{ width: `${share}%` }} />
                        </div>
                        <span>{share}%</span>
                      </div>
                    </td>
                    <td className="td-success">{fmt(row.min_time)}</td>
                    <td className="td-bold">{fmt(row.avg_time)}</td>
                    <td>{fmt(row.median_time)}</td>
                    <td className="td-danger">{fmt(row.max_time)}</td>
                    <td className="td-danger">{row.error_count}</td>
                    <td className="td-warning">{row.warn_count}</td>
                    <td><StatusBadge status={health} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      <div className="grid-2">
        <Card title="Average Processing — Module Comparison">
          {sl ? <Spinner /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e8f0" />
                <XAxis dataKey="module_name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} unit="ms" />
                <Tooltip formatter={v => [`${fmt(v)}ms`, ""]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="avg_time" name="Avg (ms)" radius={[4, 4, 0, 0]}>
                  {(stats || []).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
        <Card title="Historical Comparison (Last 15 Days)">
          {dl ? <Spinner /> : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dailyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={2} />
                <YAxis tick={{ fontSize: 10 }} unit="ms" />
                <Tooltip formatter={v => [`${fmt(v)}ms`, ""]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line dataKey="THD"          stroke="#8A0066" dot={false} strokeWidth={2} />
                <Line dataKey="PowerQuality" name="Power Quality" stroke="#185FA5" dot={false} strokeWidth={2} />
                <Line dataKey="Geospatial"   stroke="#1D9E75"  dot={false} strokeWidth={2} />
                <Line dataKey="Overview"     stroke="#BA7517"  dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <Card title="Cross-Table Source Comparison" action={<ExportBtn data={compare || []} filename="comparison.csv" />}>
        {cl ? <Spinner /> : (
          <table className="data-table">
            <thead>
              <tr>
                {["Source Table","Module","Count","Avg (ms)","Min (ms)","Max (ms)"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(compare || []).map((r, i) => (
                <tr key={i}>
                  <td className="td-mono-sm td-muted">{r.source}</td>
                  <td><ModuleBadge name={r.module_name} /></td>
                  <td className="td-bold">{Number(r.count).toLocaleString()}</td>
                  <td className="td-bold">{fmt(r.avg_time)}</td>
                  <td className="td-success">{fmt(r.min_time)}</td>
                  <td className="td-danger">{fmt(r.max_time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user,      setUser]      = useState(null);
  const [page,      setPage]      = useState("overview");
  const [collapsed, setCollapsed] = useState(false);

  const pages = {
    overview:     <OverviewPage />,
    thd:          <ThdPage />,
    powerquality: <PowerQualityPage />,
    geospatial:   <GeospatialPage />,
    summary:      <SummaryPage />,
  };

  if (!user) return <LoginPage onLogin={setUser} />;

  return (
    <div className="app-root">
      <Sidebar active={page} setActive={setPage} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="app-main">
        <Topbar page={page} user={user} onLogout={() => setUser(null)} />
        <div className="app-content">
          {pages[page]}
        </div>
      </div>
    </div>
  );
}
