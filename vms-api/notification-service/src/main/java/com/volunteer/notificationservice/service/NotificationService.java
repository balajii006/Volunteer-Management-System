package com.volunteer.notificationservice.service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.volunteer.notificationservice.domain.Notification;
import com.volunteer.notificationservice.domain.NotificationStatus;
import com.volunteer.notificationservice.domain.NotificationType;
import com.volunteer.notificationservice.repository.NotificationRepository;

@Service
public class NotificationService {
  private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
  private final NotificationRepository notificationRepository;
  private final EmailService emailService;

  public NotificationService(NotificationRepository notificationRepository, EmailService emailService) {
    this.notificationRepository = notificationRepository;
    this.emailService = emailService;
  }

  @Transactional
  public Notification createNotification(UUID recipientId, String recipientEmail, NotificationType type,
      String subject, String message, UUID eventId) {
    Notification notification = new Notification();
    notification.setRecipientId(recipientId);
    notification.setRecipientEmail(recipientEmail);
    notification.setType(type);
    notification.setSubject(subject);
    notification.setMessage(message);
    notification.setEventId(eventId);
    notification.setStatus(NotificationStatus.PENDING);
    return notificationRepository.save(notification);
  }

  @Transactional
  @Async("notificationExecutor")
  public void sendNotification(UUID notificationId) {
    Notification notification = notificationRepository.findById(notificationId)
        .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

    try {
      emailService.sendEmail(notification.getRecipientEmail(), notification.getSubject(), notification.getMessage());
      notification.setStatus(NotificationStatus.SENT);
      notification.setSentAt(Instant.now());
      logger.info("Notification sent successfully to {}: {}", notification.getRecipientEmail(), notificationId);
    } catch (Exception e) {
      notification.setStatus(NotificationStatus.FAILED);
      logger.error("Failed to send notification {}: {}", notificationId, e.getMessage());
    }
    notificationRepository.save(notification);
  }

  @Transactional
  @Async("notificationExecutor")
  public void sendPendingNotifications() {
    List<Notification> pending = notificationRepository.findByStatus(NotificationStatus.PENDING);
    logger.info("Processing {} pending notifications", pending.size());
    for (Notification notification : pending) {
      try {
        sendNotification(notification.getId());
      } catch (Exception e) {
        logger.error("Error processing notification {}: {}", notification.getId(), e.getMessage());
      }
    }
  }

  public List<Notification> getUserNotifications(UUID userId) {
    return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
  }

  public List<Notification> getAllNotifications() {
    return notificationRepository.findAllByOrderByCreatedAtDesc();
  }

  public List<Notification> getUnreadNotifications(UUID userId) {
    return notificationRepository.findByRecipientIdAndStatus(userId, NotificationStatus.SENT);
  }

  @Transactional
  public void markAsRead(UUID notificationId, UUID userId) {
    Notification notification = notificationRepository.findById(notificationId)
        .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

    if (!notification.getRecipientId().equals(userId)) {
      throw new IllegalArgumentException("Unauthorized");
    }

    if (notification.getStatus() == NotificationStatus.SENT) {
      notification.setStatus(NotificationStatus.READ);
      notification.setReadAt(Instant.now());
      notificationRepository.save(notification);
    }
  }

  public long getUnreadCount(UUID userId) {
    return notificationRepository.countByRecipientIdAndStatus(userId, NotificationStatus.SENT);
  }

  @Transactional
  public void markAllAsRead(UUID userId) {
    List<Notification> unread = notificationRepository.findByRecipientIdAndStatus(userId, NotificationStatus.SENT);
    Instant now = Instant.now();
    for (Notification notification : unread) {
      notification.setStatus(NotificationStatus.READ);
      notification.setReadAt(now);
    }
    notificationRepository.saveAll(unread);
  }
}
