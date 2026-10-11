import { t } from "../../i18n.js";
import { useTranslation } from "react-i18next";
import { UserRound, ChevronDown, Minus, Plus } from "lucide-react";
import { usePopup } from "../../hooks/usePopup";
export default function PassengerPicker({ value, onChange }) {
  useTranslation();
  const { ref, open, setOpen } = usePopup();
  const total = value.adults + value.children;
  const types = [
    ["adults", "Người lớn", "12 tuổi trở lên"],
    ["children", "Trẻ em", "2–11 tuổi"],
    ["infants", "Em bé", "Dưới 2 tuổi"],
  ];
  function allowed(key, delta) {
    const next = { ...value, [key]: value[key] + delta };
    return (
      next.adults >= 1 &&
      next.children >= 0 &&
      next.infants >= 0 &&
      next.infants <= next.adults &&
      next.adults + next.children + next.infants <= 9
    );
  }
  return (
    <div ref={ref} className="passenger-picker">
      <button
        type="button"
        className="white-field passenger-trigger"
        aria-label={t("Hành khách: {{v0}} người lớn, {{v1}} trẻ em, {{v2}} em bé", {v0: value.adults, v1: value.children, v2: value.infants})}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <UserRound size={21} />
        <span>
          <small>{t("Hành khách")}</small>
          {value.adults}{t(" người lớn")}{value.children > 0 && t(", {{v0}} trẻ em", {v0: value.children})}
          {value.infants > 0 && t(", {{v0}} em bé", {v0: value.infants})}
        </span>
        <ChevronDown size={18} />
      </button>
      {open && (
        <div className="popup passenger-popup">
          <div className="popup-title">{t("Hành khách ")}<small>{t("Tối đa 9 người")}</small>
          </div>
          {types.map(([key, label, hint]) => (
            <div className="passenger-row" key={key}>
              <span>
                <strong>{t(label)}</strong>
                <small>{hint}</small>
              </span>
              <button
                type="button"
                aria-label={t("Giảm {{v0}}", {v0: label.toLowerCase()})}
                disabled={!allowed(key, -1)}
                onClick={() => onChange({ ...value, [key]: value[key] - 1 })}
              >
                <Minus size={16} />
              </button>
              <b>{value[key]}</b>
              <button
                type="button"
                aria-label={t("Tăng {{v0}}", {v0: label.toLowerCase()})}
                disabled={!allowed(key, 1)}
                onClick={() => onChange({ ...value, [key]: value[key] + 1 })}
              >
                <Plus size={16} />
              </button>
            </div>
          ))}
          <p className="small muted">
            {total}{t(" ghế · Em bé đi cùng người lớn, không có ghế riêng.")}</p>
          <button
            type="button"
            className="button primary full"
            onClick={() => setOpen(false)}
          >{t("Xong")}</button>
        </div>
      )}
    </div>
  );
}
