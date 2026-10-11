import { useMemo, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Plane, ArrowRight } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { useBooking } from "../context/BookingContext";
import { localDate, dateLabel, money } from "../api/client";
import { flightSearchSchema } from "../utils/flightSearch";
import BookingForm from "../components/booking/BookingForm";
import BookingSteps from "../components/booking/BookingSteps";
import FlightCard from "../components/flights/FlightCard";
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from "../components/common/States";
function SearchLeg({
  origin,
  destination,
  date,
  count,
  label,
  selected,
  onSelect,
  cheap,
}) {
  const path = `/flights/search?${new URLSearchParams({ origin, destination, date, passengers: count })}`;
  const { data, loading, error, retry } = useApi(path);
  const ordered = useMemo(
    () =>
      cheap && data
        ? [...data].sort((a, b) => a.fares[0].price - b.fares[0].price)
        : data,
    [data, cheap],
  );
  return (
    <section className="search-leg">
      <h2>
        <Plane size={20} />
        {label}: {origin} → {destination}
        <span>{dateLabel(`${date}T12:00:00+07:00`)}</span>
      </h2>
      {loading ? (
        <LoadingState label="Đang tìm chuyến bay phù hợp..." />
      ) : error ? (
        <ErrorState message={error} retry={retry} />
      ) : !ordered.length ? (
        <EmptyState>
          Không có chuyến bay phù hợp. Hãy chọn ngày khác; dữ liệu demo có các
          chuyến trong 90 ngày tới.
        </EmptyState>
      ) : (
        ordered.map((flight) => (
          <FlightCard
            key={flight.id}
            flight={flight}
            selected={selected}
            onSelect={onSelect}
          />
        ))
      )}
    </section>
  );
}
export default function FlightResultsPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { draft, update } = useBooking();
  const search = {
    origin: params.get("origin") || "SGN",
    destination: params.get("destination") || "HAN",
    date: params.get("date") || localDate(1),
    returnDate: params.get("returnDate") || localDate(2),
    type: params.get("type") || "ONE_WAY",
    adults: Number(params.get("adults") || 1),
    children: Number(params.get("children") || 0),
    infants: Number(params.get("infants") || 0),
    promotionCode: params.get("promotionCode") || "",
    cheap: params.get("cheap") === "true",
  };
  const searchKey = params.toString();
  const sameSearch = JSON.stringify(draft.search) === JSON.stringify(search);
  const [selection, setSelection] = useState({
    key: searchKey,
    out: sameSearch ? draft.segments[0] || null : null,
    back: sameSearch ? draft.segments[1] || null : null,
  });
  const validation = flightSearchSchema.safeParse(search);
  if (!validation.success) {
    return (
      <main className="container page checkout-page">
        <h1>Chọn chuyến bay</h1>
        <ErrorState message="Thông tin tìm kiếm không hợp lệ. Hãy chọn lại sân bay, ngày bay và số hành khách." />
        <Link to="/" className="button primary">
          Tìm lại chuyến bay
        </Link>
      </main>
    );
  }
  const chosen =
    selection.key === searchKey
      ? selection
      : { key: searchKey, out: null, back: null };
  const roundTrip = search.type === "ROUND_TRIP";
  const count = search.adults + search.children;
  const select = (leg, value) => setSelection({ ...chosen, [leg]: value });
  function next() {
    const segments = roundTrip ? [chosen.out, chosen.back] : [chosen.out];
    const sameFlights =
      sameSearch &&
      segments.length === draft.segments.length &&
      segments.every(
        (segment, i) =>
          segment.flight.id === draft.segments[i].flight.id &&
          segment.fare.code === draft.segments[i].fare.code,
      );
    update({
      search,
      segments,
      passengers: sameSearch ? draft.passengers : [],
      extras: sameFlights ? draft.extras : {},
      seats: sameFlights ? draft.seats : {},
      booking: null,
      promotionCode: search.promotionCode,
    });
    navigate("/booking/passengers");
  }
  const subtotal = [chosen.out, chosen.back]
    .filter(Boolean)
    .reduce(
      (total, s) =>
        total +
        Number(s.fare.price) *
          (search.adults + search.children * 0.75 + search.infants * 0.1),
      0,
    );
  return (
    <main className="container page checkout-page">
      <BookingSteps active={0} />
      <div className="page-heading">
        <span className="eyebrow">HÀNH TRÌNH DEMO</span>
        <h1>Chọn chuyến bay</h1>
        <p>
          {count + search.infants} hành khách ·{" "}
          {roundTrip ? "Khứ hồi" : "Một chiều"} · Giá hạng vé chưa gồm thuế/phí
          demo.
        </p>
      </div>
      <details className="search-update panel">
        <summary>Thay đổi tìm kiếm</summary>
        <BookingForm key={searchKey} initial={search} />
      </details>
      <SearchLeg
        origin={search.origin}
        destination={search.destination}
        date={search.date}
        count={count}
        label="Chuyến đi"
        selected={chosen.out}
        onSelect={(value) => select("out", value)}
        cheap={search.cheap}
      />
      {roundTrip && (
        <SearchLeg
          origin={search.destination}
          destination={search.origin}
          date={search.returnDate}
          count={count}
          label="Chuyến về"
          selected={chosen.back}
          onSelect={(value) => select("back", value)}
          cheap={search.cheap}
        />
      )}
      <div className="selection-bar">
        <div>
          <small>Giá vé tạm tính</small>
          <strong>{money(subtotal)}</strong>
          <small>Thuế và dịch vụ tính ở bước xác nhận</small>
        </div>
        <button
          className="button primary"
          disabled={!chosen.out || (roundTrip && !chosen.back)}
          onClick={next}
        >
          Tiếp tục <ArrowRight size={18} />
        </button>
      </div>
    </main>
  );
}
