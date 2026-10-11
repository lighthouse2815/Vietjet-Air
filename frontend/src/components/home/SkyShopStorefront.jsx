import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, ShoppingCart, Package, Plane, Gift, Home, X } from "lucide-react";
import { t } from "../../i18n";
import { money } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import ScrollCarousel from "./ScrollCarousel";
import { LoadingState, ErrorState } from "../common/States";

export default function SkyShopStorefront({ content, quantityLimit, products, bookings, cart, setCart, bookingCode, setBookingCode, logged }) {
  useTranslation();
  const categories = (content.details.categories ?? []).map(item => [item.code, item.title, item.image]);
  const serviceImages = content.details.serviceImages ?? {};
  const services = useApi("/ancillary-services");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [delivery, setDelivery] = useState("ALL");
  const [searchOpen, setSearchOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const dialog = useRef(null);
  const confirmed = (bookings.data || []).filter(booking => booking.canPurchaseServices);
  const chosenBooking = confirmed.find((booking) => booking.code === bookingCode);
  const serviceTarget = (item) => chosenBooking
    ? `/my-booking/${chosenBooking.code}/manage?service=${item.id}#services` : "/my-booking";
  function rememberBooking() {
    if (chosenBooking) sessionStorage.setItem(`booking-token-${chosenBooking.code}`, chosenBooking.accessToken);
  }
  const rows = [
    ...(services.data || []).map((service) => ({ ...service, key: `service-${service.id}`, service: true })),
    ...(products.data || []).map((product) => ({ ...product, key: `product-${product.id}`, category: "SHOP" })),
  ];
  const filtered = rows.filter((row) => (!category || row.category === category)
    && (delivery !== "PICKUP" || !row.service)
    && `${t(row.name)} ${t(row.description)}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const loading = products.loading || services.loading;
  const count = Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  function choose(value) {
    setCategory(value);
    document.getElementById("skyshop-products")?.scrollIntoView({ block: "start" });
  }
  function open(item) {
    setDetail(item);
    dialog.current.showModal();
  }
  function artwork(item) {
    const image = serviceImages[item.code];
    return image ? <img src={image} alt="" loading="lazy" width="446" height="446" />
      : <div className="skyshop-product-illustration">{item.service ? <Plane /> : <Gift />}</div>;
  }
  function card(item, featured = false) {
    return <article className="panel skyshop-card" key={item.key}>
      <button className="skyshop-card-image" aria-label={t("Xem chi tiết {{name}}", { name: t(item.name) })} onClick={() => open(item)}>{artwork(item)}</button>
      <div className="skyshop-card-body">
        <h3>{t(item.name)}</h3><p>{t(item.description)}</p>
        <strong className="skyshop-price">{money(item.price)}</strong>
        {!item.service && !featured ? <>
          <small>{t("Còn {{count}} sản phẩm", { count: item.stock })}</small>
          <label>{t("Số lượng")}<input type="number" min="0" max={Math.min(quantityLimit, item.stock)} disabled={!item.stock}
            value={cart[item.id] || 0} onChange={(event) => setCart((current) => ({ ...current,
              [item.id]: Math.max(0, Math.min(quantityLimit, item.stock, Math.trunc(Number(event.target.value)) || 0)),
            }))} /></label>
        </> : <Link className="skyshop-service-link" to={serviceTarget(item)} onClick={rememberBooking}>{chosenBooking ? t("Mua thêm dịch vụ") : t("Chọn chuyến bay")} <Plane size={16} /></Link>}
        <button className="skyshop-detail-button" onClick={() => open(item)}>{t("Xem chi tiết")}</button>
      </div>
    </article>;
  }
  return <>
    <section className="skyshop-hero" aria-label={t("SkyShop – mua sắm trên chuyến bay")}>
      <h1 className="skyshop-title">{t(content.title)}</h1>
      <a href="#skyshop-products"><picture>
        <source media="(max-width: 767px)" srcSet={content.details.mobileImage} />
        <img className="skyshop-hero-image" src={content.image} alt={t("Bay khắp thế giới, mua sắm kiểu mới")} fetchPriority="high" />
      </picture></a>
      <div className="skyshop-banner-dot" aria-hidden="true" />
      <img className="skyshop-cloud-edge" src="/assets/skyshop/cloud-header.svg" alt="" />
    </section>
    <div className="skyshop-toolbar">
      <div className="container">
        <a className="skyshop-home" href="#skyshop-products"><Home size={20} /><span>Skyshop</span></a>
        <label className="skyshop-delivery">{t("Phương thức giao hàng")}<select aria-label={t("Phương thức giao hàng")} value={delivery} onChange={(event) => setDelivery(event.target.value)}>
          <option value="ALL">{t("Tất cả")}</option><option value="ON_BOARD">{t("Nhận theo chuyến bay")}</option><option value="PICKUP">{t("Nhận tại quầy demo")}</option>
        </select></label>
        <button className="skyshop-search-toggle" aria-label={t("Tìm kiếm sản phẩm")} aria-expanded={searchOpen} onClick={() => setSearchOpen(!searchOpen)}><Search size={22} /></button>
        <label className={`skyshop-search ${searchOpen ? "open" : ""}`}><Search size={22} /><input type="search" aria-label={t("Tìm kiếm sản phẩm")} placeholder={t("Tìm kiếm theo tên sản phẩm, dịch vụ")} value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <label className="skyshop-flight">{t("Mã đặt chỗ")}<select aria-label={t("Chọn chuyến bay SkyShop")} value={bookingCode} onChange={(event) => setBookingCode(event.target.value)}>
          <option value="">{t("Chọn chuyến bay")}</option>{confirmed.map((booking) => <option key={booking.id} value={booking.code}>{booking.code} · {booking.segments.map((s) => s.flight.flightNumber).join(" / ")}</option>)}
        </select></label>
        <a className="skyshop-orders" href="#skyshop-orders"><Package size={20} /><span>{t("Đơn hàng SkyShop")}</span></a>
        <a className="skyshop-cart-link" href="#skyshop-cart" aria-label={t("Giỏ hàng: {{count}} sản phẩm", { count })}><ShoppingCart size={26} /><span>{count}</span></a>
      </div>
    </div>
    <div className="container skyshop-store">
      <ScrollCarousel className="skyshop-categories" label={t("Danh mục SkyShop")}>
        {categories.map(([id, label, image]) => <button key={id} className={category === id ? "selected" : ""}
          onClick={() => ["ESIM", "TAXI"].includes(id) ? open({ name: label, provider: true }) : choose(id)}>
          {image ? <img src={image} alt="" width="52" height="52" /> : <Gift size={52} />}<span>{t(label)}</span>
        </button>)}
      </ScrollCarousel>
      {bookings.error && <ErrorState message={bookings.error} retry={bookings.retry} />}
      {!query && !category && delivery === "ALL" && !loading && !services.error && <section className="skyshop-featured">
        <div className="skyshop-section-heading"><h2>{t("Dịch vụ nổi bật")}</h2><button onClick={() => choose("")}>{t("Xem tất cả")} <span aria-hidden="true">›</span></button></div>
        <ScrollCarousel className="skyshop-featured-products" label={t("Dịch vụ nổi bật")}>
          {categories.flatMap(([id]) => rows.filter((item) => item.service && item.category === id)).slice(0, 5).map((item) => card(item, true))}
        </ScrollCarousel>
      </section>}
      <section className="skyshop-catalog" id="skyshop-products">
        <div className="skyshop-section-heading"><h2>{t(categories.find(([id]) => id === category)?.[1] || "Khám phá SkyShop")}</h2><button onClick={() => { setQuery(""); choose(""); }}>{t("Xem tất cả")} <span aria-hidden="true">›</span></button></div>
        {loading ? <LoadingState /> : <>
          {products.error && <ErrorState message={products.error} retry={products.retry} />}
          {services.error && <ErrorState message={services.error} retry={services.retry} />}
          {!filtered.length && !products.error && !services.error && <p className="skyshop-empty" role="status">{t("Không tìm thấy sản phẩm phù hợp.")}</p>}
          {categories.filter(([id]) => filtered.some((item) => item.category === id)).map(([id, label]) => <section className="skyshop-category-section" key={id}>
            {!category && <h2>{t(label)}</h2>}<div className="skyshop-product-grid">{filtered.filter((item) => item.category === id).map((item) => card(item))}</div>
          </section>)}
          {filtered.some((item) => item.category === "PRIORITY") && <section className="skyshop-category-section"><h2>{t("Ưu tiên làm thủ tục")}</h2><div className="skyshop-product-grid">{filtered.filter((item) => item.category === "PRIORITY").map((item) => card(item))}</div></section>}
        </>}
      </section>
      <p className="skyshop-demo-note">{t("Ảnh minh họa tham chiếu. Giá, tồn kho và giao dịch dùng dữ liệu nội bộ của bản demo.")}</p>
    </div>
    <dialog ref={dialog} className="skyshop-dialog" aria-labelledby="skyshop-detail-title" onClick={(event) => { if (event.target === event.currentTarget) dialog.current.close(); }}>
      <button className="skyshop-dialog-close" aria-label={t("Đóng chi tiết")} onClick={() => dialog.current.close()}><X /></button>
      {detail && <div className="skyshop-detail-content">
        {!detail.provider && artwork(detail)}<h2 id="skyshop-detail-title">{t(detail.name)}</h2>
        {detail.provider ? <><p>{t("Dịch vụ đang chờ tích hợp nhà cung cấp.")}</p><Link className="button secondary" to="/services/support">{t("Liên hệ hỗ trợ")}</Link></> : <>
          <p>{t(detail.description)}</p><strong className="skyshop-price">{money(detail.price)}</strong>
          {detail.service ? <Link className="button primary" to={serviceTarget(detail)} onClick={() => {
            rememberBooking();
            dialog.current.close();
          }}>{chosenBooking ? t("Mua thêm dịch vụ") : t("Chọn chuyến bay")}</Link>
            : <button className="button primary" disabled={!detail.stock} onClick={() => {
              setCart((current) => ({ ...current, [detail.id]: Math.min(quantityLimit, detail.stock, (current[detail.id] || 0) + 1) }));
              dialog.current.close(); document.getElementById("skyshop-cart")?.scrollIntoView({ block: "start" });
            }}>{t("Thêm vào giỏ hàng")}</button>}
        </>}
        {!logged && !detail.provider && <small>{t("Đăng nhập để thanh toán đơn hàng nội bộ.")}</small>}
      </div>}
    </dialog>
  </>;
}
