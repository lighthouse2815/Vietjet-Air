import { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Ban } from "lucide-react";
import { useBooking } from "../context/BookingContext";
import { api, bookingHeaders, errorMessage, money } from "../api/client";
import BookingSteps from "../components/booking/BookingSteps";
import { useApi } from "../hooks/useApi";
export default function PaymentPage() {
  const { draft, update } = useBooking();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const booking = draft.booking;
  const vouchers = useApi(sessionStorage.getItem("demo-auth") ? "/commerce/account/vouchers" : null);
  const [voucherId, setVoucherId] = useState("");
  if (!booking) return <Navigate to="/booking/review" replace />;
  async function pay(outcome) {
    setBusy(true);
    setError("");
    try {
      await api.post(
        voucherId && outcome === "SUCCESS" ? "/commerce/account/vouchers/pay-booking" : "/payments/demo",
        voucherId && outcome === "SUCCESS" ? {voucherId:Number(voucherId),bookingId:booking.id,requestKey:crypto.randomUUID()} : { bookingId: booking.id, requestKey: crypto.randomUUID(), outcome },
        bookingHeaders(booking.accessToken),
      );
      const { data } = await api.get(
        `/bookings/${booking.code}`,
        bookingHeaders(booking.accessToken),
      );
      update({ booking: data });
      if (outcome === "SUCCESS") navigate(`/booking/success/${booking.code}`);
      else if (outcome === "FAILED")
        setError(
          "Thanh toán demo thất bại. Bạn có thể thử lại trong thời hạn giữ chỗ.",
        );
      else navigate("/my-booking", { state: { booking: data } });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="container page checkout-page">
      <BookingSteps active={4} />
      <div className="page-heading">
        <span className="eyebrow">THANH TOÁN GIẢ LẬP</span>
        <h1>Thanh toán demo</h1>
        <p>
          Không thu tiền thật. Không yêu cầu thông tin thẻ hoặc tài khoản ngân
          hàng.
        </p>
      </div>
      <section className="panel payment-panel">
        <h2>Mã đặt chỗ: {booking.code}</h2>
        <strong className="payment-total">
          {money(booking.price.totalAmount)}
        </strong>
        <p>
          Giữ chỗ đến {new Date(booking.expiresAt).toLocaleString("vi-VN")}.
        </p>
        {error && (
          <p className="notice-panel error" role="alert">
            {error}
          </p>
        )}
        <div className="payment-options">
          {!!vouchers.data?.length && <label>Dùng voucher nội bộ<select value={voucherId} onChange={e=>setVoucherId(e.target.value)}><option value="">Thanh toán demo thông thường</option>{vouchers.data.filter(v=>v.status==="ACTIVE"&&v.balance>0&&v.recipientEmail===JSON.parse(sessionStorage.getItem("demo-user")||"{}").email).map(v=><option key={v.id} value={v.id}>{v.code} · {money(v.balance)}</option>)}</select>{voucherId&&<small>Trừ số dư voucher trước, phần còn lại thanh toán demo. Không thu tiền thật.</small>}</label>}
          <button
            className="button primary"
            disabled={busy}
            onClick={() => pay("SUCCESS")}
          >
            <CheckCircle2 />
            Thanh toán thành công
          </button>
          <button
            className="button secondary"
            disabled={busy}
            onClick={() => pay("FAILED")}
          >
            <XCircle />
            Thanh toán thất bại
          </button>
          <button
            className="button secondary"
            disabled={busy}
            onClick={() => pay("CANCELLED")}
          >
            <Ban />
            Hủy thanh toán
          </button>
        </div>
        <Link className="small muted" to="/my-booking">
          Tra cứu và quản lý đặt chỗ
        </Link>
      </section>
    </main>
  );
}
