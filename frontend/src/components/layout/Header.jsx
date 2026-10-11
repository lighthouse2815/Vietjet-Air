import { t } from "../../i18n.js";
import i18n from "../../i18n.js";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
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
const voucherLinks = [
  ["Điều kiện và Điều khoản", "#evoucher-terms"],
  ["Mua e-Voucher", "#evoucher-values"],
  ["Nhận e-Voucher", "#evoucher-records"],
  ["Sử dụng e-Voucher", "#evoucher-terms"],
];
export default function Header() {
  useTranslation();
  const { pathname } = useLocation();
  const content = useApi("/content/pages/home");
  const products = content.data?.details.products || [];
  const notices = content.data?.details.notices || [];
  const home = pathname === "/";
  const shop = pathname === "/services/skyshop";
  const voucher = pathname === "/services/voucher";
  const serviceHero = ["esim", "visa", "currency", "insurance"].some(slug => pathname === `/services/${slug}`);
  const [notice, setNotice] = useState(true);
  const [menu, setMenu] = useState(false);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (!notice || paused || reducedMotion || notices.length < 2) return;
    const timer = setInterval(
      () => setSlide((i) => (i + 1) % notices.length),
      5000,
    );
    return () => clearInterval(timer);
  }, [notice, paused, reducedMotion, notices.length]);
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
                style={{ transform: `translateX(${i === slide ? 0 : i === (slide + notices.length - 1) % notices.length ? -100 : 100}%)` }}
              >
                {t(message)}
              </span>
            ))}
          </div>
          <button
            disabled={!notices.length} aria-label={t("Thông báo trước")}
            onClick={() => setSlide((slide + notices.length - 1) % notices.length)}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            disabled={!notices.length} aria-label={t("Thông báo tiếp")}
            onClick={() => setSlide((slide + 1) % notices.length)}
          >
            <ChevronRight size={18} />
          </button>
          <button aria-label={t("Đóng thông báo")} onClick={() => setNotice(false)}>
            <X size={21} />
          </button>
        </div>
      </div>
      <header
        className={`site-header ${home || shop || serviceHero ? "over-hero" : ""} ${shop ? "skyshop-header" : ""} ${voucher ? "voucher-header" : ""} ${!notice ? "no-notice" : ""}`}
      >
        <div className="container header-main">
          <Link className="brand" to="/" onClick={() => setMenu(false)}>
            <img src={voucher ? "/assets/evoucher/logo.svg" : "/assets/reference/logo.svg"} alt="vietjetAir.com" width="265" height="46" />
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
        {voucher && <nav className="voucher-nav container" aria-label={t("Menu e-Voucher")}>{voucherLinks.map(([label, target]) => <a href={target} key={label}>{t(label)}</a>)}</nav>}
        <nav className="product-nav" aria-label={t("Dịch vụ")}>
          <div className="container">
            {products.map(([label, path], i) => (
              <Link className={path === pathname ? "current" : ""} aria-current={path === pathname ? "page" : undefined} key={label} to={path}>
                <img src={shop && i < 2 ? `/assets/skyshop/${i === 0 ? "nav-flight" : "nav-shop-active"}.png` : `/assets/reference/product-${i}.png`} alt="" width="25" height="25" />
                {t(label)}
              </Link>
            ))}
          </div>
        </nav>
        {menu && (
          <nav className="mobile-drawer" aria-label={t("Menu di động")}>
            {voucher ? voucherLinks.map(([label, target]) => <a href={target} key={label} onClick={() => setMenu(false)}>{t(label)}<ChevronRight size={17} /></a>) : [
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
