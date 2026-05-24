import { TITLES } from "../utils/constants";
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

export default Topbar;