package com.volunteer.eventservice.service;

import com.volunteer.eventservice.domain.Event;
import com.volunteer.eventservice.domain.NotificationType;
import com.volunteer.eventservice.integration.notification.NotificationRequest;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class NotificationDispatchService {
  private static final Logger logger = LoggerFactory.getLogger(NotificationDispatchService.class);
  private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

  private final RestTemplate restTemplate;
  private final NotificationOutboxService outboxService;

  @Value("${notification.service.url:http://notification-service}")
  private String notificationServiceUrl;

  public NotificationDispatchService(RestTemplate restTemplate, NotificationOutboxService outboxService) {
    this.restTemplate = restTemplate;
    this.outboxService = outboxService;
  }

  @CircuitBreaker(name = "notification-service", fallbackMethod = "queueNotificationFallback")
  public void sendRegistrationNotification(Event event, UUID volunteerId, String volunteerEmail,
      String volunteerName) {
    String subject = "Registration confirmed: " + event.getTitle();
    String message = String.format(
        "Hi %s, you are registered for %s on %s at %s.",
        volunteerName,
        event.getTitle(),
        event.getEventDate().format(DATE_FORMAT),
        event.getLocation());
    NotificationRequest request = new NotificationRequest(
        volunteerId,
        volunteerEmail,
        NotificationType.VOLUNTEER_REGISTERED,
        subject,
        message,
        event.getId());
    sendDirect(request);
  }

  @CircuitBreaker(name = "notification-service", fallbackMethod = "queueCancellationFallback")
  public void sendCancellationNotification(Event event, UUID volunteerId, String volunteerEmail,
      String volunteerName) {
    String subject = "Registration cancelled: " + event.getTitle();
    String message = String.format(
        "Hi %s, your registration for %s on %s at %s has been cancelled.",
        volunteerName,
        event.getTitle(),
        event.getEventDate().format(DATE_FORMAT),
        event.getLocation());
    NotificationRequest request = new NotificationRequest(
        volunteerId,
        volunteerEmail,
        NotificationType.VOLUNTEER_CANCELLED,
        subject,
        message,
        event.getId());
    sendDirect(request);
  }

  @CircuitBreaker(name = "notification-service", fallbackMethod = "queueNotificationFallback")
  public void sendNotification(NotificationRequest request) {
    sendDirect(request);
  }

  public void sendDirect(NotificationRequest request) {
    String url = notificationServiceUrl + "/api/notifications";
    restTemplate.postForObject(url, request, Void.class);
    logger.info("Notification dispatched to {}", request.getRecipientEmail());
  }

  @SuppressWarnings("unused")
  private void queueNotificationFallback(Event event, UUID volunteerId, String volunteerEmail,
      String volunteerName, Exception ex) {
    logger.warn("Notification service unavailable for registration (event={}), queuing: {}",
        event.getId(), ex.getMessage());
  }

  @SuppressWarnings("unused")
  private void queueCancellationFallback(Event event, UUID volunteerId, String volunteerEmail,
      String volunteerName, Exception ex) {
    logger.warn("Notification service unavailable for cancellation (event={}), queuing: {}",
        event.getId(), ex.getMessage());
  }

  @SuppressWarnings("unused")
  private void queueNotificationFallback(NotificationRequest request, Exception ex) {
    outboxService.enqueue(request, ex.getMessage());
  }
}
