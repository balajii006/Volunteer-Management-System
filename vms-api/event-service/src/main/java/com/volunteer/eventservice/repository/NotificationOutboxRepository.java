package com.volunteer.eventservice.repository;

import com.volunteer.eventservice.domain.NotificationOutbox;
import com.volunteer.eventservice.domain.NotificationOutboxStatus;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationOutboxRepository extends JpaRepository<NotificationOutbox, UUID> {
  List<NotificationOutbox> findTop50ByStatusOrderByCreatedAtAsc(NotificationOutboxStatus status);
}
