const fmt   = (v, d = 1) => (v == null ? "—" : Number(v).toFixed(d));
const fmtDT = s => (s ? s.replace("T", " ").slice(0, 19) : "—");

// Determine processing-time colour class
function procClass(ms) {
  if (ms > 300) return "td-proc-err";
  if (ms > 100) return "td-proc-warn";
  return "td-proc-ok";
}

export {fmt, fmtDT, procClass}
