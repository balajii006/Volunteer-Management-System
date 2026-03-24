package com.volunteer.eventservice.service;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.UUID;

/**
 * Example service showing how to use CircuitBreaker for inter-service communication.
 * This is a reference implementation for calling other microservices with fault tolerance.
 */
@Service
public class InterServiceCallExample {
  private static final Logger logger = LoggerFactory.getLogger(InterServiceCallExample.class);
  private final RestTemplate restTemplate;

  public InterServiceCallExample(RestTemplate restTemplate) {
    this.restTemplate = restTemplate;
  }

  /**
   * Example: Call user service with circuit breaker protection
   * If user service fails, circuit breaker will:
   * 1. Track failure rate
   * 2. Open circuit when failure rate exceeds threshold
   * 3. Return fallback response instead of calling service
   */
  @CircuitBreaker(name = "user-service", fallbackMethod = "getUserFallback")
  public String getUserInfo(UUID userId) {
    logger.info("Calling user service for user: {}", userId);
    // This would call: http://user-service/api/users/{userId}
    // If it fails consistently, circuit breaker opens and fallback is used
    String response = restTemplate.getForObject(
        "http://user-service/api/users/" + userId,
        String.class
    );
    return response;
  }

  /**
   * Fallback method when circuit breaker is open.
   * Called when user service is unavailable.
   */
  public String getUserFallback(UUID userId, Exception ex) {
    logger.warn("Circuit breaker open for user-service. Using fallback for user: {}", userId);
    return "{\"id\":\"" + userId + "\",\"username\":\"unknown\",\"fallback\":true}";
  }

  /**
   * Example: Call notification service with circuit breaker
   */
  @CircuitBreaker(name = "notification-service", fallbackMethod = "sendNotificationFallback")
  public void sendNotification(UUID userId, String message) {
    logger.info("Sending notification to user: {}", userId);
    // Call notification service
    restTemplate.postForObject(
        "http://notification-service/api/notifications",
        new NotificationRequest(userId, message),
        Void.class
    );
  }

  /**
   * Fallback for notification service - queue the notification for retry
   */
  public void sendNotificationFallback(UUID userId, String message, Exception ex) {
    logger.warn("Notification service unavailable. Queuing for later: {}", userId);
    // Queue in a backup notification queue
    // Example: messageQueue.enqueue(new NotificationTask(userId, message));
  }

  // Helper DTO
  public static class NotificationRequest {
    public UUID userId;
    public String message;

    public NotificationRequest(UUID userId, String message) {
      this.userId = userId;
      this.message = message;
    }
  }
}
