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
      {se && <ErrorBox msg={se} />}
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

      <Card title="Geospatial Log Records" action={<ExportButton data={logs || []} filename="geo_logs.csv" />}>
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

export default GeospatialPage;
