import { t } from "../i18n.js";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import { useApi } from "../hooks/useApi";
import { useQuote } from "../hooks/useQuote";
import { money } from "../api/client";
import BookingSteps from "../components/booking/BookingSteps";
import SeatMap from "../components/booking/SeatMap";
import PriceSummary from "../components/booking/PriceSummary";
import { LoadingState, ErrorState } from "../components/common/States";
const categories = {
  BAGGAGE: "Hành lý ký gửi",
  MEAL: "Suất ăn",
  PRIORITY: "Ưu tiên làm thủ tục",
  INSURANCE: "Bảo hiểm demo",
};
export default function ExtrasPage() {
  useTranslation();
  const { draft, update } = useBooking();
  const navigate = useNavigate();
  const services = useApi("/ancillary-services");
  const quote = useQuote(draft);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [passengerIndex, setPassengerIndex] = useState(0);
  if (!draft.segments.length || !draft.passengers.length)
    return <Navigate to="/booking/passengers" replace />;
  const segment = draft.segments[segmentIndex];
  const flightId = segment.flight.id;
  const eligible = draft.passengers
    .map((p, i) => ({ ...p, index: i }))
    .filter((p) => p.type !== "INFANT");
  const passenger =
    eligible.find((p) => p.index === passengerIndex) || eligible[0];
  const index = passenger.index;
  const chosen = draft.extras[flightId]?.[index] || [];
  function toggle(service) {
    const current = chosen.includes(service.id)
      ? chosen.filter((id) => id !== service.id)
      : [
          ...chosen.filter(
            (id) =>
              services.data.find((s) => s.id === id)?.category !==
              service.category,
          ),
          service.id,
        ];
    update({
      extras: {
        ...draft.extras,
        [flightId]: { ...draft.extras[flightId], [index]: current },
      },
      booking: null,
    });
  }
  function seatChange(number) {
    update({
      seats: {
        ...draft.seats,
        [flightId]: { ...draft.seats[flightId], [index]: number },
      },
      booking: null,
    });
  }
  return (
    <main className="container page checkout-page">
      <BookingSteps active={2} />
      <div className="page-heading">
        <span className="eyebrow">{t("BƯỚC 3")}</span>
        <h1>{t("Dịch vụ bổ sung")}</h1>
        <p>{t("Chọn dịch vụ cho từng hành khách, từng chặng. Các lựa chọn đều có thể bỏ qua.")}</p>
      </div>
      <div className="checkout-grid">
        <div>
          <div className="panel extras-controls">
            <label>{t("Chặng bay")}<select
                value={segmentIndex}
                onChange={(e) => setSegmentIndex(Number(e.target.value))}
              >
                {draft.segments.map((s, i) => (
                  <option key={s.flight.id} value={i}>
                    {s.flight.origin.code} → {s.flight.destination.code} ·{" "}
                    {s.flight.flightNumber}
                  </option>
                ))}
              </select>
            </label>
            <label>{t("Hành khách")}<select
                value={index}
                onChange={(e) => setPassengerIndex(Number(e.target.value))}
              >
                {eligible.map((p) => (
                  <option key={p.index} value={p.index}>
                    {p.lastName} {p.firstName}
                  </option>
                ))}
              </select>
            </label>
            <p className="small muted">{t("Hạng ")}{t(segment.fare.name)}: {t(segment.fare.benefits)}{t(". Dịch vụ bên dưới là gói mua thêm.")}</p>
          </div>
          <section className="panel ancillary-panel">
            <h2>{t("Hành lý, suất ăn và tiện ích")}</h2>
            {services.loading ? (
              <LoadingState />
            ) : services.error ? (
              <ErrorState message={services.error} retry={services.retry} />
            ) : (
              Object.entries(categories).map(([category, label]) => (
                <div className="ancillary-group" key={category}>
                  <h3>{t(label)}</h3>
                  {services.data
                    .filter((s) => s.category === category)
                    .map((service) => (
                      <label
                        className={`ancillary-option ${chosen.includes(service.id) ? "selected" : ""}`}
                        key={service.id}
                      >
                        <input
                          type="checkbox"
                          aria-label={t(service.name)}
                          checked={chosen.includes(service.id)}
                          onChange={() => toggle(service)}
                        />
                        <span>
                          <strong>{t(service.name)}</strong>
                          <small>{t(service.description)}</small>
                        </span>
                        <b>{money(service.price)}</b>
                      </label>
                    ))}
                </div>
              ))
            )}
          </section>
          <section className="panel seat-panel">
            <h2>{t("Chọn chỗ ngồi")}</h2>
            <p>
              {passenger.lastName} {passenger.firstName}{t(" · Ghế")}{" "}
              {draft.seats[flightId]?.[index] || t("chưa chọn")}
            </p>
            <SeatMap
              flightId={flightId}
              selected={draft.seats[flightId]?.[index]}
              otherSelections={Object.entries(draft.seats[flightId] || {})
                .filter(([p]) => Number(p) !== index)
                .map(([, number]) => number)}
              onSelect={seatChange}
            />
          </section>
        </div>
        <div>
          {quote.loading ? (
            <LoadingState label={t("Đang tính giá tại máy chủ...")} />
          ) : quote.error ? (
            <ErrorState message={quote.error} />
          ) : (
            <PriceSummary price={quote.price} />
          )}
        </div>
      </div>
      <div className="actions justify-between">
        <Link className="button secondary" to="/booking/passengers">{t("Quay lại")}</Link>
        <button
          className="button primary"
          onClick={() => navigate("/booking/review")}
        >{t("Tiếp tục")}</button>
      </div>
    </main>
  );
}
