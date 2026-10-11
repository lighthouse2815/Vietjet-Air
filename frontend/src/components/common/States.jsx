import { t } from "../../i18n.js";
import { useTranslation } from "react-i18next";
import { LoaderCircle, AlertCircle, Plane } from "lucide-react";
export function LoadingState({ label = "Đang tải dữ liệu..." }) {
  useTranslation();
  return (
    <div className="state" role="status">
      <LoaderCircle className="spin" />
      <p>{t(label)}</p>
    </div>
  );
}
export function ErrorState({ message, retry }) {
  useTranslation();
  return (
    <div className="state error" role="alert">
      <AlertCircle />
      <p>{t(message)}</p>
      {retry && (
        <button className="button secondary" onClick={retry}>{t("Thử lại")}</button>
      )}
    </div>
  );
}
export function EmptyState({ children }) {
  useTranslation();
  return (
    <div className="state">
      <Plane />
      <p>{t(children) || t("Chưa có dữ liệu phù hợp.")}</p>
    </div>
  );
}
