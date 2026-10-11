import { t } from "../../i18n";
import { useTranslation } from "react-i18next";
import { useApi } from "../../hooks/useApi";
import { LoadingState, ErrorState } from "../common/States";

export default function StatsSection({ className = "" }) {
  const { i18n } = useTranslation();
  const statistics = useApi("/site-statistics");
  return <section className={`stats-section ${className}`}><div className="container">
    {statistics.loading ? <LoadingState /> : statistics.error ? <ErrorState message={t(statistics.error)} retry={statistics.retry} /> : <>
      <div className="stats-title"><img src={statistics.data.titleImage} alt={t("BAY VÀO TƯƠNG LAI")} loading="lazy" />
        <small>{t("Số liệu hiện tại từ hệ thống nội bộ")}</small></div>
      <div className="stats-grid">{statistics.data.metrics.map(metric => <div key={metric.code}><strong>{new Intl.NumberFormat(i18n.language === "en" ? "en-US" : "vi-VN").format(metric.value)}</strong><span>{t(metric.label)}</span></div>)}</div>
      <img className="fly-green" src={statistics.data.footerImage} alt={t("Bay vui · Hướng tới tương lai xanh")} loading="lazy" />
    </>}
  </div></section>;
}
