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
        <span className="eyebrow">BƯỚC 3</span>
        <h1>Dịch vụ bổ sung</h1>
        <p>
          Chọn dịch vụ cho từng hành khách, từng chặng. Các lựa chọn đều có thể
          bỏ qua.
        </p>
      </div>
      <div className="checkout-grid">
        <div>
          <div className="panel extras-controls">
            <label>
              Chặng bay
              <select
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
            <label>
              Hành khách
              <select
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
            <p className="small muted">
              Hạng {segment.fare.name}: {segment.fare.benefits}. Dịch vụ bên
              dưới là gói mua thêm.
            </p>
          </div>
          <section className="panel ancillary-panel">
            <h2>Hành lý, suất ăn và tiện ích</h2>
            {services.loading ? (
              <LoadingState />
            ) : services.error ? (
              <ErrorState message={services.error} retry={services.retry} />
            ) : (
              Object.entries(categories).map(([category, label]) => (
                <div className="ancillary-group" key={category}>
                  <h3>{label}</h3>
                  {services.data
                    .filter((s) => s.category === category)
                    .map((service) => (
                      <label
                        className={`ancillary-option ${chosen.includes(service.id) ? "selected" : ""}`}
                        key={service.id}
                      >
                        <input
                          type="checkbox"
                          aria-label={service.name}
                          checked={chosen.includes(service.id)}
                          onChange={() => toggle(service)}
                        />
                        <span>
                          <strong>{service.name}</strong>
                          <small>{service.description}</small>
                        </span>
                        <b>{money(service.price)}</b>
                      </label>
                    ))}
                </div>
              ))
            )}
          </section>
          <section className="panel seat-panel">
            <h2>Chọn chỗ ngồi</h2>
            <p>
              {passenger.lastName} {passenger.firstName} · Ghế{" "}
              {draft.seats[flightId]?.[index] || "chưa chọn"}
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
            <LoadingState label="Đang tính giá tại máy chủ..." />
          ) : quote.error ? (
            <ErrorState message={quote.error} />
          ) : (
            <PriceSummary price={quote.price} />
          )}
        </div>
      </div>
      <div className="actions justify-between">
        <Link className="button secondary" to="/booking/passengers">
          Quay lại
        </Link>
        <button
          className="button primary"
          onClick={() => navigate("/booking/review")}
        >
          Tiếp tục
        </button>
      </div>
    </main>
  );
}
