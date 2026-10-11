import { useEffect, useState, useRef } from "react";
import BookingForm from "../booking/BookingForm";
export default function HeroCarousel({ banners }) {
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
      className="hero"
      aria-label="Ưu đãi chuyến bay"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
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
        {banners.map((banner, i) => (
          <div
            key={banner.id}
            aria-hidden={i !== slide}
            className={`hero-slide ${i === slide ? "visible" : ""} slide-${i}`}
            style={{ backgroundImage: `url(${banner.image})` }}
          />
        ))}
      </div>
      <div className="container hero-container">
        <div className="hero-copy">
          <span className="hero-brand">
            vietjet<span>Air</span>
            <small>.com</small>
            <i>|</i> KHÁM PHÁ
          </span>
          <h1>{banners[slide]?.title}</h1>
          <p>{banners[slide]?.description}</p>
        </div>
        <div className="hero-booking">
          <BookingForm />
        </div>
        <div className="carousel-dots" role="group" aria-label="Chọn banner">
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
