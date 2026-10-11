import { t } from "../../i18n.js";
import { useTranslation } from "react-i18next";
import { useEffect, useState, useRef } from "react";
import BookingForm from "../booking/BookingForm";
import { getHeroArtwork } from "./artwork";
export default function HeroCarousel({ banners }) {
  useTranslation();
  const [slide, setSlide] = useState(0);
  const touch = useRef(null);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (
      paused ||
      banners.length < 2 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const timer = setInterval(
      () => setSlide((i) => (i + 1) % banners.length),
      6000,
    );
    return () => clearInterval(timer);
  }, [banners.length, paused]);
  return (
    <section
      className={`hero ${slide === 0 ? "campaign" : ""}`}
      aria-label={t("Ưu đãi chuyến bay")}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        if (e.target.closest(".booking-widget")) {
          touch.current = null;
          return;
        }
        touch.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touch.current !== null) {
          const diff = touch.current - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 60)
            setSlide(
              (i) => (i + (diff > 0 ? 1 : banners.length - 1)) % banners.length,
            );
        }
        touch.current = null;
      }}
    >
      <div className="hero-images">
        {banners.map((banner, i) => {
          const artwork = getHeroArtwork(banner.image);
          return (
          <div
            key={banner.id}
            aria-hidden={i !== slide}
            className={`hero-slide ${i === slide ? "visible" : ""} slide-${i}`}
            style={{
              "--desktop-image": `url(${artwork?.[0] || banner.image})`,
              "--mobile-image": `url(${artwork?.[1] || banner.image})`,
              backgroundImage: "var(--hero-image)",
            }}
          />
          );
        })}
      </div>
      <div className="container hero-container">
        <div className={`hero-copy ${slide === 0 ? "campaign-copy" : ""} ${getHeroArtwork(banners[slide]?.image) ? "with-artwork" : ""}`}>
          <span className="hero-brand">{t("vietjet")}<span>{t("Air")}</span>
            <small>{t(".com")}</small>
            <i>|</i>{t(" KHÁM PHÁ")}</span>
          <h1>{t(banners[slide]?.title)}</h1>
          <p>{t(banners[slide]?.description)}</p>
        </div>
        <div className="hero-booking">
          <BookingForm />
        </div>
        <div className="carousel-dots" role="group" aria-label={t("Chọn banner")}>
          {banners.map((banner, i) => (
            <button
              key={banner.id}
              aria-label={`Banner ${i + 1}`}
              aria-pressed={slide === i}
              onClick={() => setSlide(i)}
            />
          ))}
        </div>
      </div>
      <div className="cloud-edge" />
    </section>
  );
}
