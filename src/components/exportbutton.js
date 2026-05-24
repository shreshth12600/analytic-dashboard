
function ExportButton({ data, filename }) {
  const go = () => {
    if (!data?.length) return alert("No data to export.");
    const keys = Object.keys(data[0]);
    const csv  = [keys.join(","), ...data.map(r => keys.map(k => String(r[k] ?? "")).join(","))].join("\n");
    const a    = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
      download: filename,
    });
    a.click();
  };
  return (
    <button onClick={go} className="btn-export">⬇ Export CSV</button>
  );
}

export default ExportButton;    

