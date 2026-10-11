import { useEffect, useState } from "react";
import { api, errorMessage } from "../api/client";
export function useApi(path) {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const [retryKey, setRetryKey] = useState(0);
  useEffect(() => {
    if (!path) { setState({ data: [], loading: false, error: "" }); return; }
    const controller = new AbortController();
    setState({ data: null, loading: true, error: "" });
    api
      .get(path, { signal: controller.signal })
      .then(({ data }) => setState({ data, loading: false, error: "" }))
      .catch((error) => {
        if (error.code !== "ERR_CANCELED")
          setState({ data: null, loading: false, error: errorMessage(error) });
      });
    return () => controller.abort();
  }, [path, retryKey]);
  return { ...state, retry: () => setRetryKey((k) => k + 1) };
}
