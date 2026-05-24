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
      {se && <ErrorBox msg={se} />}
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

      <Card title="Aggregated Module Statistics (live)" action={<ExportButton data={stats || []} filename="summary.csv" />}>
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

      <Card title="Cross-Table Source Comparison" action={<ExportButton data={compare || []} filename="comparison.csv" />}>
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

export default SummaryPage;