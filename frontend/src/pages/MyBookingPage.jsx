import { t } from "../i18n.js";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import { api, bookingHeaders, errorMessage } from "../api/client";
import BookingLookupForm from "../components/booking/BookingLookupForm";
import BookingDetails from "../components/booking/BookingDetails";
export default function MyBookingPage() {
  useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { update } = useBooking();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function cancel() {
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post(
        `/bookings/${booking.id}/cancel`,
        {},
        bookingHeaders(booking.accessToken),
      );
      setBooking(data);
      setConfirmCancel(false);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="container page checkout-page">
      <div className="page-heading">
        <span className="eyebrow">{t("QUẢN LÝ HÀNH TRÌNH")}</span>
        <h1>{t("Chuyến bay của tôi")}</h1>
        <p>{t("Tra cứu hành trình và dịch vụ của booking demo.")}</p>
      </div>
      <BookingLookupForm
        onResult={(data) => {
          setBooking(data);
          setError("");
          setConfirmCancel(false);
        }}
      />
      {booking && (
        <>
          <BookingDetails booking={booking} />
          <div className="actions">
            {["CONFIRMED","CANCELLED"].includes(booking.status) && <Link className="button primary" to={`/my-booking/${booking.code}/manage`}>{t("Mua thêm, đổi hoặc hoàn vé")}</Link>}
            <Link className="button primary" to="/check-in">{t("Check-in demo")}</Link>
            {booking.status === "PENDING" && (
              <button
                className="button secondary"
                onClick={() => {
                  update({ booking });
                  navigate("/booking/payment");
                }}
              >{t("Tiếp tục thanh toán demo")}</button>
            )}
            {["PENDING", "CONFIRMED"].includes(booking.status) && (
              <button
                className="button secondary"
                onClick={() => setConfirmCancel(true)}
              >{t("Hủy đặt chỗ demo")}</button>
            )}
          </div>
          {confirmCancel && (
            <div
              className="notice-panel"
              role="region"
              aria-label={t("Xác nhận hủy booking")}
            >
              <p>{t("Hủy booking ")}{booking.code}{t("? Ghế và sức chứa sẽ được giải phóng. Demo không có hoàn tiền thực.")}</p>
              <button
                className="button primary"
                disabled={busy}
                onClick={cancel}
              >{t("Xác nhận hủy")}</button>
              <button
                className="button secondary"
                onClick={() => setConfirmCancel(false)}
              >{t("Giữ đặt chỗ")}</button>
            </div>
          )}
          {error && (
            <p role="alert" className="notice-panel error">
              {t(error)}
            </p>
          )}
        </>
      )}
    </main>
  );
}
