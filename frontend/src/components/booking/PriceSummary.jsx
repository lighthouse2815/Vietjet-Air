import { money } from "../../api/client";
export default function PriceSummary({ price, children }) {
  return (
    <aside className="panel price-summary">
      <h3>Tóm tắt chi phí</h3>
      {price ? (
        <>
          <div>
            <span>Giá vé</span>
            <b>{money(price.baseAmount)}</b>
          </div>
          <div>
            <span>Thuế/phí demo</span>
            <b>{money(price.taxAmount)}</b>
          </div>
          <div>
            <span>Ghế và dịch vụ</span>
            <b>{money(price.extrasAmount)}</b>
          </div>
          {price.discountAmount > 0 && (
            <div>
              <span>Giảm giá</span>
              <b className="red">−{money(price.discountAmount)}</b>
            </div>
          )}
          <div className="total">
            <span>Tổng cộng</span>
            <strong>{money(price.totalAmount)}</strong>
          </div>
          <small className="muted">
            Giá đã gồm thuế/phí demo · VND · Thanh toán giả lập
          </small>
        </>
      ) : (
        <p>Chi phí sẽ được tính từ máy chủ.</p>
      )}
      {children}
    </aside>
  );
}
