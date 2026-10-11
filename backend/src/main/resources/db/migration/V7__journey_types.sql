ALTER TABLE bookings ADD COLUMN journey_type VARCHAR(255) NOT NULL DEFAULT 'ONE_WAY' CHECK(journey_type IN ('ONE_WAY','ROUND_TRIP','MULTI_CITY','GROUP'));
UPDATE bookings b SET journey_type='ROUND_TRIP' WHERE (SELECT COUNT(*) FROM booking_segments s WHERE s.booking_id=b.id)=2;
