import { readFile, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";

const base = process.env.API_URL || "http://localhost:8085/api";
const fixturePath =
  process.env.PERSISTENCE_FIXTURE_FILE ||
  join(tmpdir(), "vietjet-persistence-fixture.json");
async function api(path, { method = "GET", data, token } = {}) {
  const response = await fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "X-Booking-Token": token } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`${response.status}: ${body.message}`);
  return body;
}

if (process.argv[2] === "prepare") {
  const day = new Date(Date.now() + 86400000);
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(day);
  const flights = await api(
    `/flights/search?origin=SGN&destination=PQC&date=${date}&passengers=1`,
  );
  assert.ok(flights.length > 0, "Cần chuyến demo SGN → PQC ngày mai");
  const services = await api("/ancillary-services");
  const bag = services.find((service) => service.code === "BAG20");
  let booking = await api("/bookings", {
    method: "POST",
    data: {
      segments: [
        {
          flightId: flights[0].id,
          fareCode: "ECO",
          seats: [],
          extras: [{ serviceId: bag.id, passengerIndex: 0 }],
        },
      ],
      passengers: [
        {
          type: "ADULT",
          title: "MR",
          lastName: "TEST",
          firstName: "PERSIST DEMO",
          dateOfBirth: "1990-01-01",
          nationality: "Việt Nam",
        },
      ],
      contactEmail: "persist@example.com",
      contactPhone: "0901234567",
      promotionCode: "DEMO10",
    },
  });
  await api("/payments/demo", {
    method: "POST",
    token: booking.accessToken,
    data: {
      bookingId: booking.id,
      requestKey: randomUUID(),
      outcome: "SUCCESS",
    },
  });
  const seats = await api(`/flights/${flights[0].id}/seats`);
  const seat = seats.find(
    (seat) => seat.status === "AVAILABLE" && !seat.extraLegroom,
  );
  assert.ok(seat, "Cần một ghế tiêu chuẩn còn trống");
  booking = await api("/check-in/complete", {
    method: "POST",
    token: booking.accessToken,
    data: {
      bookingId: booking.id,
      flightId: flights[0].id,
      passengerIndex: 0,
      seatNumber: seat.seatNumber,
      acceptedConditions: true,
    },
  });
  // Read the committed snapshot: PostgreSQL stores timestamps at microsecond precision.
  booking = await api(`/bookings/${booking.code}`, {
    token: booking.accessToken,
  });
  await writeFile(fixturePath, JSON.stringify(booking), { mode: 0o600 });
  console.log(
    `Đã lưu booking ${booking.code} để đối chiếu sau khi restart. Token chỉ nằm trong file tạm ngoài repo.`,
  );
} else if (process.argv[2] === "verify") {
  const before = JSON.parse(await readFile(fixturePath, "utf8"));
  const after = await api(`/bookings/${before.code}`, {
    token: before.accessToken,
  });
  for (const field of [
    "id",
    "code",
    "status",
    "price",
    "passengers",
    "extras",
    "boardingPasses",
  ])
    assert.deepEqual(after[field], before[field], field);
  assert.equal(after.status, "CONFIRMED");
  assert.equal(after.paymentStatus, "SUCCESS");
  assert.deepEqual(
    after.segments.map((s) => [s.flight.id, s.fare, s.seats]),
    before.segments.map((s) => [s.flight.id, s.fare, s.seats]),
  );
  const lookup = await api("/bookings/lookup", {
    method: "POST",
    data: {
      bookingCode: before.code,
      lastName: "TEST",
      firstName: "PERSIST DEMO",
    },
  });
  assert.equal(lookup.id, before.id);
  const report = {
    verifiedAt: new Date().toISOString(),
    bookingCode: before.code,
    survivesBackendRestart: true,
    priceSnapshotUnchanged: true,
    passengersUnchanged: true,
    extrasUnchanged: true,
    seatAndBoardingPassUnchanged: true,
    lookupAfterRestart: true,
    paymentStatusFromDatabase: after.paymentStatus,
  };
  await mkdir("docs/verification", { recursive: true });
  await writeFile(
    "docs/verification/persistence.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report));
} else {
  throw new Error(
    "Chạy node scripts/verify-persistence.mjs prepare, restart backend, sau đó chạy verify.",
  );
}
