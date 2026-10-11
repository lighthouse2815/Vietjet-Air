import { useEffect, useState } from "react";
import { api, errorMessage } from "../api/client";
export function useApi(path, bookingToken) {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const [retryKey, setRetryKey] = useState(0);
  useEffect(() => {
    if (!path) return;
    const controller = new AbortController();
    const request = { path, bookingToken };
    setState({ ...request, data: null, loading: true, error: "" });
    api
      .get(path, { signal: controller.signal, headers: bookingToken ? {"X-Booking-Token": bookingToken} : undefined })
      .then(({ data }) => setState({ ...request, data, loading: false, error: "" }))
      .catch((error) => {
        if (error.code !== "ERR_CANCELED")
          setState({ ...request, data: null, loading: false, error: errorMessage(error) });
      });
    return () => controller.abort();
  }, [path, retryKey, bookingToken]);
  const result = !path ? { data: [], loading: false, error: "" }
    : state.path === path && state.bookingToken === bookingToken ? state
    : { data: null, loading: true, error: "" };
  return { ...result, retry: () => setRetryKey((k) => k + 1) };
}
