package com.volunteer.notificationservice.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.volunteer.notificationservice.domain.Notification;
import com.volunteer.notificationservice.domain.NotificationStatus;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
  List<Notification> findByRecipientIdOrderByCreatedAtDesc(UUID recipientId);
  List<Notification> findAllByOrderByCreatedAtDesc();
  List<Notification> findByStatus(NotificationStatus status);
  List<Notification> findByRecipientIdAndStatus(UUID recipientId, NotificationStatus status);
  long countByRecipientIdAndStatus(UUID recipientId, NotificationStatus status);
}
