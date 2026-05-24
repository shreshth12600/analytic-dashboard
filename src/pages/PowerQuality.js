import {LineChart,Line,BarChart,Bar,PieChart,Pie,Cell,AreaChart,Area,XAxis,YAxis,CartesianGrid,Tooltip,Legend,ResponsiveContainer,Scatter,ScatterChart} from "recharts";
import useApi from "../hooks/useapi";
import Spinner from "../components/spinner";
import ErrorBox from "../components/errorbox";
import Card from "../components/card";
import KpiCard from "../components/KpiCard";
import ExportButton from "../components/exportbutton";
import { StatusBadge, ModuleBadge } from "../components/badges";
import { fmt, fmtDT, procClass } from "../utils/helpers";
import { PIE_COLORS } from "../utils/constants";


function PowerQualityPage() {
  const { data: stats,   loading: sl, error: se } = useApi("/api/powerquality/stats");
  const { data: trends,  loading: tl }            = useApi("/api/powerquality/trends?days=30");
  const { data: dist,    loading: dl }            = useApi("/api/powerquality/distribution");
  const { data: scatter, loading: scl }           = useApi("/api/powerquality/scatter?limit=150");
  const { data: logs,    loading: ll }            = useApi("/api/powerquality/logs?limit=10");

  return (
    <div className="page-root">
      {se && <ErrorBox msg={se} />}
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

      <Card title="Power Quality Log Records" action={<ExportButton data={logs || []} filename="pq_logs.csv" />}>
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

export default PowerQualityPage;