import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { t } from "../../i18n.js";
import { useReducedMotion } from "../../hooks/useReducedMotion";

export default function ScrollCarousel({ className, label, children }) {
  const track = useRef(null);
  const reducedMotion = useReducedMotion();
  const [bounds, setBounds] = useState({ previous: false, next: false });
  useEffect(() => {
    const element = track.current;
    const update = () => {
      const previous = element.scrollLeft > 1;
      const next =
        element.scrollLeft + element.clientWidth < element.scrollWidth - 1;
      setBounds((old) =>
        old.previous === previous && old.next === next
          ? old
          : { previous, next },
      );
    };
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      observer.disconnect();
      element.removeEventListener("scroll", update);
    };
  }, []);
  const move = (direction) => {
    const element = track.current;
    const item = element.firstElementChild;
    if (!item) return;
    const step =
      item.getBoundingClientRect().width +
      (parseFloat(getComputedStyle(element).columnGap) || 0);
    element.scrollBy({
      left: direction * step,
      behavior: reducedMotion ? "instant" : "smooth",
    });
  };
  const overflow = bounds.previous || bounds.next;
  return (
    <div className="scroll-carousel" role="group" aria-label={label}>
      <div
        ref={track}
        className={className}
        tabIndex={overflow ? 0 : undefined}
        aria-label={label}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            move(event.key === "ArrowRight" ? 1 : -1);
          }
        }}
      >
        {children}
      </div>
      {overflow && (
        <>
          <button
            className="scroll-arrow previous"
            aria-label={t("Xem mục trước")}
            disabled={!bounds.previous}
            onClick={() => move(-1)}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className="scroll-arrow next"
            aria-label={t("Xem mục tiếp")}
            disabled={!bounds.next}
            onClick={() => move(1)}
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </div>
  );
}
