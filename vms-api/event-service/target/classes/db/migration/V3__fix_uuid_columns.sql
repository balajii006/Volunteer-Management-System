-- Drop tables with old CHAR(36) UUID columns and recreate with BINARY(16)
DROP TABLE IF EXISTS notification_outbox;
DROP TABLE IF EXISTS feedbacks;
DROP TABLE IF EXISTS participations;
DROP TABLE IF EXISTS events;

CREATE TABLE events (
  id BINARY(16) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  location VARCHAR(500) NOT NULL,
  event_date TIMESTAMP NOT NULL,
  required_volunteers INTEGER NOT NULL,
  registered_volunteers INTEGER NOT NULL DEFAULT 0,
  organizer_id BINARY(16) NOT NULL,
  organizer_name VARCHAR(100) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(event_date);

CREATE TABLE participations (
  id BINARY(16) PRIMARY KEY,
  event_id BINARY(16) NOT NULL,
  volunteer_id BINARY(16) NOT NULL,
  volunteer_name VARCHAR(100) NOT NULL,
  volunteer_email VARCHAR(120) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'REGISTERED',
  role_played VARCHAR(100),
  registered_at TIMESTAMP NOT NULL,
  cancelled_at TIMESTAMP NULL,
  UNIQUE(event_id, volunteer_id)
);

CREATE INDEX idx_participations_event ON participations(event_id);
CREATE INDEX idx_participations_volunteer ON participations(volunteer_id);
CREATE INDEX idx_participations_status ON participations(status);

CREATE TABLE feedbacks (
  id BINARY(16) PRIMARY KEY,
  event_id BINARY(16) NOT NULL,
  volunteer_id BINARY(16) NOT NULL,
  volunteer_name VARCHAR(100) NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMP NOT NULL,
  UNIQUE(event_id, volunteer_id),
  CONSTRAINT chk_rating CHECK (rating >= 1 AND rating <= 5)
);

CREATE INDEX idx_feedbacks_event ON feedbacks(event_id);
CREATE INDEX idx_feedbacks_volunteer ON feedbacks(volunteer_id);

CREATE TABLE notification_outbox (
  id BINARY(16) PRIMARY KEY,
  recipient_id BINARY(16) NOT NULL,
  recipient_email VARCHAR(120) NOT NULL,
  type VARCHAR(30) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  event_id BINARY(16),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  attempts INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_notification_outbox_status ON notification_outbox(status);
CREATE INDEX idx_notification_outbox_created_at ON notification_outbox(created_at);
