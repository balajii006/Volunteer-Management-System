package com.volunteer.notificationservice.web.dto;

import java.util.UUID;

import com.volunteer.notificationservice.domain.NotificationType;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateNotificationRequest {
  @NotNull(message = "Recipient ID is required")
  private UUID recipientId;

  @NotBlank(message = "Recipient email is required")
  @Email(message = "Invalid email format")
  private String recipientEmail;

  @NotNull(message = "Notification type is required")
  private NotificationType type;

  @NotBlank(message = "Subject is required")
  @Size(max = 200, message = "Subject must not exceed 200 characters")
  private String subject;

  @NotBlank(message = "Message is required")
  private String message;

  private UUID eventId;

  // Getters and Setters
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
