import { t } from "../i18n.js";
import { useTranslation } from "react-i18next";
import { createContext, useContext, useState, useEffect } from "react";
const BookingContext = createContext(null);
const empty = {
  search: null,
  segments: [],
  passengers: [],
  contactEmail: "",
  contactPhone: "",
  promotionCode: "",
  extras: {},
  seats: {},
  booking: null,
};
export function BookingProvider({ children }) {
  useTranslation();
  const [draft, setDraft] = useState(() => {
    try {
      return {
        ...empty,
        ...JSON.parse(sessionStorage.getItem("booking-draft") || "{}"),
      };
    } catch {
      return empty;
    }
  });
  useEffect(() => {
    sessionStorage.setItem("booking-draft", JSON.stringify(draft));
  }, [draft]);
  return (
    <BookingContext.Provider
      value={{
        draft,
        update: (patch) => setDraft((current) => ({ ...current, ...patch })),
        reset: () => setDraft(empty),
      }}
    >
      {t(children)}
    </BookingContext.Provider>
  );
}
export const useBooking = () => useContext(BookingContext);
