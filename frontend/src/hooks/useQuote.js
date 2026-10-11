import { useState, useEffect } from "react";
import { api, errorMessage } from "../api/client";
import { bookingPayload } from "../utils/booking";
export function useQuote(draft) {
  const [state, setState] = useState({ price: null, loading: true, error: "" });
  const payload = JSON.stringify(bookingPayload(draft));
  useEffect(() => {
    const controller = new AbortController();
    setState({ price: null, loading: true, error: "" });
    const timer = setTimeout(
      () =>
        api
          .post("/bookings/quote", JSON.parse(payload), {
            signal: controller.signal,
          })
          .then((r) => setState({ price: r.data, loading: false, error: "" }))
          .catch((e) => {
            if (e.code !== "ERR_CANCELED")
              setState({ price: null, loading: false, error: errorMessage(e) });
          }),
      250,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [payload]);
  return state;
}
