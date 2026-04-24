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
