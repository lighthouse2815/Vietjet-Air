import { t } from "../i18n.js";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Plane, ArrowRight } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { money, localDate } from "../api/client";
import { LoadingState, ErrorState } from "../components/common/States";
import HeroCarousel from "../components/home/HeroCarousel";
import ScrollCarousel from "../components/home/ScrollCarousel";
import StatsSection from "../components/home/StatsSection";
import BookingForm from "../components/booking/BookingForm";
import { getContentArtwork } from "../components/home/artwork";
export default function HomePage() {
  useTranslation();
  const { data, loading, error, retry } = useApi("/home");
  const content = useApi("/content/pages/home");
  if (loading || content.loading)
    return (
      <div className="home-loading">
        <LoadingState label={t("Đang chuẩn bị hành trình của bạn...")} />
      </div>
    );
  if (error || content.error)
    return (
      <main className="page container">
        <ErrorState message={t(error || content.error)} retry={error ? retry : content.retry} />
      </main>
    );
  const page = content.data.details;
  const items = (category) => data.items.filter((i) => i.category === category);
  const cards = (category) => (
    <div className={`home-card-grid cards-${category.toLowerCase()}`}>
      {items(category).map((item) => (
        <Link className="home-card" key={item.id} to={item.target}>
          <h3 className="ribbon">{t(item.title)}</h3>
          <img
            src={getContentArtwork(item)?.[0] || item.image}
            alt={t(item.title)}
            loading="lazy"
          />
          <div className="card-description">
            <p>{t(item.description)}</p>
            <span>
              {t("Khám phá ngay ")}
              <ArrowRight size={14} />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
  const feature = (category) =>
    items(category).map((item) => {
      const artwork = getContentArtwork(item);
      return (
        <Link
          className={`feature-banner feature-${category.toLowerCase()} ${artwork ? "has-artwork" : ""}`}
          key={item.id}
          to={item.target}
        >
          <h2 className="ribbon">
            {t(
              artwork && item.details.displayTitle
                ? item.details.displayTitle
                : item.title,
            )}
          </h2>
          {!artwork && (
            <div>
              <span>{t("Bay vui cùng mỗi hành trình")}</span>
              <h3>{t(item.description)}</h3>
              <b className="button">
                {t("KHÁM PHÁ NGAY ")}
                <ArrowRight size={15} />
              </b>
            </div>
          )}
          <picture>
            {artwork?.[1] && (
              <source media="(max-width: 900px)" srcSet={artwork[1]} />
            )}
            <img
              src={artwork?.[0] || item.image}
              alt={t(item.title)}
              loading="lazy"
            />
          </picture>
        </Link>
      );
    });
  return (
    <main
      className="home"
      onLoadCapture={(event) => {
        if (event.target.tagName === "IMG")
          event.target.classList.add("home-image-loaded");
      }}
    >
      <HeroCarousel banners={items("HERO")} />
      <section className="promotion-region">
        <ScrollCarousel
          className="container promotion-strip"
          label={t("Vé khuyến mãi")}
        >
          {data.promotions.map((p) => (
            <Link
              key={p.destination}
              to={`/flights?${new URLSearchParams({ origin: p.origin, destination: p.destination, date: p.date, type: "ONE_WAY", adults: 1, children: 0, infants: 0 })}`}
            >
              <span>
                {t("Từ ")}
                <strong>{p.originCity}</strong>
              </span>
              <div className="fare-badge">
                <small>{t("Chỉ từ")}</small>
                <b>{money(p.price).replace("₫", "")}</b>
                <i>{t("VND")}</i>
              </div>
              <span>
                {t("Đến ")}
                <strong>{p.destinationCity}</strong>
              </span>
            </Link>
          ))}
        </ScrollCarousel>
      </section>
      <div className="home-cloud-background">
        <div className="container home-content">
          <div className="secondary-booking">
            <div className="secondary-tabs">
              <Link to="/my-booking">
                <Plane size={19} />
                {t("Mua hành lý, suất ăn chọn chỗ ngồi và hơn thế nữa...")}
              </Link>
              <Link to="/services/cargo">{t("Gửi hàng nhanh")}</Link>
              <Link to="/services/skyjoy">
                {t("Đổi thưởng và mua SkyPoint")}
              </Link>
              <Link to="/check-in">{t("Check-in")}</Link>
            </div>
            <BookingForm compact />
          </div>
          <div className="information-banners">{(page.informationBanners ?? []).map(item => <Link key={item.target} to={item.target} aria-label={t(item.title)}><img src={item.image} alt={t(item.title)} loading="lazy" /></Link>)}</div>
          <nav className="quick-access" aria-label={t("Tiện ích chuyến bay")}>{(page.quick ?? []).map(item => <Link key={item.target} to={item.target}><img className="quick-icon" src={item.image} alt="" loading="lazy" /><strong>{t(item.title)}</strong></Link>)}</nav>
          {feature("FEATURE")}
          {cards("SERVICE")}
        </div>
        <div className="container home-content lower-content">
          {feature("SHOP")}
          {cards("TRAVEL")}
          <section className="destination-section">
            <h2 className="ribbon">{t("Điểm đến hấp dẫn")}</h2>
            <div className="destination-grid">
              {items("DESTINATION").map((item) => (
                <Link
                  key={item.id}
                  to={`/flights?${new URLSearchParams({ origin: item.target === "SGN" ? "HAN" : "SGN", destination: item.target, date: localDate(1), type: "ONE_WAY", adults: 1, children: 0, infants: 0 })}`}
                >
                  <img
                    src={getContentArtwork(item)?.[0] || item.image}
                    alt={t(item.title)}
                    loading="lazy"
                  />
                  <h3>{t(item.title)}</h3>
                </Link>
              ))}
            </div>
          </section>
          <section className="faq-section">
            <h2 className="ribbon">{t("Câu hỏi thường gặp")}</h2>
            <div className="faq-categories">
              {items("FAQ").map((item) => (
                <Link key={item.id} to={`/services/faq#${item.target}`}>
                  {item.details.artwork?.[0] ? (
                    <img
                      src={item.details.artwork[0]}
                      alt={t(item.title)}
                      loading="lazy"
                    />
                  ) : (
                    <span className="faq-custom">{t(item.title)}</span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
      <StatsSection />
    </main>
  );
}
