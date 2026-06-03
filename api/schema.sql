-- Create Table: availability
CREATE TABLE IF NOT EXISTS availability (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  date TEXT NOT NULL, -- YYYY-MM-DD format
  status TEXT DEFAULT 'available', -- available, fully_booked, on_request
  note TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(property_id, date)
);

-- Create Table: bookings
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  property_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  check_in TEXT NOT NULL, -- YYYY-MM-DD
  check_out TEXT, -- YYYY-MM-DD
  num_guests INTEGER DEFAULT 1,
  special_requests TEXT,
  status TEXT DEFAULT 'pending', -- pending, confirmed, cancelled, no_show
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create Table: admin_sessions
CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT NOT NULL -- IsoString expiration timestamp
);

-- Seed Initial Availability (Mock Data for June 2026)
INSERT OR IGNORE INTO availability (id, property_id, date, status, note) VALUES
  ('s1', 'holiday_home', '2026-06-10', 'fully_booked', 'Group Booking'),
  ('s2', 'holiday_home', '2026-06-11', 'fully_booked', 'Group Booking'),
  ('s3', 'holiday_home', '2026-06-12', 'on_request', 'Corporate Event Inquiry'),
  ('s4', 'full_house', '2026-06-15', 'fully_booked', 'Family wedding guest stay'),
  ('s5', 'full_house', '2026-06-16', 'fully_booked', 'Family wedding guest stay'),
  ('s6', 'new_cottage', '2026-06-20', 'fully_booked', 'Weekend getaway'),
  ('s7', 'new_cottage', '2026-06-21', 'fully_booked', 'Weekend getaway'),
  ('s8', 'private_rooms', '2026-06-05', 'on_request', 'Mainway room on hold');

-- Seed Initial Bookings (Mock Data)
INSERT OR IGNORE INTO bookings (id, property_id, property_name, client_name, client_phone, check_in, check_out, num_guests, special_requests, status, created_at) VALUES
  ('b1', 'holiday_home', 'Tamayi Holiday Home', 'John Doe', '+263787891150', '2026-06-10', '2026-06-12', 6, 'Late check-in requested.', 'confirmed', '2026-06-01 10:00:00'),
  ('b2', 'full_house', 'Full House', 'Sarah Jenkins', '+27829876543', '2026-06-15', '2026-06-17', 5, 'Require infant high chair and extra towels.', 'pending', '2026-06-02 14:30:00'),
  ('b3', 'new_cottage', 'New Cottage', 'Michael Ndlovu', '+263784556677', '2026-06-20', '2026-06-22', 2, 'Honeymoon couple, setup rose petals.', 'confirmed', '2026-06-02 16:15:00'),
  ('b4', 'outdoor_setup', 'Outdoor Setup', 'Chipo Moyo', '+263712334455', '2026-06-28', '2026-06-28', 15, 'Baby shower setup, theme gold and pastel pink.', 'pending', '2026-06-03 08:00:00');
