import { t } from "../../i18n.js";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import ScrollCarousel from "../home/ScrollCarousel";
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
export default function Footer() {
  useTranslation();
  const content = useApi("/content/pages/home");
  const groups = content.data?.details.footerGroups || [];
  const footerTargets = content.data?.details.footerTargets || {};
  const awards = content.data?.details.awards || [];
  const [compact, setCompact] = useState(
    () => window.matchMedia("(max-width: 900px)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(max-width: 900px)");
    const update = () => setCompact(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const { pathname } = useLocation();
  const home = pathname === "/";
  const shop = pathname === "/services/skyshop";
  const voucher = pathname === "/services/voucher";
  return (
    <>
      <div className={`footer-background ${home ? "home-footer-background" : ""} ${voucher ? "voucher-footer-background" : ""}`}>
        {(home || shop) && (
          <ScrollCarousel
            className="awards container"
            label={t("Thành tựu trong giao diện tham chiếu")}
          >
            {awards.map(item => <div key={item.image}><img src={item.image} alt="" loading="lazy" onLoad={event => event.currentTarget.classList.add("home-image-loaded")} /><span>{t(item.title)}</span></div>)}
          </ScrollCarousel>
        )}
        <footer className="site-footer">
          <div className="container footer-grid">
            {groups.map(([title, items]) => (
              <details className="footer-group" key={title} open={!compact}>
                <summary>
                  <h4>
                    <ArrowRight size={13} />
                    {t(title)}
                  </h4>
                </summary>
                {items.map((item) => (
                  <Link
                    key={item}
                    to={footerTargets[item] || "/services/support"}
                  >
                    {t(item)}
                  </Link>
                ))}
              </details>
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
              <Link to="/services/payment">
                {t("Thanh toán giả lập an toàn")}
              </Link>
            </div>
            <div className="footer-disclaimer">
              <strong>{t("VIETJET · BẢN MÔ PHỎNG ĐỘC LẬP")}</strong>
              <p>
                {t(
                  "Dự án học tập full-stack, không liên kết hay đại diện cho Vietjet Air. Mọi chuyến bay, giá và giao dịch trên website là dữ liệu demo.",
                )}
              </p>
              <small>
                {t(
                  "Không sử dụng tài khoản Vietjet, thông tin thẻ hoặc giấy tờ cá nhân thật.",
                )}
              </small>
            </div>
          </div>
        </footer>
      </div>
      {!shop && !voucher && <nav className="mobile-bottom" aria-label={t("Điều hướng nhanh")}>
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
      </nav>}
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
