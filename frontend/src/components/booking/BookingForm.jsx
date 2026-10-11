import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowUpDown, TicketPercent, Plane, LoaderCircle } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { localDate, api, errorMessage } from "../../api/client";
import AirportPicker from "./AirportPicker";
import DatePicker from "./DatePicker";
import PassengerPicker from "./PassengerPicker";
export default function BookingForm({ initial = {}, compact = false }) {
  const navigate = useNavigate();
  const airports = useApi("/airports");
  const [form, setForm] = useState({
    type: "ROUND_TRIP",
    origin: "",
    destination: "",
    date: "",
    returnDate: "",
    adults: 1,
    children: 0,
    infants: 0,
    promotionCode: "",
    cheap: false,
    ...initial,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const change = (patch) => {
    setForm((current) => ({ ...current, ...patch }));
    setError("");
  };
  async function submit(event) {
    event.preventDefault();
    if (!form.origin || !form.destination || form.origin === form.destination) {
      setError("Chọn hai sân bay khác nhau để tìm chuyến bay.");
      return;
    }
    if (
      !form.date ||
      form.date < localDate() ||
      (form.type === "ROUND_TRIP" &&
        (!form.returnDate || form.returnDate < form.date))
    ) {
      setError("Chọn ngày đi và ngày về hợp lệ.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.get("/flights/search", {
        params: {
          origin: form.origin,
          destination: form.destination,
          date: form.date,
          passengers: form.adults + form.children,
        },
      });
      navigate(
        `/flights?${new URLSearchParams({ ...form, cheap: String(form.cheap) })}`,
      );
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className={`booking-widget ${compact ? "compact" : ""}`}>
      {!compact && (
        <div className="booking-tabs">
          <Link to="/my-booking">
            Mua hành lý, suất ăn chọn chỗ ngồi và hơn thế nữa...
          </Link>
          <Link to="/services/skyjoy">
            Đổi thưởng &amp;
            <br /> Mua Skypoint
          </Link>
          <Link to="/services/cargo">
            Gửi hàng
            <br /> nhanh
          </Link>
        </div>
      )}
      <form onSubmit={submit} noValidate>
        <div className="trip-row">
          <label>
            <input
              type="radio"
              name={`trip-${compact}`}
              checked={form.type === "ROUND_TRIP"}
              onChange={() => change({ type: "ROUND_TRIP" })}
            />
            Khứ hồi
          </label>
          <label>
            <input
              type="radio"
              name={`trip-${compact}`}
              checked={form.type === "ONE_WAY"}
              onChange={() => change({ type: "ONE_WAY" })}
            />
            Một chiều
          </label>
          <Link to="/services/multi-city">Nhiều chặng ↗</Link>
          <span className="currency" title="Giao dịch demo sử dụng VND">
            VND ⌄
          </span>
        </div>
        <div className="flight-fields">
          <div className="route-date-row">
            <AirportPicker
              label="Điểm khởi hành"
              value={form.origin}
              onChange={(origin) => change({ origin })}
              airports={airports.data || []}
              exclude={form.destination}
            />
            <DatePicker
              label="Ngày đi"
              value={form.date}
              onChange={(date) =>
                change({
                  date,
                  returnDate:
                    form.returnDate && form.returnDate < date
                      ? ""
                      : form.returnDate,
                })
              }
              origin={form.origin}
              destination={form.destination}
            />
          </div>
          <button
            type="button"
            className="swap-button"
            aria-label="Hoán đổi điểm đi và điểm đến"
            onClick={() =>
              change({ origin: form.destination, destination: form.origin })
            }
          >
            <ArrowUpDown size={20} />
          </button>
          <div className="route-date-row">
            <AirportPicker
              label="Điểm đến"
              value={form.destination}
              onChange={(destination) => change({ destination })}
              airports={airports.data || []}
              exclude={form.origin}
            />
            <DatePicker
              label="Ngày về"
              value={form.type === "ROUND_TRIP" ? form.returnDate : ""}
              onChange={(returnDate) => change({ returnDate })}
              min={form.date || localDate()}
              disabled={form.type !== "ROUND_TRIP"}
              origin={form.destination}
              destination={form.origin}
            />
          </div>
        </div>
        <div className="extra-search-fields">
          <PassengerPicker
            value={{
              adults: Number(form.adults),
              children: Number(form.children),
              infants: Number(form.infants),
            }}
            onChange={change}
          />
          <label className="white-field promo-input">
            <TicketPercent size={21} />
            <input
              aria-label="Mã khuyến mại"
              placeholder="Mã khuyến mại"
              value={form.promotionCode}
              onChange={(e) =>
                change({ promotionCode: e.target.value.toUpperCase() })
              }
            />
          </label>
          <label className="cheap-toggle">
            <input
              type="checkbox"
              checked={form.cheap}
              onChange={(e) => change({ cheap: e.target.checked })}
            />
            Tìm vé rẻ nhất
          </label>
        </div>
        {(error || airports.error) && (
          <p role="alert" className="form-error">
            {error || airports.error}
          </p>
        )}
        <button
          className="button search-button"
          disabled={loading || airports.loading}
        >
          {loading ? (
            <>
              <LoaderCircle size={18} className="spin" />
              Đang tìm...
            </>
          ) : (
            <>
              <Plane size={18} />
              Tìm chuyến bay
            </>
          )}
        </button>
      </form>
    </div>
  );
}
