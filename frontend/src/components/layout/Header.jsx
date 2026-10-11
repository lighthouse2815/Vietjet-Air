import { t } from "../../i18n.js";
import i18n from "../../i18n.js";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  X,
  Headphones,
  UserCircle,
  Menu,
} from "lucide-react";
const products = [
  ["Đặt vé", "/"],
  ["Skyshop", "/services/skyshop"],
  ["Khách sạn", "/services/hotels"],
  ["E-Voucher", "/services/voucher"],
  ["E-Sim", "/services/esim"],
  ["E-Visa", "/services/visa"],
  ["Mua ngoại tệ", "/services/currency"],
  ["Bảo hiểm", "/services/insurance"],
  ["SkyJoy", "/services/skyjoy"],
];
const notices = [
  "[BẢN MÔ PHỎNG ĐỘC LẬP] Đặt vé và thanh toán demo — không phải website chính thức của Vietjet.",
  "Khám phá hành trình demo · Dùng mã DEMO10 giảm 10%, tối đa 200.000 đ.",
  "Check-in demo mở 30 ngày và đóng 1 giờ trước khởi hành.",
];
export default function Header() {
  useTranslation();
  const { pathname } = useLocation();
  const home = pathname === "/";
  const shop = pathname === "/services/skyshop";
  const [notice, setNotice] = useState(true);
  const [menu, setMenu] = useState(false);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (!notice || paused || reducedMotion) return;
    const timer = setInterval(
      () => setSlide((i) => (i + 1) % notices.length),
      5000,
    );
    return () => clearInterval(timer);
  }, [notice, paused, reducedMotion]);
  return (
    <>
      <div
        className="announcement"
        style={{ display: notice ? "" : "none" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="container">
          <Bell size={21} />
          <div
            className="announcement-viewport"
            aria-live={paused || reducedMotion ? "polite" : "off"}
            aria-atomic="true"
          >
            {notices.map((message, i) => (
              <span
                className="announcement-message"
                key={message}
                aria-hidden={i !== slide}
                style={{ transform: `translateX(${i === slide ? 0 : i === (slide + 2) % 3 ? -100 : 100}%)` }}
              >
                {t(message)}
              </span>
            ))}
          </div>
          <button
            aria-label={t("Thông báo trước")}
            onClick={() => setSlide((slide + 2) % 3)}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            aria-label={t("Thông báo tiếp")}
            onClick={() => setSlide((slide + 1) % 3)}
          >
            <ChevronRight size={18} />
          </button>
          <button aria-label={t("Đóng thông báo")} onClick={() => setNotice(false)}>
            <X size={21} />
          </button>
        </div>
      </div>
      <header
        className={`site-header ${home || shop ? "over-hero" : ""} ${shop ? "skyshop-header" : ""} ${!notice ? "no-notice" : ""}`}
      >
        <div className="container header-main">
          <Link className="brand" to="/" onClick={() => setMenu(false)}>
            <img src="/assets/reference/logo.svg" alt="vietjetAir.com" width="265" height="46" />
            <em>{t("MÔ PHỎNG ĐỘC LẬP")}</em>
          </Link>
          <div className="header-right">
            <div className="utility-nav">
              <Link to="/services/support">
                <Headphones size={18} />{t("Hỗ trợ")}</Link>
              <Link to="/auth">
                <UserCircle size={20} />{t("Đăng ký | Đăng nhập")}</Link>
              <select className="language-picker" aria-label={t("Ngôn ngữ")} value={i18n.language} onChange={e=>i18n.changeLanguage(e.target.value)}><option value="vi">Tiếng Việt</option><option value="en">English</option></select>
            </div>
            <nav className="primary-nav" aria-label={t("Menu chính")}>
              <Link to="/my-booking">{t("CHUYẾN BAY CỦA TÔI")}</Link>
              <Link to="/check-in">{t("ONLINE CHECK-IN")}</Link>
              <div className="dropdown">
                <button>{t("DỊCH VỤ CHUYẾN BAY")}</button>
                <div className="dropdown-menu">
                  <Link to="/my-booking">{t("Mua hành lý, suất ăn, chọn chỗ ngồi")}</Link>
                  <Link to="/my-booking">{t("Ưu tiên làm thủ tục")}</Link>
                  <Link to="/services/insurance">{t("Bảo hiểm")}</Link>
                  <Link to="/services/faq">{t("Câu hỏi thường gặp")}</Link>
                </div>
              </div>
              <div className="dropdown">
                <button>{t("DỊCH VỤ KHÁC")}</button>
                <div className="dropdown-menu">
                  {products.slice(1).map(([label, path]) => (
                    <Link key={label} to={path}>
                      {t(label)}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </div>
          <button
            className="mobile-menu-button"
            aria-label={menu ? t("Đóng menu") : t("Mở menu")}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
        <nav className="product-nav" aria-label={t("Dịch vụ")}>
          <div className="container">
            {products.map(([label, path], i) => (
              <Link className={i === (shop ? 1 : 0) ? "current" : ""} key={label} to={path}>
                <img src={shop && i < 2 ? `/assets/skyshop/${i === 0 ? "nav-flight" : "nav-shop-active"}.png` : `/assets/reference/product-${i}.png`} alt="" width="25" height="25" />
                {t(label)}
              </Link>
            ))}
          </div>
        </nav>
        {menu && (
          <nav className="mobile-drawer" aria-label={t("Menu di động")}>
            {[
              [t("Chuyến bay của tôi"), "/my-booking"],
              ["Online Check-in", "/check-in"],
              ...products.map(([label, path]) => [label, path]),
            ].map(([label, path]) => (
              <Link key={label} to={path} onClick={() => setMenu(false)}>
                {t(label)}
                <ChevronRight size={17} />
              </Link>
            ))}
          </nav>
        )}
      </header>
    </>
  );
}
