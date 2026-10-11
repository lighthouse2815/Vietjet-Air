import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Users, Coins, Gift, Wallet } from "lucide-react";
import { t } from "../../i18n";
import { useReducedMotion } from "../../hooks/useReducedMotion";
const banners = ["skyjoy-banner.jpg", "skyjoy-banner-2.jpg"];
const benefits = [
  [Users, "Chương trình khách hàng thân thiết", "Tài khoản, hạng hội viên và lịch sử giao dịch trong hệ thống nội bộ."],
  [Coins, "Chi tiêu, nhận điểm thưởng", "Tích điểm từ vé, dịch vụ và đơn hàng đã thanh toán theo quy tắc nội bộ."],
  [Gift, "Đổi điểm lấy voucher", "Dùng điểm nội bộ để nhận voucher và thanh toán chuyến bay demo."],
  [Wallet, "Ví điểm của bạn", "Theo dõi số dư và các lượt cộng, trừ điểm trong tài khoản."],
];
export default function LoyaltyLanding({ logged }) {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const touch = useRef(null);
  useEffect(() => {
    if (paused || reduced) return;
    const timer = setInterval(() => setSlide(current => (current + 1) % banners.length), 6000);
    return () => clearInterval(timer);
  }, [paused, reduced]);
  return <>
    <nav className="skyjoy-nav" aria-label={t("Chương trình SkyJoy")}><div className="container">
      <Link to="/services/skyjoy"><img src="/assets/services/skyjoy-logo.png" alt="SkyJoy" width="131" height="41" /></Link>
      <a href="#skyjoy-program">{t("Chương trình hội viên")}</a><a href="#skyjoy-partners">{t("Đối tác")}</a>
      <a className="button primary" href="#skyjoy-wallet">{t("Ví điểm của tôi")}</a>
    </div></nav>
    <section className="skyjoy-carousel" aria-label={t("Ưu đãi SkyJoy tham chiếu")} aria-live={paused || reduced ? "polite" : "off"}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}
      onTouchStart={event => { touch.current = event.touches[0].clientX; setPaused(true); }}
      onTouchEnd={event => { const distance = touch.current === null ? 0 : touch.current - event.changedTouches[0].clientX;
        if (Math.abs(distance) > 50) setSlide(current => (current + 1) % banners.length); touch.current = null; setPaused(false); }}
      onTouchCancel={() => { touch.current = null; setPaused(false); }}>
      <div className="skyjoy-slides">{banners.map((banner, index) => <div key={banner} aria-hidden={index !== slide} className={`skyjoy-slide ${index === slide ? "visible" : ""}`}>
        <img src={`/assets/services/${banner}`} alt={t("Banner chương trình đối tác SkyJoy {{index}}", { index: index + 1 })} fetchPriority={index === 0 ? "high" : "auto"} />
      </div>)}</div>
      <button className="skyjoy-prev" aria-label={t("Ưu đãi SkyJoy trước")} onClick={() => setSlide(current => (current + banners.length - 1) % banners.length)}><ChevronLeft /></button>
      <button className="skyjoy-next" aria-label={t("Ưu đãi SkyJoy tiếp")} onClick={() => setSlide(current => (current + 1) % banners.length)}><ChevronRight /></button>
      <div className="skyjoy-dots">{banners.map((banner, index) => <button key={banner} aria-label={t("Banner SkyJoy {{index}}", { index: index + 1 })} aria-pressed={slide === index} onClick={() => setSlide(index)} />)}</div>
    </section>
    <section className="container skyjoy-program" id="skyjoy-program"><h1>{t("SkyJoy · Tích điểm, đổi niềm vui")}</h1>
      <p>{t("Chương trình nội bộ dành cho trải nghiệm demo. Banner giới thiệu chương trình của đối tác; ví bên dưới sử dụng điểm riêng của hệ thống.")}</p>
      <div className="skyjoy-benefits">{benefits.map(([Icon, heading, description]) => <article key={heading}><Icon size={40} /><h2>{t(heading)}</h2><p>{t(description)}</p></article>)}</div>
      <div className="skyjoy-earn"><h2>{t("Chi tiêu hàng ngày, nhận thêm niềm vui")}</h2><p>{t("Mỗi 10.000đ chi tiêu hợp lệ nhận một điểm nội bộ. 100 điểm đổi voucher 100.000đ; các giao dịch hoàn hoặc hủy được điều chỉnh điểm theo lịch sử.")}</p>
        <div className="actions"><Link className="button primary" to="/">{t("Đặt chuyến bay")}</Link><Link className="button secondary" to="/services/skyshop">{t("Khám phá SkyShop")}</Link>
          {!logged && <Link className="button secondary" to="/auth?returnTo=/services/skyjoy">{t("Đăng ký hoặc đăng nhập hội viên")}</Link>}</div>
      </div>
    </section>
    <section className="skyjoy-partners" id="skyjoy-partners"><div className="container"><h2>{t("Khám phá chương trình SkyJoy chính thức")}</h2>
      <p>{t("Liên kết hội viên, tích điểm SkyPoint thực và đổi quà của các thương hiệu cần kết nối GalaxyJoy. Bạn có thể xem thông tin chính thức tại trang đối tác.")}</p>
      <a className="button secondary" href="https://skyjoy.vietjetair.com/" target="_blank" rel="noopener noreferrer">{t("Mở SkyJoy chính thức")}</a>
    </div></section>
  </>;
}
