import { t } from "../../i18n.js";
import { useTranslation } from "react-i18next";
import { Plane, CheckCircle2 } from "lucide-react";
import { dateLabel, timeLabel, money } from "../../api/client";
import { statusLabels } from "../../utils/booking";
import PriceSummary from "./PriceSummary";
export default function BookingDetails({ booking }) {
  useTranslation();
  return (
    <div className="checkout-grid">
      <div>
        <div className="panel booking-code-panel">
          <span>{t("Mã đặt chỗ")}</span>
          <strong data-testid="booking-code">{booking.code}</strong>
          <b className={`status status-${booking.status.toLowerCase()}`}>
            {t(statusLabels[booking.status])}
          </b>
          <small>{t("Booking demo · Không có giá trị vận chuyển")}</small>
          <p className="small">{t("Thanh toán demo:")}{" "}
            <strong>
              {{
                UNPAID: t("Chưa thanh toán"),
                SUCCESS: t("Thành công"),
                FAILED: t("Thất bại"),
                CANCELLED: t("Đã hủy"),
              }[booking.paymentStatus] || t("Chưa thanh toán")}
            </strong>
          </p>
        </div>
        {booking.segments.map((segment) => (
          <section className="panel itinerary-panel" key={segment.flight.id}>
            <h3>
              <Plane size={19} />
              {t(segment.flight.origin.city)} → {t(segment.flight.destination.city)}
            </h3>
            <div className="itinerary-times">
              <div>
                <strong>{timeLabel(segment.flight.departureTime)}</strong>
                <span>{segment.flight.origin.code}</span>
              </div>
              <div>
                <small>{dateLabel(segment.flight.departureTime)}</small>
                <b>{segment.flight.flightNumber}</b>
                <small>{t("Hạng ")}{t(segment.fare.name)}</small>
              </div>
              <div>
                <strong>{timeLabel(segment.flight.arrivalTime)}</strong>
                <span>{segment.flight.destination.code}</span>
              </div>
            </div>
            <p className="small muted">{t(segment.fare.benefits)}</p>
            {booking.passengers.map((p) => (
              <div className="passenger-detail" key={p.passengerIndex}>
                <b>
                  {p.lastName} {p.firstName}
                </b>
                <span>{t("Ghế")}{" "}
                  {segment.seats.find(
                    (s) => s.passengerIndex === p.passengerIndex,
                  )?.seatNumber || t("chưa chọn")}
                </span>
                {booking.extras
                  .filter(
                    (e) =>
                      e.flightId === segment.flight.id &&
                      e.passengerIndex === p.passengerIndex,
                  )
                  .map((e) => (
                    <small key={e.service.id}>
                      {t(e.service.name)} · {money(e.price)}
                    </small>
                  ))}
              </div>
            ))}
          </section>
        ))}
        <section className="panel">
          <h3>{t("Thông tin liên hệ")}</h3>
          <p>
            {booking.contactEmail}
            <br />
            {booking.contactPhone}
          </p>
        </section>
        {booking.boardingPasses.map((pass) => {
          const p = booking.passengers.find(
            (p) => p.passengerIndex === pass.passengerIndex,
          );
          const flight = booking.segments.find(
            (s) => s.flight.id === pass.flightId,
          ).flight;
          return (
            <article className="boarding-pass" key={pass.boardingCode}>
              <div>
                <CheckCircle2 size={25} />
                <strong>{t("BOARDING PASS · DEMO")}</strong>
              </div>
              <h3>
                {p.lastName} {p.firstName}
              </h3>
              <p>
                {flight.origin.code} → {flight.destination.code} ·{" "}
                {flight.flightNumber}
              </p>
              <dl>
                <div>
                  <dt>{t("Ngày bay")}</dt>
                  <dd>{dateLabel(flight.departureTime)}</dd>
                </div>
                <div>
                  <dt>{t("Khởi hành")}</dt>
                  <dd>{timeLabel(flight.departureTime)}</dd>
                </div>
                <div>
                  <dt>{t("Ghế")}</dt>
                  <dd>{pass.seatNumber}</dd>
                </div>
              </dl>
              <code>{pass.boardingCode}</code>
              <small>{t("Vé lên tàu bay mô phỏng · Không sử dụng tại sân bay")}</small>
              <button className="button secondary" onClick={()=>{
                const body=[t("BOARDING PASS · DEMO — KHÔNG CÓ GIÁ TRỊ TẠI SÂN BAY"),`${p.lastName} ${p.firstName}`,`${flight.flightNumber} · ${flight.origin.code} → ${flight.destination.code}`,`${dateLabel(flight.departureTime)} · ${timeLabel(flight.departureTime)}`,t("Ghế {{v0}}", {v0: pass.seatNumber}),pass.boardingCode].join("\n");
                const url=URL.createObjectURL(new Blob([body],{type:"text/plain;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download=`boarding-pass-${pass.boardingCode}.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
              }}>{t("Tải boarding pass demo")}</button>
            </article>
          );
        })}
      </div>
      <PriceSummary price={booking.price} />
    </div>
  );
}
