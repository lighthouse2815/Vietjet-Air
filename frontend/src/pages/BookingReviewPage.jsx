import { t } from "../i18n.js";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import { useQuote } from "../hooks/useQuote";
import { useApi } from "../hooks/useApi";
import { api, errorMessage, dateLabel, timeLabel } from "../api/client";
import { bookingPayload, storeBooking } from "../utils/booking";
import BookingSteps from "../components/booking/BookingSteps";
import PriceSummary from "../components/booking/PriceSummary";
import { LoadingState, ErrorState } from "../components/common/States";
export default function BookingReviewPage() {
  useTranslation();
  const { draft, update } = useBooking();
  const navigate = useNavigate();
  const quote = useQuote(draft);
  const services = useApi("/ancillary-services");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  if (!draft.segments.length || !draft.passengers.length)
    return <Navigate to="/booking/passengers" replace />;
  async function create() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/bookings", bookingPayload(draft));
      storeBooking(data);
      update({ booking: data });
      navigate("/booking/payment");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="container page checkout-page">
      <BookingSteps active={3} />
      <div className="page-heading">
        <span className="eyebrow">{t("BƯỚC 4")}</span>
        <h1>{t("Xác nhận thông tin")}</h1>
        <p>{t("Kiểm tra trước khi giữ chỗ và thanh toán giả lập.")}</p>
      </div>
      <div className="checkout-grid">
        <div>
          {draft.segments.map((segment) => (
            <section className="panel review-segment" key={segment.flight.id}>
              <h2>
                {t(segment.flight.origin.city)} → {t(segment.flight.destination.city)}
              </h2>
              <p>
                {segment.flight.flightNumber} ·{" "}
                {dateLabel(segment.flight.departureTime)} ·{" "}
                {timeLabel(segment.flight.departureTime)} –{" "}
                {timeLabel(segment.flight.arrivalTime)}
              </p>
              <strong>{t("Hạng ")}{t(segment.fare.name)}</strong>
              <p className="muted small">{t(segment.fare.benefits)}</p>
              {draft.passengers.map((p, i) => (
                <div className="passenger-detail" key={i}>
                  <b>
                    {p.lastName} {p.firstName}
                  </b>
                  <span>
                    {p.type === "INFANT"
                      ? t("Em bé, không có ghế riêng")
                      : t("Ghế {{v0}}", {v0: draft.seats[segment.flight.id]?.[i] || "chưa chọn"})}
                  </span>
                  <small>
                    {(draft.extras[segment.flight.id]?.[i] || [])
                      .map(
                        (id) =>
                          services.data?.find((service) => service.id === id)
                            ?.name || t("Đang tải dịch vụ..."),
                      )
                      .join(" · ") || t("Không có dịch vụ bổ sung")}
                  </small>
                </div>
              ))}
            </section>
          ))}
          <section className="panel">
            <h3>{t("Thông tin liên hệ")}</h3>
            <p>
              {draft.contactEmail} · {draft.contactPhone}
            </p>
            <label className="standard-label">{t("Mã khuyến mại")}<input
                value={draft.promotionCode}
                onChange={(e) =>
                  update({ promotionCode: e.target.value.toUpperCase() })
                }
                placeholder="DEMO10"
              />
            </label>
            <p className="small muted">{t("Booking chờ thanh toán giữ chỗ 15 phút. Không thu tiền thật.")}</p>
          </section>
          {error && <ErrorState message={t(error)} />}
        </div>
        <div>
          {quote.loading ? (
            <LoadingState label={t("Đang tính giá từ máy chủ...")} />
          ) : quote.error ? (
            <ErrorState message={quote.error} />
          ) : (
            <PriceSummary price={quote.price} />
          )}
        </div>
      </div>
      <div className="actions justify-between">
        <Link className="button secondary" to="/booking/extras">{t("Quay lại dịch vụ")}</Link>
        <button
          className="button primary"
          disabled={loading || quote.loading || !!quote.error}
          onClick={create}
        >
          {loading ? t("Đang giữ chỗ...") : t("Đặt chỗ và thanh toán demo")}
        </button>
      </div>
    </main>
  );
}
