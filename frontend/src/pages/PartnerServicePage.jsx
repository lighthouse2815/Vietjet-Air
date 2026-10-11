import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ExternalLink, MapPin, CalendarDays, MessageCircle } from "lucide-react";
import { t } from "../i18n";
import ServiceRequestForm from "../components/services/ServiceRequestForm";
import StatsSection from "../components/home/StatsSection";
import "../styles/services.css";

const services = {
  hotels: {
    title: "Khách sạn", heading: "Khách sạn cho hành trình của bạn", image: "/assets/reference/hotel.webp",
    description: "Lên kế hoạch nghỉ dưỡng, chọn điểm đến và gửi nhu cầu lưu trú cho đội ngũ hỗ trợ.",
    provider: "Agoda", source: "https://www.agoda.com/vi-vn/vietjetair?ds=SGA3IfaG1eLf0S4v",
    fields: [{ name: "destination", label: "Điểm đến" }, { name: "checkIn", label: "Ngày nhận phòng", type: "date" },
      { name: "checkOut", label: "Ngày trả phòng", type: "date" }, { name: "rooms", label: "Số phòng", type: "number", min: 1, max: 20, defaultValue: "1" },
      { name: "guests", label: "Số khách", type: "number", min: 1, max: 60, defaultValue: "2" }],
    steps: ["Chọn điểm đến và thời gian lưu trú", "Gửi yêu cầu và theo dõi tư vấn", "Kiểm tra phòng, giá và điều kiện tại Agoda"],
    faq: [["Tôi đã đặt phòng sau khi gửi yêu cầu chưa?", "Yêu cầu tư vấn được lưu trong hệ thống nội bộ. Xác nhận phòng, thanh toán và hủy phòng cần thực hiện với nhà cung cấp."],
      ["Tôi theo dõi yêu cầu ở đâu?", "Mở Trung tâm hỗ trợ để xem phản hồi, bổ sung thông tin hoặc đóng yêu cầu."]],
  },
};
export default function PartnerServicePage({ slug }) {
  useTranslation();
  const service = services[slug];
  return <main className={`service-page service-${slug}`}>
    <section className="service-hero" aria-label={t(service.title)}>
      <img src={service.image} alt="" fetchPriority="high" />
      {slug === "hotels" && <div className="container service-hero-copy"><span>{t("Khám phá điểm dừng chân")}</span><h1>{t(service.heading)}</h1><a className="button primary" href="#service-request">{t("Lên kế hoạch lưu trú")}</a></div>}
    </section>
    <div className="container service-content">
      <nav className="service-breadcrumb" aria-label={t("Đường dẫn trang")}><Link to="/">{t("Trang chủ")}</Link><span>›</span><span>{t(service.title)}</span></nav>
      {slug !== "hotels" && <h1>{t(service.heading)}</h1>}
      <p className="service-intro">{t(service.description)}</p>
      <div className="service-steps">{service.steps.map((step, index) => { const Icon = [MapPin, CalendarDays, MessageCircle][index]; return <article key={step}><Icon size={30} /><span>{index + 1}</span><h2>{t(step)}</h2></article>; })}</div>
      <ServiceRequestForm key={slug} slug={slug} title={service.title} fields={service.fields} />
      <section className="panel service-faq"><h2>{t("Câu hỏi thường gặp")}</h2>{service.faq.map(([question, answer]) => <details key={question}><summary>{t(question)}</summary><p>{t(answer)}</p></details>)}</section>
      <section className="service-provider"><h2>{t("Dịch vụ từ nhà cung cấp")} · {service.provider}</h2><p>{t("Giá, khả năng cung cấp và giao dịch của đối tác chưa kết nối vào hệ thống nội bộ.")}</p>
        <a className="button secondary" href={service.source} target="_blank" rel="noopener noreferrer">{t("Mở trang nhà cung cấp")}<ExternalLink size={16} /></a>
        <Link className="button secondary" to="/services/support">{t("Trung tâm hỗ trợ")}</Link>
      </section>
    </div><StatsSection />
  </main>;
}
