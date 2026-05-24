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


function ThdPage() {
  const { data: stats,  loading: sl, error: se } = useApi("/api/thd/stats");
  const { data: trends, loading: tl }            = useApi("/api/thd/trends?days=30");
  const { data: hourly, loading: hl }            = useApi("/api/thd/hourly");
  const { data: byLoc,  loading: bl }            = useApi("/api/thd/by-location");
  const { data: logs,   loading: ll }            = useApi("/api/thd/logs?limit=10");

  return (
    <div className="page-root">
      {se && <ErrorBox msg={se} />}
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

      <Card title="THD Log Records" action={<ExportButton data={logs || []} filename="thd_logs.csv" />}>
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

export default ThdPage;