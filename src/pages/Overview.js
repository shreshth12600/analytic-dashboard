import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import useApi from "../hooks/useapi";
import Spinner from "../components/spinner";
import ErrorBox from "../components/errorbox";
import Card from "../components/card";
import KpiCard from "../components/KpiCard";
import ExportButton from "../components/exportbutton";
import { fmt, fmtDT, procClass } from "../utils/helpers";

function fmtMMSS(seconds) {

  if (!seconds) return "00:00";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function OverviewPage() {
  const { data: kpis, loading: kl, error: ke } =
    useApi("/api/overview/kpis");

  const {data: correlationRuntime,loading: rl
} = useApi("/api/overview/runtime");

  // const { data: breakdown, loading: bl, error: be } =
  //     useApi("/api/overview/runtime-breakdown");

  const { data: stacks, loading: bl, error: be } =
    useApi("/api/overview/feature-stacks");

  const { data: logs, loading: ll, error: le } =
    useApi("/api/overview/logs");


  const dailyStack = stacks?.daily || [];
  const monthlyStack = stacks?.monthly || [];

  const dailyRuntime = correlationRuntime?.daily || [];

const monthlyRuntime = correlationRuntime?.monthly || [];
  // const barData = breakdown || [];
  const tableLogs = logs || [];

  return (
    <div className="page-root">

      {(ke || be || le) && (
  <ErrorBox msg={ke || be || le} />
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

        <Card
  title="Correlation Table"
  action={
    <ExportButton
      data={correlationRuntime || []}
      filename="feature_runtime.csv"
    />
  }
>
  {rl ? (
    <Spinner />
  ) : (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Feature Name</th>
            <th>Processing Time</th>
          </tr>
        </thead>

        <tbody>
          {(correlationRuntime || []).map((row, index) => (
            <tr key={index}>
              <td>{index + 1}</td>

              <td>{row.featurename}</td>

              <td>{row.processingtime}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</Card>

        <Card title="Operation Table">

          {bl ? (
            <Spinner />
          ) : (

            <>
              <div className="stack-legend">

                <div className="legend-item">
                  <div className="legend-color agg-color"></div>
                  Aggregation
                </div>

                <div className="legend-item">
                  <div className="legend-color rpt-color"></div>
                  Report
                </div>

              </div>

              <div className="runtime-grid">

                {/* DAILY */}

                <div className="runtime-column">

                  <h3 className="runtime-title">
                    Daily
                  </h3>

                  {dailyStack.map((row) => {

                    const total =
                      row.aggregation_time +
                      row.report_time;

                    const aggWidth =
                      total > 0
                        ? (row.aggregation_time / total) * 100
                        : 0;

                    const rptWidth =
                      total > 0
                        ? (row.report_time / total) * 100
                        : 0;

                    return (

                      <div
                        key={"d-" + row.feature}
                        className="runtime-row"
                      >

                        <div className="runtime-header">

                          <div className="runtime-feature">
                            {row.feature}
                          </div>

                          <div className="runtime-total">
                            {fmtMMSS(row.total_time)}
                          </div>

                        </div>

                        <div
                          className="runtime-bar"
                          title={
                            `Aggregation: ${fmtMMSS(row.aggregation_time)}
Report: ${fmtMMSS(row.report_time)}`
                          }
                        >

                          {row.aggregation_time > 0 && (
                            <div
                              className="runtime-agg"
                              style={{
                                width: `${aggWidth}%`
                              }}
                            >
                              <span className="runtime-text">
                                {fmtMMSS(row.aggregation_time)}
                              </span>
                            </div>
                          )}

                          {row.report_time > 0 && (
                            <div
                              className="runtime-rpt"
                              style={{
                                width: `${rptWidth}%`
                              }}
                            >
                              <span className="runtime-text">
                                {fmtMMSS(row.report_time)}
                              </span>
                            </div>
                          )}

                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* MONTHLY */}

                <div className="runtime-column">

                  <h3 className="runtime-title">
                    Monthly
                  </h3>

                  {monthlyStack.map((row) => {

                    const total =
                      row.aggregation_time +
                      row.report_time;

                    const aggWidth =
                      total > 0
                        ? (row.aggregation_time / total) * 100
                        : 0;

                    const rptWidth =
                      total > 0
                        ? (row.report_time / total) * 100
                        : 0;

                    return (

                      <div
                        key={"m-" + row.feature}
                        className="runtime-row"
                      >

                        <div className="runtime-header">

                          <div className="runtime-feature">
                            {row.feature}
                          </div>

                          <div className="runtime-total">
                            {fmtMMSS(row.total_time)}
                          </div>

                        </div>

                        <div
                          className="runtime-bar"
                          title={
                            `Aggregation: ${fmtMMSS(row.aggregation_time)}
Report: ${fmtMMSS(row.report_time)}`
                          }
                        >

                          {row.aggregation_time > 0 && (
                            <div
                              className="runtime-agg"
                              style={{
                                width: `${aggWidth}%`
                              }}
                            >
                              <span className="runtime-text">
                                {fmtMMSS(row.aggregation_time)}
                              </span>
                            </div>
                          )}

                          {row.report_time > 0 && (
                            <div
                              className="runtime-rpt"
                              style={{
                                width: `${rptWidth}%`
                              }}
                            >
                              <span className="runtime-text">
                                {fmtMMSS(row.report_time)}
                              </span>
                            </div>
                          )}

                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            </>
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
    <th>Feature</th>
    <th>Stored Procedure</th>
    <th>Total Nodes</th>
    <th>Total Processing Time</th>
  </tr>
</thead>

             <tbody>
  {tableLogs.map((row, index) => (
    <tr key={index}>

      <td className="td-muted">
        {row.batchid}
      </td>

      <td>
        {row.featurename}
      </td>

      <td className="td-mono-sm">
        {row.spname}
      </td>

      <td>
        {row.total_nodes}
      </td>

      <td className="td-success">
        {row.processingtime}
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