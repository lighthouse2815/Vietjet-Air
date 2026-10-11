import { t } from "../../i18n.js";
import { useTranslation } from "react-i18next";
import { money } from "../../api/client";
export default function PriceSummary({ price, children }) {
  useTranslation();
  return (
    <aside className="panel price-summary">
      <h3>{t("Tóm tắt chi phí")}</h3>
      {price ? (
        <>
          <div>
            <span>{t("Giá vé")}</span>
            <b>{money(price.baseAmount)}</b>
          </div>
          <div>
            <span>{t("Thuế/phí demo")}</span>
            <b>{money(price.taxAmount)}</b>
          </div>
          <div>
            <span>{t("Ghế và dịch vụ")}</span>
            <b>{money(price.extrasAmount)}</b>
          </div>
          {price.discountAmount > 0 && (
            <div>
              <span>{t("Giảm giá")}</span>
              <b className="red">−{money(price.discountAmount)}</b>
            </div>
          )}
          <div className="total">
            <span>{t("Tổng cộng")}</span>
            <strong>{money(price.totalAmount)}</strong>
          </div>
          <small className="muted">{t("Giá đã gồm thuế/phí demo · VND · Thanh toán giả lập")}</small>
        </>
      ) : (
        <p>{t("Chi phí sẽ được tính từ máy chủ.")}</p>
      )}
      {t(children)}
    </aside>
  );
}
