CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  recipient_id UUID NOT NULL,
  recipient_email VARCHAR(120) NOT NULL,
  type VARCHAR(50) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  event_id UUID,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_event ON notifications(event_id);
CREATE INDEX idx_notifications_created ON notifications(created_at);
