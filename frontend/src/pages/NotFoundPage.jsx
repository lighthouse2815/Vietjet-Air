import { t } from "../i18n.js";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
export default function NotFoundPage() {
  useTranslation();
  return (
    <main className="container page">
      <div className="panel state">
        <h1>{t("404 · Không tìm thấy trang")}</h1>
        <p>{t("Đường dẫn này chưa tồn tại. Hãy trở về trang chủ để bắt đầu hành trình.")}</p>
        <Link className="button primary" to="/">{t("Về trang chủ")}</Link>
      </div>
    </main>
  );
}
