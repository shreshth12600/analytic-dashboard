function StatusBadge({ status }) {
  const cls = status === "warn" ? "badge-status--warn"
            : status === "err"  ? "badge-status--err"
            : "badge-status--ok";
  const lbl = status === "warn" ? "WARN" : status === "err" ? "ERR" : "OK";
  return <span className={`badge-status ${cls}`}>{lbl}</span>;
}


function ModuleBadge({ name }) {
  const cls = name === "THD"           ? "badge-module--thd"
            : name === "Power Quality" ? "badge-module--pq"
            : name === "Geospatial"    ? "badge-module--geo"
            : name === "Overview"      ? "badge-module--overview"
            : "badge-module--default";
  return <span className={`badge-module ${cls}`}>{name}</span>;
}

export { StatusBadge, ModuleBadge };