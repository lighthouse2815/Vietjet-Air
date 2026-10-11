export function bookingPayload(draft) {
  return {
    segments: draft.segments.map((segment) => ({
      flightId: segment.flight.id,
      fareCode: segment.fare.code,
      seats: Object.entries(draft.seats[segment.flight.id] || {})
        .filter(([, seat]) => seat)
        .map(([passengerIndex, seatNumber]) => ({
          passengerIndex: Number(passengerIndex),
          seatNumber,
        })),
      extras: Object.entries(draft.extras[segment.flight.id] || {}).flatMap(
        ([passengerIndex, services]) =>
          services.map((serviceId) => ({
            passengerIndex: Number(passengerIndex),
            serviceId,
          })),
      ),
    })),
    passengers: draft.passengers.map((p) => ({
      type: p.type,
      title: p.title,
      lastName: p.lastName,
      firstName: p.firstName,
      dateOfBirth: p.dateOfBirth,
      nationality: p.nationality,
    })),
    contactEmail: draft.contactEmail,
    contactPhone: draft.contactPhone,
    promotionCode: draft.promotionCode || "",
    journeyType: draft.search?.type || draft.journeyType || undefined,
  };
}
export function storeBooking(booking) {
  sessionStorage.setItem(`booking-token-${booking.code}`, booking.accessToken);
}
export const statusLabels = {
  PENDING: "Chờ thanh toán",
  CONFIRMED: "Đã xác nhận",
  CANCELLED: "Đã hủy",
  EXPIRED: "Đã hết hạn",
};
