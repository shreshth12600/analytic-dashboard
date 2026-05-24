
function Spinner() {
  return (
    <div className="spinner-wrap">
      <div className="spinner-circle" />
      <span className="spinner-label">Loading from database…</span>
    </div>
  );
}

export default Spinner;