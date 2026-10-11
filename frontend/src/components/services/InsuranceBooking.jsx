import { useState } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { t } from "../../i18n";
import { money } from "../../api/client";
import { storeBooking } from "../../utils/booking";
import { LoadingState, ErrorState } from "../common/States";
import BookingLookupForm from "../booking/BookingLookupForm";

export default function InsuranceBooking() {
  const logged = !!sessionStorage.getItem("demo-auth");
  const services = useApi("/ancillary-services");
  const bookings = useApi(logged ? "/auth/bookings" : null);
  const [code, setCode] = useState("");
  const [lookedUp, setLookedUp] = useState(null);
  const eligible = booking => booking.status === "CONFIRMED" && !booking.boardingPasses.length
    && booking.segments.every(segment => new Date(segment.flight.departureTime) > new Date());
  const available = (bookings.data || []).filter(eligible);
  const chosen = available.find(booking => booking.code === code) || (lookedUp?.code === code && eligible(lookedUp) ? lookedUp : null);
  const insurance = (services.data || []).filter(service => service.category === "INSURANCE");
  return <section className="insurance-booking" id="service-request">
    <div className="panel"><h2 className="service-section-title">{t("Mua bảo hiểm trong booking nội bộ")}</h2>
      <p>{t("Giá bên dưới lấy từ danh mục nội bộ. Bảo hiểm demo không cấp hợp đồng hoặc chứng nhận bảo hiểm thực; quyền lợi và bồi thường của đối tác cần tích hợp riêng.")}</p>
      {logged && (bookings.loading ? <LoadingState /> : bookings.error ? <ErrorState message={t(bookings.error)} retry={bookings.retry} /> : <label>{t("Chuyến bay mua bảo hiểm")}
        <select aria-label={t("Chuyến bay mua bảo hiểm")} value={code} onChange={event => setCode(event.target.value)}><option value="">{t("Chọn chuyến bay")}</option>
          {available.map(booking => <option key={booking.code} value={booking.code}>{booking.code} · {booking.segments.map(segment => `${segment.flight.origin.code} → ${segment.flight.destination.code}`).join(" / ")}</option>)}
          {lookedUp && eligible(lookedUp) && !available.some(booking => booking.code === lookedUp.code) && <option value={lookedUp.code}>{lookedUp.code}</option>}
        </select></label>)}
      <p>{t("Có thể tra cứu booking bằng mã và tên hành khách. Chỉ booking đã xác nhận, chưa check-in và chưa khởi hành được mua thêm dịch vụ.")}</p>
    </div>
    <BookingLookupForm onResult={booking => { setLookedUp(booking); setCode(booking.code); }} />
    {lookedUp && <p className={`notice-panel service-booking-result ${eligible(lookedUp) ? "" : "error"}`}>
      <strong>{lookedUp.code}</strong> · {t(lookedUp.status)} · {eligible(lookedUp) ? t("Có thể mua thêm dịch vụ nội bộ.") : t("Booking này chưa đủ điều kiện mua thêm dịch vụ.")}
    </p>}
    {services.loading ? <LoadingState /> : services.error ? <ErrorState message={t(services.error)} retry={services.retry} /> : insurance.length === 0 ? <p className="notice-panel">{t("Danh mục hiện chưa có bảo hiểm nội bộ.")}</p> : <div className="service-insurance-products">
      {insurance.map(service => <article className="panel" key={service.id}>
        <img src="/assets/skyshop/insurance.jpg" alt="" loading="lazy" width="220" height="220" />
        <div><h3>{t(service.name)}</h3><p>{t(service.description)}</p><strong className="red">{money(service.price)}</strong><p>{t("Mỗi hành khách, mỗi chặng. Máy chủ xác nhận giá khi báo giá thay đổi.")}</p>
          {chosen ? <Link className="button primary" to={`/my-booking/${chosen.code}/manage?service=${service.id}#services`} onClick={() => storeBooking(chosen)}>{t("Mua bảo hiểm cho chuyến bay")}</Link>
            : <a className="button secondary" href="#service-request">{t("Chọn hoặc tra cứu chuyến bay")}</a>}
        </div>
      </article>)}
    </div>}
  </section>;
}
