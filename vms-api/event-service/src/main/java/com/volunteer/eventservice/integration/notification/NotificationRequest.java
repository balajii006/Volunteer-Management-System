package com.volunteer.eventservice.integration.notification;

import java.util.UUID;
import com.volunteer.eventservice.domain.NotificationType;

public class NotificationRequest {
  private UUID recipientId;
  private String recipientEmail;
  private NotificationType type;
  private String subject;
  private String message;
  private UUID eventId;

  public NotificationRequest() {
  }

  public NotificationRequest(UUID recipientId, String recipientEmail, NotificationType type,
      String subject, String message, UUID eventId) {
    this.recipientId = recipientId;
    this.recipientEmail = recipientEmail;
    this.type = type;
    this.subject = subject;
    this.message = message;
    this.eventId = eventId;
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
}
