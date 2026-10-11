import { useState, useRef, useEffect } from "react";
import { Plane, Search, Check } from "lucide-react";
import { usePopup } from "../../hooks/usePopup";
const normalize = (value) =>
  value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/đ/g, "d");
export default function AirportPicker({
  label,
  value,
  onChange,
  airports,
  exclude,
}) {
  const { ref, open, setOpen } = usePopup();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef();
  const selected = airports.find((a) => a.code === value);
  const options = airports.filter(
    (a) =>
      a.code !== exclude &&
      normalize(`${a.city} ${a.code} ${a.name}`).includes(normalize(query)),
  );
  useEffect(() => {
    if (open) {
      input.current?.focus();
    }
  }, [open]);
  function choose(airport) {
    onChange(airport.code);
    setOpen(false);
  }
  function onKeyDown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(i + 1, options.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    }
    if (event.key === "Enter" && options[active]) {
      event.preventDefault();
      choose(options[active]);
    }
  }
  return (
    <div className="airport-picker" ref={ref}>
      <button
        type="button"
        className="airport-trigger"
        aria-label={label}
        aria-expanded={open}
        onClick={() => {
          if (!open) {
            setQuery("");
            setActive(0);
          }
          setOpen(!open);
        }}
      >
        <Plane size={21} className={label === "Điểm đến" ? "landing" : ""} />
        <span>
          {selected ? (
            <>
              <small>{label}</small>
              {selected.city} <b>({selected.code})</b>
            </>
          ) : (
            label
          )}
        </span>
      </button>
      {open && (
        <div className="popup airport-popup">
          <div className="popup-title">{label}</div>
          <div className="search-input">
            <Search size={18} />
            <input
              ref={input}
              aria-label={`Tìm ${label.toLowerCase()}`}
              placeholder="Thành phố hoặc mã sân bay"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              role="combobox"
              aria-expanded="true"
              aria-controls={`airports-${label}`}
              aria-activedescendant={
                options[active] ? `airport-${label}-${active}` : undefined
              }
            />
          </div>
          <div role="listbox" id={`airports-${label}`} className="airport-list">
            {options.map((a, i) => (
              <button
                type="button"
                role="option"
                aria-selected={a.code === value}
                id={`airport-${label}-${i}`}
                key={a.code}
                className={active === i ? "active" : ""}
                onClick={() => choose(a)}
              >
                <span>
                  <strong>{a.city}</strong>
                  <small>
                    {a.name}, {a.country}
                  </small>
                </span>
                <b>{a.code}</b>
                {a.code === value && <Check size={15} />}
              </button>
            ))}
            {!options.length && (
              <p className="small muted">Không tìm thấy sân bay phù hợp.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
