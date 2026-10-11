import { t } from "../i18n.js";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { api, bookingHeaders, errorMessage } from "../api/client";
import BookingDetails from "../components/booking/BookingDetails";
import { LoadingState, ErrorState } from "../components/common/States";
export default function BookingSuccessPage() {
  useTranslation();
  const { bookingCode } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    api
      .get(`/bookings/${bookingCode}`, {
        ...bookingHeaders(
          sessionStorage.getItem(`booking-token-${bookingCode}`),
        ),
        signal: controller.signal,
      })
      .then((r) => setData(r.data))
      .catch((e) => {
        if (e.code !== "ERR_CANCELED") setError(errorMessage(e));
      });
    return () => controller.abort();
  }, [bookingCode]);
  return (
    <main className="container page checkout-page">
      <div className="success-heading">
        <CheckCircle2 />
        <span className="eyebrow">{t("BOOKING DEMO")}</span>
        <h1>
          {data?.status === "CONFIRMED"
            ? t("Đặt vé demo thành công!")
            : t("Thông tin đặt chỗ")}
        </h1>
        <p>{t("Lưu mã đặt chỗ và tên hành khách để tra cứu lại. Không có vé bay thật được phát hành.")}</p>
      </div>
      {error ? (
        <>
          <ErrorState message={t(error)} />
          <Link className="button primary" to="/my-booking">{t("Tra cứu bằng thông tin hành khách")}</Link>
        </>
      ) : !data ? (
        <LoadingState />
      ) : (
        <BookingDetails booking={data} />
      )}
      <div className="actions">
        <Link className="button primary" to="/my-booking">{t("Chuyến bay của tôi")}</Link>
        <Link className="button secondary" to="/check-in">{t("Check-in demo")}</Link>
        <Link className="button secondary" to="/">{t("Về trang chủ")}</Link>
      </div>
    </main>
  );
}
