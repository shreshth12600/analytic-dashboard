import { useState } from "react";
import "./styles.css";
import OverviewPage from "./pages/Overview";
import ThdPage from "./pages/THD";
import PowerQualityPage from "./pages/PowerQuality";
import GeospatialPage from "./pages/Geospatial";
import SummaryPage from "./pages/SummaryData";
import LoginPage from "./components/LoginPage";
import Sidebar from "./components/sidebar";
import Topbar from "./components/topbar";

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
