import { useState, useEffect, useCallback } from "react";
import { api_base } from "../config/config";

function useApi(path) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(() => {
    if (!path) return;
    setLoading(true);
    setError(null);
    fetch(`${api_base}${path}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
        return r.json();
      })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [path]);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, refetch: load };
}


export default useApi;