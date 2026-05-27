import {LineChart,Line,BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,Legend,ResponsiveContainer} from "recharts";
import useApi from "../hooks/useapi";
import Spinner from "../components/spinner";
import ErrorBox from "../components/errorbox";
import Card from "../components/card";
import KpiCard from "../components/KpiCard";
import ExportButton from "../components/exportbutton";
import { fmt, fmtDT, procClass } from "../utils/helpers";

function OverviewPage() {
  const { data: kpis, loading: kl, error: ke } =
    useApi("/api/overview/kpis");

  const { data: trends, loading: tl, error: te } =
    useApi("/api/overview/trends");

  const { data: efficiency, loading: el, error: ee } =
    useApi("/api/overview/efficiency");

  const { data: logs, loading: ll, error: le } =
    useApi("/api/overview/logs");

  const lineData = trends || [];
  const barData = efficiency || [];
  const tableLogs = logs || [];

  return (
    <div className="page-root">

      {(ke || te || ee || le) && (
        <ErrorBox msg={ke || te || ee || le} />
      )}

      {/* KPI ROW */}
      <div className="kpi-row">
        {kl ? (
          <Spinner />
        ) : (
          <>
            <KpiCard
              label="Avg Processing"
              value={fmt(kpis?.avg)}
              sub="Average runtime"
              icon="⏱"
              color="info"
            />

            <KpiCard
              label="Min Processing"
              value={fmt(kpis?.min)}
              sub="Fastest batch"
              icon="⬇"
              color="success"
            />

            <KpiCard
              label="Max Processing"
              value={fmt(kpis?.max)}
              sub="Slowest batch"
              icon="⬆"
              color="warning"
            />
          </>
        )}
      </div>

      {/* TWO CHARTS */}
      <div className="grid-2">

        {/* LINE CHART */}
        <Card title="Processing Trend by Batch">
          {tl ? (
            <Spinner />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="batchid"
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="processing_time"
                  name="Processing Time"
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* BAR CHART */}
        <Card title="Runtime Efficiency">
          {el ? (
            <Spinner />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="batchid"
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="efficiency"
                  name="Efficiency"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* LOG TABLE */}
      <Card
        title="Latest 5 Runs"
        action={
          <ExportButton
            data={tableLogs}
            filename="overview_logs.csv"
          />
        }
      >
        {ll ? (
          <Spinner />
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>Processing Days</th>
                  <th>Meters</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Processing Time</th>
                </tr>
              </thead>

              <tbody>
                {tableLogs.map((row) => (
                  <tr key={row.batchid}>
                    <td className="td-muted">
                      {row.batchid}
                    </td>

                    <td>
                      {row.processingdays}
                    </td>

                    <td>
                      {row.meterprocessed}
                    </td>

                    <td className="td-mono-sm">
                      {fmtDT(row.processstartdate)}
                    </td>

                    <td className="td-mono-sm">
                      {fmtDT(row.processenddate)}
                    </td>

                    <td
                      className={procClass(
                        row.processingtime
                      )}
                    >
                      {fmt(row.processingtime)}
                    </td>
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