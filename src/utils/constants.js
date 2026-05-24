const COLOR_MAP = {
  primary: "kpi-icon--primary",
  info:    "kpi-icon--info",
  success: "kpi-icon--success",
  warning: "kpi-icon--warning",
  danger:  "kpi-icon--danger",
  accent:  "kpi-icon--accent",
};

const TITLES = {
  overview:     "Overview Dashboard",
  thd:          "THD Analytics",
  powerquality: "Power Quality",
  geospatial:   "Geospatial Trends",
  summary:      "Summary Data",
};

const NAV = [
  { id: "overview",     label: "Overview",      icon: "📊" },
  { id: "thd",          label: "THD",           icon: "⚡" },
  { id: "powerquality", label: "Power Quality", icon: "🔋" },
  { id: "geospatial",   label: "Geospatial",    icon: "🗺"  },
  { id: "summary",      label: "Summary Data",  icon: "📋" },
];

const STATIC_USERS = [
  { username: "admin",    password: "admin123",  role: "admin",  name: "Administrator" },
  { username: "operator", password: "operator1", role: "viewer", name: "Operator"      },
];

const PIE_COLORS = ["#8A0066","#B0007A","#185FA5","#1D9E75","#BA7517","#A32D2D"];

export { COLOR_MAP, TITLES, NAV, STATIC_USERS, PIE_COLORS };