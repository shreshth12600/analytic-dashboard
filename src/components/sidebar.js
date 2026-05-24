import { NAV } from "../utils/constants";
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

export default Sidebar;