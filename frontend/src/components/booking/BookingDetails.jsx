import { Plane, CheckCircle2 } from "lucide-react";
import { dateLabel, timeLabel, money } from "../../api/client";
import { statusLabels } from "../../utils/booking";
import PriceSummary from "./PriceSummary";
export default function BookingDetails({ booking }) {
  return (
    <div className="checkout-grid">
      <div>
        <div className="panel booking-code-panel">
          <span>Mã đặt chỗ</span>
          <strong data-testid="booking-code">{booking.code}</strong>
          <b className={`status status-${booking.status.toLowerCase()}`}>
            {statusLabels[booking.status]}
          </b>
          <small>Booking demo · Không có giá trị vận chuyển</small>
          <p className="small">
            Thanh toán demo:{" "}
            <strong>
              {{
                UNPAID: "Chưa thanh toán",
                SUCCESS: "Thành công",
                FAILED: "Thất bại",
                CANCELLED: "Đã hủy",
              }[booking.paymentStatus] || "Chưa thanh toán"}
            </strong>
          </p>
        </div>
        {booking.segments.map((segment) => (
          <section className="panel itinerary-panel" key={segment.flight.id}>
            <h3>
              <Plane size={19} />
              {segment.flight.origin.city} → {segment.flight.destination.city}
            </h3>
            <div className="itinerary-times">
              <div>
                <strong>{timeLabel(segment.flight.departureTime)}</strong>
                <span>{segment.flight.origin.code}</span>
              </div>
              <div>
                <small>{dateLabel(segment.flight.departureTime)}</small>
                <b>{segment.flight.flightNumber}</b>
                <small>Hạng {segment.fare.name}</small>
              </div>
              <div>
                <strong>{timeLabel(segment.flight.arrivalTime)}</strong>
                <span>{segment.flight.destination.code}</span>
              </div>
            </div>
            <p className="small muted">{segment.fare.benefits}</p>
            {booking.passengers.map((p) => (
              <div className="passenger-detail" key={p.passengerIndex}>
                <b>
                  {p.lastName} {p.firstName}
                </b>
                <span>
                  Ghế{" "}
                  {segment.seats.find(
                    (s) => s.passengerIndex === p.passengerIndex,
                  )?.seatNumber || "chưa chọn"}
                </span>
                {booking.extras
                  .filter(
                    (e) =>
                      e.flightId === segment.flight.id &&
                      e.passengerIndex === p.passengerIndex,
                  )
                  .map((e) => (
                    <small key={e.service.id}>
                      {e.service.name} · {money(e.price)}
                    </small>
                  ))}
              </div>
            ))}
          </section>
        ))}
        <section className="panel">
          <h3>Thông tin liên hệ</h3>
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
                <strong>BOARDING PASS · DEMO</strong>
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
                  <dt>Ngày bay</dt>
                  <dd>{dateLabel(flight.departureTime)}</dd>
                </div>
                <div>
                  <dt>Khởi hành</dt>
                  <dd>{timeLabel(flight.departureTime)}</dd>
                </div>
                <div>
                  <dt>Ghế</dt>
                  <dd>{pass.seatNumber}</dd>
                </div>
              </dl>
              <code>{pass.boardingCode}</code>
              <small>Vé lên tàu bay mô phỏng · Không sử dụng tại sân bay</small>
            </article>
          );
        })}
      </div>
      <PriceSummary price={booking.price} />
    </div>
  );
}
