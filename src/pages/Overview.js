import {LineChart,Line,BarChart,Bar,PieChart,Pie,Cell,AreaChart,Area,XAxis,YAxis,CartesianGrid,Tooltip,Legend,ResponsiveContainer} from "recharts";
import useApi from "../hooks/useapi";
import Spinner from "../components/spinner";
import ErrorBox from "../components/errorbox";
import Card from "../components/card";
import KpiCard from "../components/KpiCard";
import ExportButton from "../components/exportbutton";
import { StatusBadge, ModuleBadge } from "../components/badges";
import { fmt, fmtDT, procClass } from "../utils/helpers";
import { PIE_COLORS } from "../utils/constants";





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
      {(ke || se) && <ErrorBox msg={ke || se} />}

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
            ? <ErrorBox msg="No trend data returned. Check module_processing_logs table has data." />
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
      <Card title="Recent Processing Logs" action={<ExportButton data={logs || []} filename="overview_logs.csv" />}>
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

export default OverviewPage;