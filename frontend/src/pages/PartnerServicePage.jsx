import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, MapPin, CalendarDays, MessageCircle } from "lucide-react";
import { t } from "../i18n";
import ServiceRequestForm from "../components/services/ServiceRequestForm";
import StatsSection from "../components/home/StatsSection";
import BookingForm from "../components/booking/BookingForm";
import BookingLookupForm from "../components/booking/BookingLookupForm";
import InsuranceBooking from "../components/services/InsuranceBooking";
import "../styles/services.css";

const services = {
  insurance: {
    title: "Bảo hiểm", heading: "Bảo hiểm du lịch Vietjet Travel Safe", image: "/assets/services/insurance-banner.jpg",
    description: "Chuẩn bị hành trình an tâm với thông tin bảo hiểm. Bạn có thể chọn bảo hiểm demo trong booking và thanh toán qua luồng mua thêm dịch vụ hiện có.",
    provider: "Vietjet Travel Safe", source: "https://www.vietjetair.com/vi/insurance",
    steps: ["Chọn booking đã xác nhận", "Xem giá bảo hiểm nội bộ", "Báo giá và thanh toán mua thêm"],
    faq: [["Tôi có nhận chứng nhận bảo hiểm thật không?", "Bảo hiểm nội bộ chỉ phục vụ trải nghiệm demo. Chứng nhận, điều khoản, hiệu lực và yêu cầu bồi thường thực tế phải được xác nhận với nhà cung cấp."],
      ["Tôi chọn bảo hiểm cho ai và chặng nào?", "Nút mua thêm chuyển tới quản lý booking và chọn trước dịch vụ cho hành khách có ghế đầu tiên, ở chặng đầu tiên. Bạn có thể đổi hành khách và chặng trước khi báo giá."],
      ["Tôi mua bảo hiểm khi đặt vé mới thế nào?", "Chọn chuyến bay và nhập hành khách; tại bước dịch vụ bổ sung, chọn bảo hiểm cho từng hành khách và chặng rồi tiếp tục thanh toán demo."]],
  },
  currency: {
    title: "Mua ngoại tệ", heading: "Mua ngoại tệ cho chuyến đi", image: "/assets/services/currency-banner.jpg",
    description: "Vietjet giới thiệu dịch vụ ngoại tệ cùng HDBank. Tra cứu booking nội bộ và gửi nhu cầu tư vấn cho chuyến đi của bạn.",
    provider: "HDBank", source: "https://www.vietjetair.com/vi/currency-exchange",
    fields: [{ name: "currency", label: "Loại ngoại tệ", options: ["USD", "EUR", "AUD", "JPY", "SGD"] },
      { name: "amount", label: "Số tiền dự kiến", type: "number", min: 1, max: 1000000, step: 1 }, { name: "pickup", label: "Nơi nhận mong muốn" }],
    steps: ["Tra cứu mã đặt chỗ nội bộ", "Gửi nhu cầu ngoại tệ", "Xác nhận tỷ giá và nơi nhận với HDBank"],
    faq: [["Tôi đã mua ngoại tệ khi gửi yêu cầu chưa?", "Yêu cầu chỉ ghi nhận loại tiền, số tiền và nơi nhận mong muốn. Nhân viên trao đổi tại Trung tâm hỗ trợ; ngân hàng xác nhận điều kiện và giao dịch."],
      ["Tôi có thể xem hướng dẫn gốc ở đâu?", "Mở trang nhà cung cấp để xem hướng dẫn và điều kiện hiện hành. Việc tra cứu booking demo không xác nhận đủ điều kiện mua ngoại tệ tại ngân hàng."]],
  },
  visa: {
    title: "eVisa", heading: "Quy định xuất nhập cảnh", image: "/assets/services/visa-banner.png",
    description: "Chuẩn bị thông tin quốc tịch, điểm đến và các chặng quá cảnh để nhận hướng dẫn trước chuyến đi.",
    provider: "Sherpa", source: "https://apps.joinsherpa.io/trip?appId=spkzNTUxNz&language=vi-VN",
    fields: [{ name: "nationality", label: "Quốc tịch" }, { name: "destination", label: "Điểm đến" },
      { name: "transit", label: "Điểm quá cảnh", required: false }, { name: "departure", label: "Ngày khởi hành", type: "date" }],
    steps: ["Chuẩn bị thông tin hành trình", "Kiểm tra yêu cầu với Sherpa", "Xác minh với cơ quan có thẩm quyền"],
    faq: [["Tôi cần cung cấp hộ chiếu không?", "Form tư vấn chỉ cần quốc tịch và hành trình. Hồ sơ, lệ phí và tiến độ cấp visa do nhà cung cấp hoặc cơ quan có thẩm quyền xử lý."],
      ["Có cần kiểm tra yêu cầu tại điểm quá cảnh?", "Hãy kiểm tra điều kiện của từng điểm quá cảnh và điểm đến. Quy định có thể thay đổi; sử dụng nguồn chính thức trước khi khởi hành."],
      ["Gửi yêu cầu có đảm bảo được cấp visa không?", "Quy định cần được kiểm tra với cơ quan có thẩm quyền; hệ thống nội bộ không xác nhận quyền nhập cảnh."]],
  },
  esim: {
    title: "eSIM", heading: "Bay khắp thế giới với eSIM", image: "/assets/services/esim-banner.jpg",
    description: "Chọn quốc gia, thời gian sử dụng và kiểm tra thiết bị trước chuyến đi. Gửi nhu cầu để nhận tư vấn trong tài khoản của bạn.",
    provider: "SkyFi", source: "https://agent.skyfi.vn/buy-esim/nations?language=vi",
    fields: [{ name: "country", label: "Quốc gia sử dụng" }, { name: "days", label: "Số ngày sử dụng", type: "number", min: 1, max: 180, defaultValue: "7" },
      { name: "device", label: "Thiết bị sử dụng" }, { name: "compatible", label: "Thiết bị hỗ trợ eSIM", options: ["Đã kiểm tra", "Cần được hướng dẫn"] }],
    steps: ["Kiểm tra thiết bị và quốc gia", "Chọn nhu cầu dữ liệu và thời gian", "Nhận hướng dẫn kích hoạt từ SkyFi"],
    faq: [["Làm sao kiểm tra thiết bị hỗ trợ eSIM?", "Kiểm tra phần SIM trong cài đặt điện thoại và tài liệu của hãng. Thiết bị cần hỗ trợ eSIM và không bị khóa mạng."],
      ["Tôi nhận mã QR ở đâu?", "Nhà cung cấp cấp mã QR sau khi hoàn tất mua gói. Hệ thống nội bộ hiện nhận yêu cầu tư vấn; chưa bán gói hoặc cấp mã kích hoạt."],
      ["Bản nháp eSIM có bị lẫn với khách sạn không?", "Mỗi dịch vụ lưu bản nháp riêng trong phiên trình duyệt. Yêu cầu đã gửi được lưu trong tài khoản và có thể theo dõi tại Trung tâm hỗ trợ."]],
  },
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
  const [booking, setBooking] = useState(null);
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
      <div className="service-steps">{service.steps.map((step, index) => { const Icon = [MapPin, CalendarDays, MessageCircle][index]; return <article key={step}><Icon size={30} /><span>{index + 1}</span><h2>{t(step)}</h2></article>; })}</div>
      {slug === "insurance" ? <InsuranceBooking /> : <ServiceRequestForm key={slug} slug={slug} title={service.title} fields={service.fields} bookingCode={booking?.code} />}
      {slug === "currency" && <section className="service-guides"><h2>{t("Hướng dẫn từ nhà cung cấp")}</h2><p>{t("Ảnh hướng dẫn tham chiếu; các bước giao dịch ngân hàng được thực hiện trên kênh của đối tác.")}</p>
        {[1, 2].map(index => <details key={index}><summary>{index === 1 ? t("Mua ngoại tệ khi đặt chuyến bay") : t("Mua ngoại tệ từ Chuyến bay của tôi")}</summary><img src={`/assets/services/currency-guide-${index}.jpg`} alt={t("Hướng dẫn mua ngoại tệ của HDBank")} loading="lazy" /></details>)}
      </section>}
      <section className="panel service-faq"><h2>{t("Câu hỏi thường gặp")}</h2>{service.faq.map(([question, answer]) => <details key={question}><summary>{t(question)}</summary><p>{t(answer)}</p></details>)}</section>
      <section className="service-provider"><h2>{t("Dịch vụ từ nhà cung cấp")} · {service.provider}</h2><p>{t("Giá, khả năng cung cấp và giao dịch của đối tác chưa kết nối vào hệ thống nội bộ.")}</p>
        <a className="button secondary" href={service.source} target="_blank" rel="noopener noreferrer">{t("Mở trang nhà cung cấp")}<ExternalLink size={16} /></a>
        <Link className="button secondary" to="/services/support">{t("Trung tâm hỗ trợ")}</Link>
      </section>
    </div><StatsSection />
  </main>;
}
