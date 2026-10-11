import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Users, Coins, Gift, Wallet } from "lucide-react";
import { money } from "../../api/client";
import { t } from "../../i18n";
import { useReducedMotion } from "../../hooks/useReducedMotion";
const icons = { Users, Coins, Gift, Wallet };
export default function LoyaltyLanding({ logged, content, rules }) {
  const banners = content.details.banners ?? [];
  const benefits = content.details.benefits ?? [];
  const [slide, setSlide] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touching, setTouching] = useState(false);
  const paused = hovered || focused || touching;
  const reduced = useReducedMotion();
  const touch = useRef(null);
  useEffect(() => {
    if (paused || reduced || banners.length < 2) return;
    const timer = setInterval(() => setSlide(current => (current + 1) % banners.length), 6000);
    return () => clearInterval(timer);
  }, [paused, reduced, banners.length]);
  return <>
    <nav className="skyjoy-nav" aria-label={t("Chương trình SkyJoy")}><div className="container">
      <Link to="/services/skyjoy"><img src={content.image} alt="SkyJoy" width="131" height="41" /></Link>
      <a href="#skyjoy-program">{t("Chương trình hội viên")}</a><a href="#skyjoy-partners">{t("Đối tác")}</a>
      <a className="button primary" href="#skyjoy-wallet">{t("Ví điểm của tôi")}</a>
    </div></nav>
    <section className="skyjoy-carousel" aria-label={t("Ưu đãi SkyJoy tham chiếu")} aria-live={paused || reduced ? "polite" : "off"}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      onTouchStart={event => { touch.current = event.touches[0].clientX; setTouching(true); }}
      onTouchEnd={event => { const distance = touch.current === null ? 0 : touch.current - event.changedTouches[0].clientX;
        if (banners.length > 1 && Math.abs(distance) > 50) setSlide(current => (current + 1) % banners.length); touch.current = null; setTouching(false); }}
      onTouchCancel={() => { touch.current = null; setTouching(false); }}>
      <div className="skyjoy-slides">{banners.map((banner, index) => <div key={banner.image} aria-hidden={index !== slide} className={`skyjoy-slide ${index === slide ? "visible" : ""}`}>
        <img src={banner.image} alt={t("Banner chương trình đối tác SkyJoy {{index}}", { index: index + 1 })} fetchPriority={index === 0 ? "high" : "auto"} />
      </div>)}</div>
      <button className="skyjoy-prev" disabled={banners.length < 2} aria-label={t("Ưu đãi SkyJoy trước")} onClick={() => setSlide(current => (current + banners.length - 1) % banners.length)}><ChevronLeft /></button>
      <button className="skyjoy-next" disabled={banners.length < 2} aria-label={t("Ưu đãi SkyJoy tiếp")} onClick={() => setSlide(current => (current + 1) % banners.length)}><ChevronRight /></button>
      <div className="skyjoy-dots">{banners.map((banner, index) => <button key={banner.image} aria-label={t("Banner SkyJoy {{index}}", { index: index + 1 })} aria-pressed={slide === index} onClick={() => setSlide(index)} />)}</div>
    </section>
    <section className="container skyjoy-program" id="skyjoy-program"><h1>{t(content.details.heading)}</h1>
      <p>{t(content.description)}</p>
      <div className="skyjoy-benefits">{benefits.map(item => { const Icon = icons[item.icon] || Gift; return <article key={item.title}><Icon size={40} /><h2>{t(item.title)}</h2><p>{t(item.description)}</p></article>; })}</div>
      <div className="skyjoy-earn"><h2>{t("Chi tiêu hàng ngày, nhận thêm niềm vui")}</h2><p>{t("Mỗi {{spend}} chi tiêu hợp lệ nhận một điểm nội bộ. {{points}} điểm đổi voucher {{value}}; hoàn hoặc hủy được điều chỉnh điểm theo lịch sử.", { spend: money(rules.spendPerPoint), points: rules.redemptionStep, value: money(rules.redemptionStep * rules.voucherValuePerPoint) })}</p>
        <div className="actions"><Link className="button primary" to="/">{t("Đặt chuyến bay")}</Link><Link className="button secondary" to="/services/skyshop">{t("Khám phá SkyShop")}</Link>
          {!logged && <Link className="button secondary" to="/auth?returnTo=/services/skyjoy">{t("Đăng ký hoặc đăng nhập hội viên")}</Link>}</div>
      </div>
    </section>
    <section className="skyjoy-partners" id="skyjoy-partners"><div className="container"><h2>{t("Khám phá chương trình SkyJoy chính thức")}</h2>
      <p>{t("Liên kết hội viên, tích điểm SkyPoint thực và đổi quà của các thương hiệu cần kết nối GalaxyJoy. Bạn có thể xem thông tin chính thức tại trang đối tác.")}</p>
      <a className="button secondary" href={content.details.source} target="_blank" rel="noopener noreferrer">{t("Mở SkyJoy chính thức")}</a>
    </div></section>
  </>;
}
