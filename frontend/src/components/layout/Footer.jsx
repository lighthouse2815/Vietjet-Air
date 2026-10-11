import { t } from "../../i18n.js";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import {
  Plane,
  ShoppingBag,
  MapPin,
  Ticket,
  Headphones,
  ArrowRight,
  Facebook,
  Instagram,
  Youtube,
  Mail,
} from "lucide-react";
const groups = [
  [
    "Để có chuyến bay tốt đẹp",
    [
      "Điều lệ vận chuyển",
      "Điều kiện vé",
      "Vietjet e-Voucher",
      "Phí và lệ phí",
      "Giấy tờ tùy thân",
      "Quy định hành lý",
      "Thông tin nối chuyến",
      "Kênh thanh toán",
      "Hóa đơn VAT",
      "Hướng dẫn làm thủ tục chuyến bay",
    ],
  ],
  [
    "Mua hành lý, suất ăn, chọn chỗ ngồi và hơn thế nữa...",
    [
      "Chọn chỗ ngồi ưu tiên",
      "Mua trước hành lý",
      "Đặt trước suất ăn",
      "Hàng miễn thuế",
      "Quà lưu niệm",
      "Giải trí",
      "Dịch vụ đặc biệt",
    ],
  ],
  [
    "Dịch vụ cao cấp",
    [
      "Hạng vé Business",
      "Hạng vé SkyBoss",
      "Phòng chờ sang trọng",
      "Về Vietjet",
      "Giới thiệu dự án",
      "Tin tức và khuyến mại",
      "Cẩm nang du lịch",
    ],
  ],
  [
    "Trung tâm phục vụ Khách hàng",
    [
      "Hỗ trợ",
      "Liên hệ",
      "Mua vé ở đâu?",
      "Phòng bán vé",
      "Đại lý bán vé",
      "Tìm vật phẩm bỏ quên",
    ],
  ],
  [
    "Chính sách",
    [
      "Chính sách quyền riêng tư",
      "Chính sách sử dụng Cookies",
      "Dịch vụ hàng hóa",
      "Quy trình đổi, hoàn, hủy vé",
      "Điều kiện bản demo",
    ],
  ],
];
const footerTargets = {
  "Vietjet e-Voucher":"/services/voucher", "Chọn chỗ ngồi ưu tiên":"/my-booking", "Mua trước hành lý":"/my-booking", "Đặt trước suất ăn":"/my-booking",
  "Hàng miễn thuế":"/services/skyshop", "Quà lưu niệm":"/services/skyshop", "Hướng dẫn làm thủ tục chuyến bay":"/check-in",
  "Quy trình đổi, hoàn, hủy vé":"/my-booking", "Chính sách quyền riêng tư":"/services/privacy", "Chính sách sử dụng Cookies":"/services/cookies",
  "Tin tức và khuyến mại":"/services/promotions", "Quy định hành lý":"/services/faq#baggage", "Điều kiện vé":"/services/faq#booking",
  "Điều lệ vận chuyển":"/services/booking", "Phí và lệ phí":"/services/faq#booking", "Thông tin nối chuyến":"/services/multi-city",
  "Dịch vụ hàng hóa":"/services/cargo", "Giới thiệu dự án":"/services/booking", "Điều kiện bản demo":"/services/booking", "Hạng vé Business":"/", "Hạng vé SkyBoss":"/",
};
export default function Footer() {
  useTranslation();
  const home = useLocation().pathname === "/";
  return (
    <>
      <footer className="site-footer">
        <div className="container footer-grid">
          {groups.map(([title, items]) => (
            <div key={title}>
              <h4>
                <ArrowRight size={13} />
                {t(title)}
              </h4>
              {items.map((item) => (
                <Link
                  key={item}
                  to={footerTargets[item] || "/services/support"}
                >
                  {t(item)}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="container footer-bottom">
          <div>
            <h4>{t("Kết nối cùng hành trình")}</h4>
            <div className="social-links">
              <Link aria-label={t("Thông tin Facebook")} to="/services/social">
                <Facebook />
              </Link>
              <Link aria-label={t("Thông tin Instagram")} to="/services/social">
                <Instagram />
              </Link>
              <Link aria-label={t("Thông tin YouTube")} to="/services/social">
                <Youtube />
              </Link>
              <Link aria-label={t("Liên hệ hỗ trợ")} to="/services/support">
                <Mail />
              </Link>
            </div>
            <small>{t("Cập nhật thông tin chuyến bay demo")}</small>
          </div>
          <div>
            <h4>{t("Hướng dẫn đặt chuyến bay")}</h4>
            <Link to="/services/booking">{t("Tìm hiểu luồng đặt vé")}</Link>
            <h4>{t("Hướng dẫn thanh toán")}</h4>
            <Link to="/services/payment">{t("Thanh toán giả lập an toàn")}</Link>
          </div>
          <div className="footer-disclaimer">
            <strong>{t("VIETJET · BẢN MÔ PHỎNG ĐỘC LẬP")}</strong>
            <p>{t("Dự án học tập full-stack, không liên kết hay đại diện cho Vietjet Air. Mọi chuyến bay, giá và giao dịch trên website là dữ liệu demo.")}</p>
            <small>{t("Không sử dụng tài khoản Vietjet, thông tin thẻ hoặc giấy tờ cá nhân thật.")}</small>
          </div>
        </div>
      </footer>
      <nav className="mobile-bottom" aria-label={t("Điều hướng nhanh")}>
        <Link to="/">
          <Ticket />
          <span>{t("Đặt chuyến bay")}</span>
        </Link>
        <Link to="/my-booking">
          <Plane />
          <span>{t("Chuyến bay của tôi")}</span>
        </Link>
        <Link to="/my-booking">
          <ShoppingBag />
          <span>{t("Mua dịch vụ")}</span>
        </Link>
        <Link to="/check-in">
          <MapPin />
          <span>{t("Check-in")}</span>
        </Link>
      </nav>
      {home && (
        <Link
          className="help-bubble"
          to="/services/support"
          aria-label={t("Trung tâm hỗ trợ")}
        >
          <span>{t("Xin chào!")}</span>
          <Headphones />
        </Link>
      )}
    </>
  );
}
