CREATE TABLE notification_outbox (
  id UUID PRIMARY KEY,
  recipient_id UUID NOT NULL,
  recipient_email VARCHAR(120) NOT NULL,
  type VARCHAR(30) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  event_id UUID,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  attempts INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_notification_outbox_status ON notification_outbox(status);
CREATE INDEX idx_notification_outbox_created_at ON notification_outbox(created_at);
