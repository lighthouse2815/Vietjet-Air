import { t } from "../i18n.js";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { Plane, ArrowRight } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { LoadingState, ErrorState } from "../components/common/States";
const titles = {
  skyshop: "Mua sắm, giải trí trên mây",
  hotels: "Khách sạn",
  voucher: "Vietjet e-Voucher",
  esim: "E-Sim",
  visa: "E-Visa",
  currency: "Mua ngoại tệ",
  insurance: "Bảo hiểm",
  skyjoy: "SkyJoy",
  cargo: "Gửi hàng nhanh",
  banking: "Tiện ích ngân hàng",
  holidays: "Du lịch trọn gói",
  priority: "Ưu tiên làm thủ tục nhanh",
  support: "Trung tâm hỗ trợ demo",
  payment: "Thanh toán giả lập",
  booking: "Hướng dẫn đặt vé",
  seats: "Chọn chỗ ngồi",
  baggage: "Hành lý",
  meals: "Suất ăn",
  faq: "Câu hỏi thường gặp",
  privacy: "Quyền riêng tư trong bản demo",
  cookies: "Chính sách cookie",
  social: "Kết nối mạng xã hội",
  promotions: "Săn vé giá rẻ",
  "multi-city": "Hành trình nhiều chặng",
  language: "Ngôn ngữ trong demo",
  "travel-advice": "Chuẩn bị cho chuyến bay",
  groups: "Bay theo đoàn",
};
export default function ContentPage() {
  useTranslation();
  const { slug } = useParams();
  const { hash } = useLocation();
  const { data, loading, error, retry } = useApi("/home");
  const faq = (data?.items || []).filter((i) => i.category === "FAQ");
  useEffect(() => {
    if (slug !== "faq" || !hash || !data) return;
    const topic = document.getElementById(hash.slice(1));
    if (topic instanceof HTMLDetailsElement) {
      topic.open = true;
      topic.scrollIntoView({ block: "start" });
    }
  }, [slug, hash, data]);
  return (
    <main className="container page">
      <div className="page-heading">
        <span className="eyebrow">{t("BẢN MÔ PHỎNG ĐỘC LẬP")}</span>
        <h1>{t(titles[slug]) || t("Thông tin dịch vụ")}</h1>
        <p>{t("Thông tin dành cho trải nghiệm đặt vé demo.")}</p>
      </div>
      <div className="panel content-panel">
        {slug === "faq" ? (
          loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={t(error)} retry={retry} />
          ) : (
            faq.map((item) => (
              <details key={item.id} id={item.target}>
                <summary>{t(item.title)}</summary>
                <p>{t(item.description)}</p>
              </details>
            ))
          )
        ) : (
          <>
            <Plane size={42} className="red" />
            <h2>{t(titles[slug]) || t("Khám phá hành trình")}</h2>
            <p>
              {[
                "skyshop",
                "hotels",
                "voucher",
                "esim",
                "visa",
                "currency",
                "skyjoy",
                "cargo",
                "banking",
                "holidays",
                "social",
              ].includes(slug)
                ? t("Dịch vụ đối tác này được giới thiệu để tái hiện điều hướng website tham chiếu. Bản demo chưa tích hợp đối tác và không nhận giao dịch cho dịch vụ này.")
                : slug === "multi-city"
                  ? t("Bản demo hỗ trợ một chiều, khứ hồi, nhiều chặng và đặt nhóm.")
                  : slug === "language"
                    ? t("Bản demo hỗ trợ tiếng Việt và tiếng Anh.")
                    : slug === "privacy" || slug === "cookies"
                      ? t("Website lưu bản nháp và token truy cập trong sessionStorage trên trình duyệt. Booking demo được lưu PostgreSQL. Không dùng công cụ theo dõi quảng cáo. Chỉ nhập dữ liệu giả để trải nghiệm.")
                      : t("Bạn có thể tìm chuyến bay, chọn hạng vé, điền dữ liệu hành khách mẫu, chọn ghế và dịch vụ, sau đó thanh toán giả lập. Tra cứu booking bằng mã đặt chỗ và tên hành khách. Check-in demo chỉ áp dụng cho booking đã xác nhận trong thời gian cấu hình.")}
            </p>
            <p>{t("Hành lý, suất ăn, ghế và bảo hiểm demo được chọn tại bước dịch vụ bổ sung. Không nhập tài khoản Vietjet, số thẻ ngân hàng hoặc giấy tờ cá nhân thật.")}</p>
            <div className="actions">
              <Link className="button primary" to="/">{t("Tìm chuyến bay ")}<ArrowRight size={17} />
              </Link>
              <Link className="button secondary" to="/my-booking">{t("Tra cứu đặt chỗ")}</Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
