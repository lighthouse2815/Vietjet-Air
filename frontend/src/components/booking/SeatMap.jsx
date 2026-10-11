import { useApi } from "../../hooks/useApi";
import { money } from "../../api/client";
import { LoadingState, ErrorState } from "../common/States";
export default function SeatMap({
  flightId,
  selected = "",
  onSelect,
  otherSelections = [],
  allowSpecial = true,
}) {
  const { data, loading, error, retry } = useApi(`/flights/${flightId}/seats`);
  if (loading) return <LoadingState label="Đang tải sơ đồ ghế..." />;
  if (error) return <ErrorState message={error} retry={retry} />;
  return (
    <div className="seat-map">
      <div className="seat-legend">
        <span>
          <i className="available" />
          Còn trống
        </span>
        <span>
          <i className="special" />
          Ghế đặc biệt
        </span>
        <span>
          <i className="chosen" />
          Đang chọn
        </span>
        <span>
          <i className="unavailable" />
          Đã đặt/khóa
        </span>
      </div>
      <div className="aircraft-map">
        <div className="aircraft-nose">Đầu tàu bay · DEMO</div>
        <div className="seat-grid">
          <span />
          {["A", "B", "C", "", "D", "E", "F"].map((c, i) => (
            <small key={i}>{c}</small>
          ))}
          {Array.from({ length: 12 }, (_, row) => (
            <div className="seat-row" key={row}>
              <small>{row + 1}</small>
              {["A", "B", "C", "", "D", "E", "F"].map((column) => {
                if (!column) return <span key="aisle" />;
                const number = `${row + 1}${column}`,
                  seat = data.find((s) => s.seatNumber === number);
                const mine = selected === number,
                  disabled =
                    !seat ||
                    (!mine && seat.status !== "AVAILABLE") ||
                    otherSelections.includes(number) ||
                    (!allowSpecial && seat.extraLegroom);
                return (
                  <button
                    key={column}
                    type="button"
                    aria-label={`Ghế ${number} · ${money(seat?.price)}`}
                    aria-pressed={mine}
                    title={
                      disabled
                        ? "Ghế không khả dụng"
                        : `${number} · ${money(seat?.price)}`
                    }
                    disabled={disabled}
                    className={`seat ${seat?.extraLegroom ? "special" : ""} ${mine ? "chosen" : ""}`}
                    onClick={() => onSelect(mine ? "" : number)}
                  >
                    {number}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <p className="muted small">
        Ghế được giữ khi tạo đặt chỗ. Nếu người khác đặt trước, máy chủ sẽ yêu
        cầu chọn lại. Hình ảnh là cấu hình demo.
      </p>
    </div>
  );
}
