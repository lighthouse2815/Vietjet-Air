import { useState } from "react";
import { api, bookingHeaders, errorMessage } from "../api/client";
import BookingLookupForm from "../components/booking/BookingLookupForm";
import BookingDetails from "../components/booking/BookingDetails";
import SeatMap from "../components/booking/SeatMap";
export default function CheckInPage() {
  const [lookup, setLookup] = useState(null);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [passengerIndex, setPassengerIndex] = useState(0);
  const [seat, setSeat] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const booking = lookup?.booking;
  const segment = booking?.segments[segmentIndex];
  const passengers =
    booking?.passengers.filter((p) => p.type !== "INFANT") || [];
  const passenger =
    passengers.find((p) => p.passengerIndex === passengerIndex) ||
    passengers[0];
  const assigned = segment?.seats.find(
    (s) => s.passengerIndex === passenger?.passengerIndex,
  )?.seatNumber;
  const checked = booking?.boardingPasses.some(
    (p) =>
      p.flightId === segment?.flight.id &&
      p.passengerIndex === passenger?.passengerIndex,
  );
  const until = segment
    ? (new Date(segment.flight.departureTime) - new Date()) / 3600000
    : 0;
  const eligible =
    booking?.status === "CONFIRMED" &&
    until <= lookup.openHours &&
    until >= lookup.closeHours;
  async function complete() {
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post(
        "/check-in/complete",
        {
          bookingId: booking.id,
          flightId: segment.flight.id,
          passengerIndex: passenger.passengerIndex,
          seatNumber: assigned || seat,
          acceptedConditions: accepted,
        },
        bookingHeaders(booking.accessToken),
      );
      setLookup({ ...lookup, booking: data });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="container page checkout-page">
      <div className="page-heading">
        <span className="eyebrow">LÀM THỦ TỤC TRỰC TUYẾN DEMO</span>
        <h1>Online Check-in</h1>
        <p>
          Chỉ cho booking đã xác nhận. Quy tắc thời gian được cấu hình riêng cho
          bản demo.
        </p>
      </div>
      <BookingLookupForm
        checkIn
        onResult={(data) => {
          setLookup(data);
          setSegmentIndex(0);
          setPassengerIndex(
            data.booking.passengers.find((p) => p.type !== "INFANT")
              ?.passengerIndex || 0,
          );
          setSeat("");
          setAccepted(false);
          setError("");
        }}
      />
      {booking && (
        <>
          <div className="notice-panel">
            Check-in demo mở {lookup.openHours} giờ và đóng {lookup.closeHours}{" "}
            giờ trước khởi hành. Boarding pass không có giá trị tại sân bay.
          </div>
          <section className="panel checkin-panel">
            <div className="form-grid two">
              <label>
                Chặng bay
                <select
                  value={segmentIndex}
                  onChange={(e) => {
                    setSegmentIndex(Number(e.target.value));
                    setSeat("");
                  }}
                >
                  {booking.segments.map((s, i) => (
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
                  value={passenger?.passengerIndex}
                  onChange={(e) => {
                    setPassengerIndex(Number(e.target.value));
                    setSeat("");
                  }}
                >
                  {passengers.map((p) => (
                    <option key={p.passengerIndex} value={p.passengerIndex}>
                      {p.lastName} {p.firstName}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {!eligible ? (
              <p role="alert" className="notice-panel error">
                Booking chưa thanh toán hoặc chuyến bay nằm ngoài thời gian
                check-in demo.
              </p>
            ) : checked ? (
              <p className="notice-panel">
                Hành khách đã check-in. Boarding pass demo hiển thị bên dưới.
              </p>
            ) : (
              <>
                {assigned ? (
                  <p>
                    Ghế đã mua: <strong>{assigned}</strong>
                  </p>
                ) : (
                  <>
                    <h3>Chọn ghế tiêu chuẩn miễn phí</h3>
                    <SeatMap
                      flightId={segment.flight.id}
                      selected={seat}
                      onSelect={setSeat}
                      allowSpecial={false}
                    />
                  </>
                )}
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                  />
                  Tôi đồng ý điều kiện check-in demo
                </label>
                <p className="small muted">
                  Tôi hiểu đây là bản mô phỏng và không sử dụng boarding pass
                  này tại sân bay.
                </p>
                <button
                  className="button primary"
                  disabled={busy || !accepted || !(assigned || seat)}
                  onClick={complete}
                >
                  {busy ? "Đang check-in..." : "Hoàn tất check-in"}
                </button>
              </>
            )}
            {error && (
              <p role="alert" className="notice-panel error">
                {error}
              </p>
            )}
          </section>
          <BookingDetails booking={booking} />
        </>
      )}
    </main>
  );
}
