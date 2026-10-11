import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useApi } from "../hooks/useApi";
import { LoadingState, ErrorState } from "../components/common/States";
import { Link } from "react-router-dom";
import { ExternalLink, MapPin, CalendarDays, MessageCircle } from "lucide-react";
import { t } from "../i18n";
import ServiceRequestForm from "../components/services/ServiceRequestForm";
import StatsSection from "../components/home/StatsSection";
import BookingForm from "../components/booking/BookingForm";
import BookingLookupForm from "../components/booking/BookingLookupForm";
import InsuranceBooking from "../components/services/InsuranceBooking";
import "../styles/services.css";

export default function PartnerServicePage({ slug }) {
  useTranslation();
  const content = useApi(`/content/pages/${slug}`);
  const [booking, setBooking] = useState(null);
  if (content.loading) return <main className="container page"><LoadingState /></main>;
  if (content.error) return <main className="container page"><ErrorState message={t(content.error)} retry={content.retry} /></main>;
  const service = { ...content.data.details, title: content.data.title, image: content.data.image, description: content.data.description };
  return <main className={`service-page service-${slug}`}>
    <section className="service-hero" aria-label={t(service.title)}>
      <img src={service.image} alt="" fetchPriority="high" />
      {slug === "hotels" && <div className="container service-hero-copy"><span>{t("Khám phá điểm dừng chân")}</span><h1>{t(service.heading)}</h1><a className="button primary" href="#service-request">{t("Lên kế hoạch lưu trú")}</a></div>}
    </section>
    {slug !== "hotels" && <div className="container service-flight-search"><BookingForm compact /></div>}
    <div className="container service-content">
      <nav className="service-breadcrumb" aria-label={t("Đường dẫn trang")}><Link to="/">{t("Trang chủ")}</Link><span>›</span><span>{t(service.title)}</span></nav>
      {slug !== "hotels" && <h1>{t(service.heading)}</h1>}
      <p className="service-intro">{t(service.description)}</p>
      {slug === "visa" && <aside className="notice-panel"><h2>{t("Chú ý quan trọng")}</h2><p>{t("Quy định cần được kiểm tra với cơ quan có thẩm quyền; hệ thống nội bộ không xác nhận quyền nhập cảnh.")}</p></aside>}
      {slug === "currency" && <><p className="notice-panel">{t("Tỷ giá và điều kiện mua do HDBank xác nhận. Yêu cầu nội bộ chưa tạo giao dịch ngoại tệ.")}</p>
        <h2>{t("Thông tin mã đặt chỗ nội bộ")}</h2><BookingLookupForm onResult={setBooking} />
        {booking && <p className="notice-panel service-booking-result">{t("Mã đặt chỗ")}: <strong>{booking.code}</strong> · {booking.segments.map(segment => `${segment.flight.origin.code} → ${segment.flight.destination.code}`).join(" / ")} · {t(booking.status)}</p>}
      </>}
      <div className="service-steps">{(service.steps || []).map((step, index) => { const Icon = [MapPin, CalendarDays, MessageCircle][index] || MessageCircle; return <article key={step}><Icon size={30} /><span>{index + 1}</span><h2>{t(step)}</h2></article>; })}</div>
      {slug === "insurance" ? <InsuranceBooking /> : <ServiceRequestForm key={slug} slug={slug} title={service.title} fields={service.fields ?? []} bookingCode={booking?.code} />}
      {slug === "currency" && <section className="service-guides"><h2>{t("Hướng dẫn từ nhà cung cấp")}</h2><p>{t("Ảnh hướng dẫn tham chiếu; các bước giao dịch ngân hàng được thực hiện trên kênh của đối tác.")}</p>
        {(service.guides || []).map(guide => <details key={guide.image}><summary>{t(guide.title)}</summary><img src={guide.image} alt={t("Hướng dẫn mua ngoại tệ của HDBank")} loading="lazy" /></details>)}
      </section>}
      <section className="panel service-faq"><h2>{t("Câu hỏi thường gặp")}</h2>{(service.faq || []).map(([question, answer]) => <details key={question}><summary>{t(question)}</summary><p>{t(answer)}</p></details>)}</section>
      <section className="service-provider"><h2>{t("Dịch vụ từ nhà cung cấp")} · {service.provider}</h2><p>{t("Giá, khả năng cung cấp và giao dịch của đối tác chưa kết nối vào hệ thống nội bộ.")}</p>
        <a className="button secondary" href={service.source} target="_blank" rel="noopener noreferrer">{t("Mở trang nhà cung cấp")}<ExternalLink size={16} /></a>
        <Link className="button secondary" to="/services/support">{t("Trung tâm hỗ trợ")}</Link>
      </section>
    </div><StatsSection />
  </main>;
}
