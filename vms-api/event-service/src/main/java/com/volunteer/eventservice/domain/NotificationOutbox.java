package com.volunteer.eventservice.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notification_outbox")
public class NotificationOutbox {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "recipient_id", nullable = false)
  private UUID recipientId;

  @Column(name = "recipient_email", nullable = false, length = 120)
  private String recipientEmail;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30)
  private NotificationType type;

  @Column(nullable = false, length = 200)
  private String subject;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String message;

  @Column(name = "event_id")
  private UUID eventId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private NotificationOutboxStatus status = NotificationOutboxStatus.PENDING;

  @Column(nullable = false)
  private Integer attempts = 0;

  @Column(name = "last_attempt_at")
  private Instant lastAttemptAt;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  @PrePersist
  public void onCreate() {
    Instant now = Instant.now();
    this.createdAt = now;
    this.updatedAt = now;
    if (this.attempts == null) {
      this.attempts = 0;
    }
    if (this.status == null) {
      this.status = NotificationOutboxStatus.PENDING;
    }
  }

  @PreUpdate
  public void onUpdate() {
    this.updatedAt = Instant.now();
  }

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

  public NotificationOutboxStatus getStatus() {
    return status;
  }

  public void setStatus(NotificationOutboxStatus status) {
    this.status = status;
  }

  public Integer getAttempts() {
    return attempts;
  }

  public void setAttempts(Integer attempts) {
    this.attempts = attempts;
  }

  public Instant getLastAttemptAt() {
    return lastAttemptAt;
  }

  public void setLastAttemptAt(Instant lastAttemptAt) {
    this.lastAttemptAt = lastAttemptAt;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }
}
