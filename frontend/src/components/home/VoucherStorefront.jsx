import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Gift, Ticket, X } from "lucide-react";
import { t } from "../../i18n";
import { money } from "../../api/client";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { LoadingState, ErrorState } from "../common/States";
import "../../styles/voucher.css";

const values = [100000, 200000, 500000, 1000000, 2000000];
const banners = [
  ["hero-menas.jpg", "Ưu đãi e-Voucher Menas"],
  ["hero-guide.jpg", "Hướng dẫn sử dụng e-Voucher"],
  ["hero-combo.jpg", "Combo vé máy bay và khách sạn"],
];
const combos = [
  ["TPHCM - Nha Trang | 3N2D Vinpearl Empire Nha Trang", "hotel-hoi-an.png"],
  ["TPHCM - Nha Trang | 3N2D Vinpearl Beachfront Nha Trang", "hotel-beachfront.png"],
  ["TPHCM - Nha Trang | 3N2D Vinpearl Hòn Tằm Nha Trang", "hotel-hon-tam.png"],
  ["Hà Nội - Đà Nẵng | 3N2D Vinpearl Resort & Golf Nam Hội An", "hotel-hoi-an.png"],
  ["TPHCM - Đà Nẵng | 3N2D Vinpearl Resort & Golf Nam Hội An", "hotel-hoi-an.png"],
  ["TPHCM - Phú Quốc | 3N2D Vinpearl Resort & Spa Phú Quốc", "hotel-phu-quoc.png"],
  ["TPHCM - Nha Trang | 3N2D Vinpearl Resort Nha Trang", "hotel-nha-trang.png"],
  ["Hải Phòng - Nha Trang | 3N2D Vinpearl Empire Nha Trang", "hotel-empire.png"],
];
const statuses = ["PENDING", "FAILED", "ACTIVE", "CANCELLED", "EXPIRED"];

