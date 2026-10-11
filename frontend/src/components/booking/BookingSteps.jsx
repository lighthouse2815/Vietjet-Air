import { t } from "../../i18n.js";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
const steps = [
  ["Chuyến bay", "/flights"],
  ["Hành khách", "/booking/passengers"],
  ["Dịch vụ", "/booking/extras"],
  ["Xác nhận", "/booking/review"],
  ["Thanh toán", "/booking/payment"],
];
export default function BookingSteps({ active }) {
  useTranslation();
  return (
    <nav className="booking-steps" aria-label={t("Các bước đặt vé")}>
      {steps.map(([name, path], i) => (
        <span
          key={name}
          className={i === active ? "current" : i < active ? "completed" : ""}
        >
          <b>{i + 1}</b>
          {i < active && i > 0 ? <Link to={path}>{t(name)}</Link> : t(name)}
        </span>
      ))}
    </nav>
  );
}
