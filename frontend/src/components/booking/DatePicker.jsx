import { t } from "../../i18n.js";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePopup } from "../../hooks/usePopup";
import { api, localDate, dateLabel } from "../../api/client";
function iso(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export default function DatePicker({
  label,
  value,
  onChange,
  min = localDate(),
  disabled,
  origin,
  destination,
}) {
  useTranslation();
  const { ref, open, setOpen } = usePopup();
  const [month, setMonth] = useState(
    () => new Date(`${value || min}T12:00:00`),
  );
  const [prices, setPrices] = useState({});
  useEffect(() => {
    if (!open || !origin || !destination || origin === destination) return;
    const controller = new AbortController();
    Promise.all(
      [0, 1].map((offset) =>
        api.get("/flights/calendar", {
          params: {
            origin,
            destination,
            month: iso(
              new Date(month.getFullYear(), month.getMonth() + offset, 1),
            ),
          },
          signal: controller.signal,
        }),
      ),
    )
      .then((results) =>
        setPrices(
          Object.fromEntries(
            results.flatMap((r) => r.data.map((d) => [d.date, d.price])),
          ),
        ),
      )
      .catch(() => setPrices({}));
    return () => controller.abort();
  }, [open, month, origin, destination]);
  function renderMonth(offset) {
    const date = new Date(month.getFullYear(), month.getMonth() + offset, 1);
    const blank = (date.getDay() + 6) % 7;
    const days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    return (
      <div className={`calendar-month month-${offset}`} key={offset}>
        <h4>{t("Tháng ")}{date.getMonth() + 1} {date.getFullYear()}
        </h4>
        <div className="calendar-grid">
          {[t("Thứ 2"), t("Thứ 3"), t("Thứ 4"), t("Thứ 5"), t("Thứ 6"), t("Thứ 7"), "CN"].map(
            (d) => (
              <small key={d}>{d}</small>
            ),
          )}
          {Array.from({ length: blank }, (_, i) => (
            <span key={`blank${i}`} />
          ))}
          {Array.from({ length: days }, (_, i) => {
            const day = iso(
              new Date(date.getFullYear(), date.getMonth(), i + 1),
            );
            return (
              <button
                type="button"
                key={day}
                disabled={day < min}
                aria-label={`${label} ${day}`}
                aria-pressed={value === day}
                className={`${value === day ? "selected" : ""} ${day === localDate() ? "today" : ""}`}
                onClick={() => {
                  onChange(day);
                  setOpen(false);
                }}
              >
                {i + 1}
                {prices[day] && (
                  <small>{Math.round(prices[day] / 1000)}{t("k")}</small>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
  return (
    <div ref={ref} className="date-picker">
      <button
        type="button"
        disabled={disabled}
        className="date-trigger"
        aria-label={t(label)}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {value ? (
          <>
            <small>{t(label)}</small>
            {dateLabel(`${value}T12:00:00+07:00`)}
          </>
        ) : (
          label
        )}
      </button>
      {open && (
        <div className="popup date-popup">
          <div className="calendar-controls">
            <button
              type="button"
              aria-label={t("Tháng trước")}
              disabled={
                new Date(month.getFullYear(), month.getMonth(), 1) <=
                new Date(`${min.slice(0, 7)}-01T00:00:00`)
              }
              onClick={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
              }
            >
              <ChevronLeft size={18} />
            </button>
            <span>{t("Chọn ")}{label.toLowerCase()}{" "}
              <small>{t("Giá thấp nhất demo, chưa gồm phí")}</small>
            </span>
            <button
              type="button"
              aria-label={t("Tháng sau")}
              onClick={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
              }
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="calendar-months">
            {renderMonth(0)}
            {renderMonth(1)}
          </div>
        </div>
      )}
    </div>
  );
}
