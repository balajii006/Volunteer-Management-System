package com.volunteer.notificationservice.domain;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "notifications")
public class Notification {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "recipient_id", nullable = false)
  private UUID recipientId;

  @Column(name = "recipient_email", nullable = false, length = 120)
  private String recipientEmail;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 50)
  private NotificationType type;

  @Column(nullable = false, length = 200)
  private String subject;

  @Column(columnDefinition = "TEXT", nullable = false)
  private String message;

  @Column(name = "event_id")
  private UUID eventId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30)
  private NotificationStatus status = NotificationStatus.PENDING;

  @Column(name = "sent_at")
  private Instant sentAt;

  @Column(name = "read_at")
  private Instant readAt;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @PrePersist
  public void onCreate() {
    this.createdAt = Instant.now();
    if (this.status == null) {
      this.status = NotificationStatus.PENDING;
    }
  }

  // Getters and Setters
  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public UUID getRecipientId() {
    return recipientId;
  }

  public void setRecipientId(UUID recipientId) {
    this.recipientId = recipientId;
  }

  public String getRecipientEmail() {
    return recipientEmail;
  }

  public void setRecipientEmail(String recipientEmail) {
    this.recipientEmail = recipientEmail;
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

  public Instant getCreatedAt() {
    return createdAt;
  }
}