export default function VoucherStorefront({ records, send, pay, logged, busy, error, message }) {
  useTranslation();
  const { hash } = useLocation();
  const reducedMotion = useReducedMotion();
  const [slide, setSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const touch = useRef(null), dialog = useRef(null);
  const [detail, setDetail] = useState(null);
  const [value, setValue] = useState(() => {
    const saved = Number(sessionStorage.getItem("evoucher-value"));
    return values.includes(saved) ? saved : values[0];
  });
  const [query, setQuery] = useState(""), [status, setStatus] = useState("");
  const user = (() => { try { return JSON.parse(sessionStorage.getItem("demo-user") || "{}"); } catch { return {}; } })();
  useEffect(() => { sessionStorage.setItem("evoucher-value", String(value)); }, [value]);
  useEffect(() => {
    if (paused || reducedMotion) return;
    const nextDirection = slide === 0 ? 1 : slide === banners.length - 1 ? -1 : direction;
    const timer = setTimeout(() => { setSlide(slide + nextDirection); setDirection(nextDirection); }, 5000);
    return () => clearTimeout(timer);
  }, [paused, reducedMotion, slide, direction]);
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: "start" });
  }, [hash]);
  function open(item) { setDetail(item); dialog.current.showModal(); }
  function choose(amount) {
    setValue(amount); dialog.current.close();
    document.getElementById("evoucher-buy")?.scrollIntoView({ block: "start" });
  }
  function finishTouch(event) {
    if (event.type === "touchend" && touch.current !== null) {
      const distance = touch.current - event.changedTouches[0].clientX;
      if (Math.abs(distance) > 60) setSlide(current => Math.max(0, Math.min(banners.length - 1, current + (distance > 0 ? 1 : -1))));
    }
    touch.current = null;
    setPaused(event.currentTarget.contains(document.activeElement) || event.currentTarget.matches(":hover"));
  }
  function providerCard([name, image], gift = false) {
    const item = { name, image, provider: true };
    return <article className="evoucher-card" key={name}>
      <img src={`/assets/evoucher/${image}`} alt="" loading="lazy" width="300" height="192" />
      <h3>{t(name)}</h3>{gift && <p className="evoucher-gift"><Gift size={16} />{t("Quà tặng đối tác")}</p>}
      <p className="evoucher-price-note">{t("Chờ tích hợp nhà cung cấp")}</p>
      <div className="evoucher-card-actions"><button onClick={() => open(item)}>{t("Xem nhanh")}</button><button onClick={() => open(item)}>{gift ? t("Thông tin ưu đãi") : t("Chi tiết")}</button></div>
    </article>;
  }
  const filtered = (records.data || []).filter(voucher => (!status || voucher.status === status)
    && `${voucher.code} ${voucher.recipientEmail}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  return <main className="evoucher-page" onLoadCapture={event => { if (event.target.tagName === "IMG") event.target.classList.add("evoucher-image-loaded"); }}>
    <div className="evoucher-catalog">
    <div className="evoucher-container">
      <h1 className="evoucher-title">e-Voucher</h1>
      <section className="evoucher-banner" aria-label={t("Ưu đãi e-Voucher")}
        onMouseEnter={() => setPaused(true)} onMouseLeave={event => setPaused(touch.current !== null || event.currentTarget.contains(document.activeElement))}
        onFocusCapture={() => setPaused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(touch.current !== null || event.currentTarget.matches(":hover")); }}
        onTouchStart={event => { touch.current = event.touches[0].clientX; setPaused(true); }}
        onTouchEnd={finishTouch} onTouchCancel={finishTouch}>
        <div className="evoucher-banner-track" aria-live={paused || reducedMotion ? "polite" : "off"} aria-atomic="true" style={{ transform: `translateX(-${slide * 100}%)` }}>
          {banners.map(([image, label], index) => <a key={image} aria-hidden={index !== slide} tabIndex={index === slide ? 0 : -1}
            href={index === 1 ? "#evoucher-terms" : index === 2 ? "#evoucher-combos" : "#evoucher-gratitude"}>
            <img src={`/assets/evoucher/${image}`} alt={t(label)} width="1200" height="400" fetchPriority={index === 0 ? "high" : "auto"} />
          </a>)}
        </div>
        <div className="evoucher-dots" role="group" aria-label={t("Chọn banner")}>{banners.map((_, index) => <button key={index} aria-label={`Banner ${index + 1}`} aria-pressed={slide === index} onClick={() => setSlide(index)} />)}</div>
      </section>
      <section className="evoucher-section evoucher-combos" id="evoucher-combos">
        <div className="evoucher-section-heading"><h2>{t("Gói Combo vé máy bay và khách sạn")}</h2><Link to="/services/hotels">{t("Xem thêm")} ›</Link></div>
        <div className="evoucher-grid">{combos.map(item => providerCard(item))}</div>
      </section>
      <section className="evoucher-section" id="evoucher-welcome">
        <div className="evoucher-section-heading"><h2>{t("Chào Mừng Thành Viên Mới")}</h2><Link to="/services/support">{t("Xem thêm")} ›</Link></div>
        <div className="evoucher-grid">{providerCard(["Ưu đãi độc quyền cho Hiệp hội Học giả & Chuyên gia Việt Nam - Australia", "welcome.jpg"], true)}</div>
      </section>
      <section className="evoucher-section" id="evoucher-gratitude">
        <div className="evoucher-section-heading"><h2>{t("Tri Ân Khách Hàng")}</h2><Link to="/services/support">{t("Xem thêm")} ›</Link></div>
        <div className="evoucher-grid">{[
          ["e-Voucher Menas cho khách nối chuyến Quốc nội - Quốc tế tại SGN", "menas-300.jpg"],
          ["e-Voucher Menas cho khách nối chuyến Quốc tế - Quốc tế tại SGN", "menas-500.jpg"],
        ].map(item => providerCard(item, true))}</div>
      </section>
    </div>
    </div>
    <div className="evoucher-container">
      <section className="evoucher-section evoucher-denominations" id="evoucher-values">
        <div className="evoucher-section-heading"><h2>{t("e-Voucher chuyến bay nội bộ")}</h2><a href="#evoucher-buy">{t("Mua hoặc tặng voucher")} ›</a></div>
        <div className="evoucher-grid">{values.map(amount => <article className="evoucher-card" key={amount}>
          <div className="evoucher-art"><Ticket size={40} /><span>e-Voucher</span><strong>{money(amount)}</strong></div>
          <h3>{t("e-Voucher chuyến bay")} · {money(amount)}</h3><p className="evoucher-price-note">{t("Dùng cho booking nội bộ")}</p>
          <div className="evoucher-card-actions"><button onClick={() => open({ name: "e-Voucher chuyến bay", value: amount })}>{t("Xem nhanh")}</button><button onClick={() => choose(amount)}>{t("Chọn mệnh giá")}</button></div>
        </article>)}</div>
      </section>
      <section className="panel evoucher-buy" id="evoucher-buy">
        <div className="actions"><Link className="button secondary" to="/services/skyshop">{t("Cửa hàng")}</Link><Link className="button secondary" to="/services/voucher">{t("Voucher")}</Link><Link className="button secondary" to="/services/skyjoy">{t("Điểm thưởng")}</Link></div>
        <h2>{t("Mua hoặc tặng voucher")}</h2>
        {error && <ErrorState message={t(error)} />}{message && <p role="status" className="notice-panel">{t(message)}</p>}
        <form onSubmit={event => {
          event.preventDefault();
          if (!logged) return;
          const data = Object.fromEntries(new FormData(event.currentTarget));
          send("/commerce/account/vouchers", { ...data, value: Number(data.value), requestKey: crypto.randomUUID() }, t("Đã tạo đơn voucher. Thanh toán để phát hành."));
        }}>
          <div className="form-grid"><label>{t("Mệnh giá")}<select name="value" aria-label={t("Mệnh giá")} value={value} onChange={event => setValue(Number(event.target.value))}>{values.map(amount => <option key={amount} value={amount}>{money(amount)}</option>)}</select></label>
          <label>{t("Email người nhận")}<input name="recipientEmail" type="email" required maxLength="255" defaultValue={user?.email || ""} autoComplete="email" /></label></div>
          <p>{t("Voucher hiệu lực một năm từ phát hành, được dùng cho thanh toán booking. Điểm không được cộng khi mua voucher.")}</p>
          {logged ? <button className="button primary" disabled={busy}>{t("Tạo đơn voucher")}</button> : <Link className="button primary" to="/auth">{t("Đăng nhập để mua voucher")}</Link>}
        </form>
      </section>
      <section className="panel evoucher-records" id="evoucher-records">
        <h2>{t("Voucher đã mua hoặc nhận")}</h2>
        {!logged ? <p><Link to="/auth">{t("Đăng nhập")}</Link> · {t("Tra cứu voucher trong tài khoản của bạn.")}</p> : <>
          <div className="form-grid"><label>{t("Tìm voucher")}<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={t("Mã voucher hoặc email người nhận")} /></label>
          <label>{t("Trạng thái voucher")}<select aria-label={t("Trạng thái voucher")} value={status} onChange={event => setStatus(event.target.value)}><option value="">{t("Tất cả")}</option>{statuses.map(state => <option key={state} value={state}>{t(state)}</option>)}</select></label></div>
          {records.loading ? <LoadingState /> : records.error ? <ErrorState message={records.error} retry={records.retry} /> : !filtered.length ? <p>{t("Không có voucher phù hợp.")}</p> : filtered.map(voucher => <article className="evoucher-record" key={voucher.id}>
            <h3>Voucher {voucher.code}</h3><p>{t(voucher.status)} · <strong>{money(voucher.value)}</strong></p>
            <p>{t("Người nhận ")}{voucher.recipientEmail} · {t("Số dư ")}{money(voucher.balance)}</p>
            <p>{["PENDING", "FAILED"].includes(voucher.status) ? t("Đơn voucher giữ trong 15 phút, thanh toán để phát hành.") : <>{t("Hạn ")}{new Date(voucher.expiresAt).toLocaleDateString()}</>}</p>
            <div className="actions">
              {voucher.purchased && ["PENDING", "FAILED"].includes(voucher.status) && <><button className="button primary" disabled={busy} onClick={() => pay("vouchers", voucher.id, "SUCCESS")}>{t("Thanh toán thành công")}</button><button className="button secondary" disabled={busy} onClick={() => pay("vouchers", voucher.id, "FAILED")}>{t("Thử thất bại")}</button></>}
              {voucher.purchased && !voucher.reward && (["PENDING", "FAILED"].includes(voucher.status) || voucher.status === "ACTIVE" && voucher.balance === voucher.value) && <button className="button secondary" disabled={busy} onClick={() => send(`/commerce/account/vouchers/${voucher.id}/cancel`, {}, t("Đã hủy theo điều kiện demo."))}>{t("Hủy voucher chưa sử dụng")}</button>}
              {voucher.status === "ACTIVE" && voucher.balance > 0 && voucher.recipientEmail.toLowerCase() === user?.email?.toLowerCase() && <Link className="button primary" to="/">{t("Đặt chuyến bay")}</Link>}
            </div>
          </article>)}
        </>}
      </section>
      <section className="panel evoucher-terms" id="evoucher-terms">
        <h2>{t("Điều kiện voucher nội bộ")}</h2>
        <p>{t("Mệnh giá từ 100.000đ đến 2.000.000đ. Voucher chỉ có giá trị trong hệ thống demo.")}</p>
        <p>{t("Chỉ người mua thanh toán hoặc hủy voucher chưa sử dụng. Người nhận đăng nhập bằng email đã chỉ định để dùng số dư khi thanh toán booking.")}</p>
        <p>{t("Đơn voucher giữ trong 15 phút, thanh toán để phát hành.")}</p>
        <p>{t("Voucher hiệu lực một năm từ phát hành, được dùng cho thanh toán booking. Điểm không được cộng khi mua voucher.")}</p>
        <p>{t("Combo khách sạn, quà Menas và ưu đãi đối tác đang chờ tích hợp. Email thật chưa được gửi; voucher được lưu trong tài khoản nội bộ.")}</p>
        <Link to="/services/support">{t("Liên hệ hỗ trợ")}</Link>
      </section>
    </div>
    <dialog ref={dialog} className="evoucher-dialog" aria-labelledby="evoucher-detail-title" onClick={event => { if (event.target === event.currentTarget) dialog.current.close(); }}>
      <button className="evoucher-dialog-close" aria-label={t("Đóng chi tiết")} onClick={() => dialog.current.close()}><X /></button>
      {detail && <><h2 id="evoucher-detail-title">{t(detail.name)}</h2>{detail.image && <img src={`/assets/evoucher/${detail.image}`} alt="" />}
        {detail.provider ? <><p>{t("Dịch vụ đang chờ tích hợp nhà cung cấp.")}</p><p>{t("Ảnh và tên gói tham chiếu; chưa xác nhận giá, điều kiện nhận quà hoặc khả năng đặt dịch vụ thật.")}</p><Link className="button secondary" to="/services/support">{t("Liên hệ hỗ trợ")}</Link></> : <><strong className="evoucher-detail-value">{money(detail.value)}</strong><p>{t("Dùng cho booking nội bộ")}</p><button className="button primary" onClick={() => choose(detail.value)}>{t("Chọn mệnh giá")}</button></>}
      </>}
    </dialog>
  </main>;
}
