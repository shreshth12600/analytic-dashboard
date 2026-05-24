import {COLOR_MAP} from "../utils/constants";

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

export default KpiCard;