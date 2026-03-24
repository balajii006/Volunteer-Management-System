package com.volunteer.notificationservice.web.dto;

import com.volunteer.notificationservice.domain.NotificationStatus;
import com.volunteer.notificationservice.domain.NotificationType;
import java.time.Instant;
import java.util.UUID;

public class NotificationResponse {
  private UUID id;
  private NotificationType type;
  private String subject;
  private String message;
  private UUID eventId;
  private NotificationStatus status;
  private Instant createdAt;
  private Instant sentAt;
  private Instant readAt;

  public NotificationResponse(UUID id, NotificationType type, String subject, String message,
      UUID eventId, NotificationStatus status, Instant createdAt, Instant sentAt, Instant readAt) {
    this.id = id;
    this.type = type;
    this.subject = subject;
    this.message = message;
    this.eventId = eventId;
    this.status = status;
    this.createdAt = createdAt;
    this.sentAt = sentAt;
    this.readAt = readAt;
  }

  // Getters and Setters
  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public NotificationType getType() {
    return type;
  }

  public void setType(NotificationType type) {
    this.type = type;
  }

  public String getSubject() {
    return subject;
  }

  public void setSubject(String subject) {
    this.subject = subject;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public UUID getEventId() {
    return eventId;
  }

  public void setEventId(UUID eventId) {
    this.eventId = eventId;
  }

  public NotificationStatus getStatus() {
    return status;
  }

  public void setStatus(NotificationStatus status) {
    this.status = status;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }

  public Instant getSentAt() {
    return sentAt;
  }

  public void setSentAt(Instant sentAt) {
    this.sentAt = sentAt;
  }

  public Instant getReadAt() {
    return readAt;
  }

  public void setReadAt(Instant readAt) {
    this.readAt = readAt;
  }
}
