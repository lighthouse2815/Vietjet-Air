import { t } from "../../i18n";
import { useTranslation } from "react-i18next";

export default function StatsSection({ className = "" }) {
  useTranslation();
  return (
    <section className={`stats-section ${className}`}>
      <div className="container">
        <div className="stats-title">
          <img
            src="/assets/reference/stats-title.png"
            alt={t("BAY VÀO TƯƠNG LAI")}
            loading="lazy"
          />
          <small>
            {t(
              "Số liệu minh họa giao diện tham chiếu — không phải thống kê của hệ thống demo",
            )}
          </small>
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
        <img
          className="fly-green"
          src="/assets/reference/fly-green.png"
          alt={t("Bay vui · Hướng tới tương lai xanh")}
          loading="lazy"
        />
      </div>
    </section>
  );
}
