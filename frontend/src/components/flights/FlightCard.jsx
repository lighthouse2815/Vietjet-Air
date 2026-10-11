import { t } from "../../i18n.js";
import { useTranslation } from "react-i18next";
import { Plane, Check } from "lucide-react";
import { money, timeLabel } from "../../api/client";
export default function FlightCard({ flight, selected, onSelect }) {
  useTranslation();
  return (
    <article className="flight-card panel">
      <div className="flight-card-main">
        <div className="airline-label">
          <Plane />
          <strong>{flight.flightNumber}</strong>
          <small>{t("Vietjet · DEMO")}</small>
        </div>
        <div className="flight-time">
          <b>{timeLabel(flight.departureTime)}</b>
          <span>{flight.origin.code}</span>
        </div>
        <div className="flight-duration">
          <span>
            {Math.floor(flight.durationMinutes / 60)}{t("h")}{" "}
            {flight.durationMinutes % 60}{t("m")}</span>
          <i>
            <Plane size={14} />
          </i>
          <small>{t("Bay thẳng")}</small>
        </div>
        <div className="flight-time">
          <b>{timeLabel(flight.arrivalTime)}</b>
          <span>{flight.destination.code}</span>
        </div>
        <span className="remaining">{flight.remainingSeats}{t(" ghế còn lại")}</span>
      </div>
      <div className="fare-options">
        {flight.fares.map((fare) => (
          <button
            key={fare.code}
            className={`fare-option fare-${fare.code.toLowerCase()} ${selected?.flight.id === flight.id && selected.fare.code === fare.code ? "selected" : ""}`}
            onClick={() => onSelect({ flight, fare })}
            aria-label={t("Chọn {{v0}} {{v1}}", {v0: fare.name, v1: flight.flightNumber})}
            aria-pressed={
              selected?.flight.id === flight.id &&
              selected.fare.code === fare.code
            }
          >
            <strong>{t(fare.name)}</strong>
            <b>{money(fare.price)}</b>
            <small>{t(fare.benefits)}</small>
            {selected?.flight.id === flight.id &&
            selected.fare.code === fare.code ? (
              <span>
                <Check size={16} />{t("Đã chọn")}</span>
            ) : (
              <span>{t("Chọn vé")}</span>
            )}
          </button>
        ))}
      </div>
    </article>
  );
}
