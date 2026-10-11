import { Link } from "react-router-dom";
const steps = [
  ["Chuyến bay", "/flights"],
  ["Hành khách", "/booking/passengers"],
  ["Dịch vụ", "/booking/extras"],
  ["Xác nhận", "/booking/review"],
  ["Thanh toán", "/booking/payment"],
];
export default function BookingSteps({ active }) {
  return (
    <nav className="booking-steps" aria-label="Các bước đặt vé">
      {steps.map(([name, path], i) => (
        <span
          key={name}
          className={i === active ? "current" : i < active ? "completed" : ""}
        >
          <b>{i + 1}</b>
          {i < active && i > 0 ? <Link to={path}>{name}</Link> : name}
        </span>
      ))}
    </nav>
  );
}
