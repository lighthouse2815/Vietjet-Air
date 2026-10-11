import { t } from "../i18n.js";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { Plane, ArrowRight } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { LoadingState, ErrorState } from "../components/common/States";
export default function ContentPage() {
  useTranslation();
  const { slug } = useParams();
  const { hash } = useLocation();
  const content = useApi(`/content/pages/${slug}`);
  const { data, loading, error, retry } = useApi("/home");
  const faq = (data?.items || []).filter((i) => i.category === "FAQ");
  useEffect(() => {
    if (slug !== "faq" || !hash || !data) return;
    const topic = document.getElementById(hash.slice(1));
    if (topic instanceof HTMLDetailsElement) {
      topic.open = true;
      topic.scrollIntoView({ block: "start" });
    }
  }, [slug, hash, data]);
  if (content.loading) return <main className="container page"><LoadingState /></main>;
  if (content.error) return <main className="container page"><ErrorState message={t(content.error)} retry={content.retry} /></main>;
  return (
    <main className="container page">
      <div className="page-heading">
        <span className="eyebrow">{t("BẢN MÔ PHỎNG ĐỘC LẬP")}</span>
        <h1>{t(content.data.title)}</h1>
        <p>{t("Thông tin dành cho trải nghiệm đặt vé demo.")}</p>
      </div>
      <div className="panel content-panel">
        {slug === "faq" ? (
          loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={t(error)} retry={retry} />
          ) : (
            faq.map((item) => (
              <details key={item.id} id={item.target}>
                <summary>{t(item.title)}</summary>
                <p>{t(item.description)}</p>
              </details>
            ))
          )
        ) : (
          <>
            <Plane size={42} className="red" />
            <h2>{t(content.data.title)}</h2>
            <p>
              {t(content.data.description)}
            </p>
            <p>{t("Hành lý, suất ăn, ghế và bảo hiểm demo được chọn tại bước dịch vụ bổ sung. Không nhập tài khoản Vietjet, số thẻ ngân hàng hoặc giấy tờ cá nhân thật.")}</p>
            <div className="actions">
              <Link className="button primary" to="/">{t("Tìm chuyến bay ")}<ArrowRight size={17} />
              </Link>
              <Link className="button secondary" to="/my-booking">{t("Tra cứu đặt chỗ")}</Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
