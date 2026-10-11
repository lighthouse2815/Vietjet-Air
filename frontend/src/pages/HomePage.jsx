import { t } from "../i18n.js";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Plane,
  ShoppingBag,
  Timer,
  ShieldCheck,
  Gift,
  Ticket,
  Phone,
  Luggage,
  MapPin,
  Utensils,
  Crown,
  ArrowRight,
} from "lucide-react";
import { useApi } from "../hooks/useApi";
import { money, localDate } from "../api/client";
import { LoadingState, ErrorState } from "../components/common/States";
import HeroCarousel from "../components/home/HeroCarousel";
import BookingForm from "../components/booking/BookingForm";
const quick = [
  ["Đặt chuyến bay", "/", Plane],
  ["Mua hành lý, suất ăn, chọn chỗ", "/my-booking", Luggage],
  ["Ưu tiên làm thủ tục nhanh", "/services/priority", Timer],
  ["Hàng miễn thuế", "/services/skyshop", ShoppingBag],
  ["Bảo hiểm", "/services/insurance", ShieldCheck],
  ["Vietjet e-Voucher", "/services/voucher", Gift],
];
const faqIcons = [Plane, Phone, Luggage, MapPin, Plane, Utensils];
export default function HomePage() {
  useTranslation();
  const { data, loading, error, retry } = useApi("/home");
  if (loading)
    return (
      <div className="home-loading">
        <LoadingState label={t("Đang chuẩn bị hành trình của bạn...")} />
      </div>
    );
  if (error)
    return (
      <main className="page container">
        <ErrorState message={t(error)} retry={retry} />
      </main>
    );
  const items = (category) => data.items.filter((i) => i.category === category);
  const cards = (category) => (
    <div className="home-card-grid">
      {items(category).map((item) => (
        <Link className="home-card" key={item.id} to={item.target}>
          <h3 className="ribbon">{t(item.title)}</h3>
          <img src={item.image} alt={t(item.title)} loading="lazy" />
          <div className="card-description">
            <p>{t(item.description)}</p>
            <span>{t("Khám phá ngay ")}<ArrowRight size={14} />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
  const feature = (category) =>
    items(category).map((item) => (
      <Link
        className={`feature-banner feature-${category.toLowerCase()}`}
        key={item.id}
        to={item.target}
      >
        <h2 className="ribbon">{t(item.title)}</h2>
        <div>
          <span>{t("Bay vui cùng mỗi hành trình")}</span>
          <h3>{t(item.description)}</h3>
          <b className="button">{t("KHÁM PHÁ NGAY ")}<ArrowRight size={15} />
          </b>
        </div>
        <img src={item.image} alt={t(item.title)} loading="lazy" />
      </Link>
    ));
  return (
    <main className="home">
      <HeroCarousel banners={items("HERO")} />
      <section className="promotion-region">
        <div className="container promotion-strip">
          {data.promotions.map((p) => (
            <Link
              key={p.destination}
              to={`/flights?${new URLSearchParams({ origin: p.origin, destination: p.destination, date: p.date, type: "ONE_WAY", adults: 1, children: 0, infants: 0 })}`}
            >
              <span>{t("Từ ")}<strong>{p.originCity}</strong>
              </span>
              <div className="fare-badge">
                <small>{t("Chỉ từ")}</small>
                <b>{money(p.price).replace("₫", "")}</b>
                <i>{t("VND")}</i>
              </div>
              <span>{t("Đến ")}<strong>{p.destinationCity}</strong>
              </span>
            </Link>
          ))}
        </div>
        <div className="promotion-tagline">
          <span>{t("Cùng bạn bay tới")}</span>
          <h2>{t("NHỮNG ĐIỀU TUYỆT VỜI")}</h2>
          <p>{t("Mỗi hành trình là một câu chuyện mới.")}</p>
        </div>
      </section>
      <div className="home-cloud-background">
        <div className="container home-content">
          <div className="secondary-booking">
            <div className="secondary-tabs">
              <Link to="/my-booking">
                <Plane size={19} />{t("Mua hành lý, suất ăn chọn chỗ ngồi và hơn thế nữa...")}</Link>
              <Link to="/services/cargo">{t("Gửi hàng nhanh")}</Link>
              <Link to="/services/skyjoy">{t("Đổi thưởng và mua SkyPoint")}</Link>
              <Link to="/check-in">{t("Check-in")}</Link>
            </div>
            <BookingForm compact />
          </div>
          <div className="information-banners">
            <Link to="/services/travel-advice">
              <span>{t("KHUYẾN CÁO DI CHUYỂN")}</span>
              <p>{t("Chuẩn bị cho chuyến bay của bạn")}<br />{t("Nhập cảnh, hành lý và thông tin demo")}</p>
              <b className="button">{t("Xem ngay")}</b>
              <Plane size={90} />
            </Link>
            <Link to="/services/groups">
              <span>{t("BAY THEO ĐOÀN")}<br />{t("VUI NGẬP TRÀN")}</span>
              <p>{t("Cùng nhau khám phá những điểm đến mới")}</p>
              <img
                src="/assets/family.webp"
                alt={t("Gia đình cùng du lịch")}
                loading="lazy"
              />
            </Link>
          </div>
          <nav className="quick-access" aria-label={t("Tiện ích chuyến bay")}>
            {quick.map(([title, path, Icon], i) => (
              <Link key={title} to={path}>
                <span className={`quick-icon quick-${i}`}>
                  <Icon size={44} />
                </span>
                <strong>{t(title)}</strong>
              </Link>
            ))}
          </nav>
          {feature("FEATURE")}
          {cards("SERVICE")}
        </div>
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
                <img src={item.image} alt={t(item.title)} loading="lazy" />
                <h3>{t(item.title)}</h3>
              </Link>
            ))}
          </div>
        </section>
        <section className="faq-section">
          <h2 className="ribbon">{t("Câu hỏi thường gặp")}</h2>
          <div className="faq-categories">
            {items("FAQ").map((item, i) => {
              const Icon = faqIcons[i];
              return (
                <Link key={item.id} to={`/services/faq#${item.target}`}>
                  <Icon />
                  <span>{t(item.title)}</span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
      <section className="stats-section">
        <div className="container">
          <div className="stats-title">
            <span>{t("Cùng")}{" "}
              <b>{t("vietjet ")}<Plane size={24} />
              </b>
            </span>
            <h2>{t("BAY VÀO TƯƠNG LAI")}</h2>
            <small>{t("Số liệu minh họa giao diện tham chiếu — không phải thống kê của hệ thống demo")}</small>
          </div>
          <div className="stats-grid">
            {[
              ["120+", t("Đường bay nội địa và quốc tế")],
              ["400+", t("Chuyến bay mỗi ngày")],
              ["6000+", t("Nhân viên thân thiện, tận tình")],
              ["100+", t("Tàu bay mới hiện đại")],
              ["7★", t("Xếp hạng an toàn trong hình ảnh tham chiếu")],
            ].map(([number, text]) => (
              <div key={number}>
                <strong>{number}</strong>
                <span>{text}</span>
              </div>
            ))}
          </div>
          <div className="fly-green">{t("fly")}<span>{t("green")}</span>
            <small>{t("Bay vui · Hướng tới tương lai xanh")}</small>
          </div>
        </div>
      </section>
      <section
        className="awards container"
        aria-label={t("Thành tựu trong giao diện tham chiếu")}
      >
        {[
          t("Hàng không chi phí thấp"),
          t("Doanh nghiệp ngành hàng không"),
          t("Top công ty niêm yết"),
          t("Thương hiệu Châu Á"),
          t("Môi trường làm việc"),
          t("Phát triển bền vững"),
        ].map((label, i) => (
          <div key={label}>
            <Crown size={34} />
            <span>{t(label)}</span>
            <small>{t("Minh họa #")}{i + 1}</small>
          </div>
        ))}
      </section>
    </main>
  );
}
