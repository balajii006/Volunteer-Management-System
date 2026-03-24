package com.volunteer.eventservice.service;

import com.volunteer.eventservice.domain.NotificationOutbox;
import com.volunteer.eventservice.domain.NotificationOutboxStatus;
import com.volunteer.eventservice.integration.notification.NotificationRequest;
import com.volunteer.eventservice.repository.NotificationOutboxRepository;
import java.time.Instant;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

@Service
public class NotificationOutboxService {
  private static final Logger logger = LoggerFactory.getLogger(NotificationOutboxService.class);
  private final NotificationOutboxRepository outboxRepository;
  private final RestTemplate restTemplate;

  @Value("${notification.outbox.max-attempts:5}")
  private int maxAttempts;

  @Value("${notification.service.url:http://notification-service}")
  private String notificationServiceUrl;

  public NotificationOutboxService(
      NotificationOutboxRepository outboxRepository,
      RestTemplate restTemplate) {
    this.outboxRepository = outboxRepository;
    this.restTemplate = restTemplate;
  }

  @Transactional
  public void enqueue(NotificationRequest request, String reason) {
    NotificationOutbox outbox = new NotificationOutbox();
    outbox.setRecipientId(request.getRecipientId());
    outbox.setRecipientEmail(request.getRecipientEmail());
    outbox.setType(request.getType());
    outbox.setSubject(request.getSubject());
    outbox.setMessage(request.getMessage());
    outbox.setEventId(request.getEventId());
    outbox.setStatus(NotificationOutboxStatus.PENDING);
    outboxRepository.save(outbox);
    logger.warn("Notification queued for retry. Reason: {}", reason);
  }

  @Scheduled(fixedDelayString = "${notification.outbox.retry-delay-ms:60000}")
  @Transactional
  public void retryPending() {
    List<NotificationOutbox> pending = outboxRepository
        .findTop50ByStatusOrderByCreatedAtAsc(NotificationOutboxStatus.PENDING);
    if (pending.isEmpty()) {
      return;
    }

    for (NotificationOutbox item : pending) {
      if (item.getAttempts() >= maxAttempts) {
        item.setStatus(NotificationOutboxStatus.FAILED);
        item.setLastAttemptAt(Instant.now());
        outboxRepository.save(item);
        continue;
      }
      try {
        NotificationRequest request = new NotificationRequest(
            item.getRecipientId(),
            item.getRecipientEmail(),
            item.getType(),
            item.getSubject(),
            item.getMessage(),
            item.getEventId());
        sendDirect(request);
        item.setStatus(NotificationOutboxStatus.SENT);
      } catch (Exception ex) {
        item.setAttempts(item.getAttempts() + 1);
        item.setLastAttemptAt(Instant.now());
        outboxRepository.save(item);
        logger.warn("Retry failed for notification {}: {}", item.getId(), ex.getMessage());
        continue;
      }
      item.setAttempts(item.getAttempts() + 1);
      item.setLastAttemptAt(Instant.now());
      outboxRepository.save(item);
    }
  }

  private void sendDirect(NotificationRequest request) {
    String url = notificationServiceUrl + "/api/notifications";
    restTemplate.postForObject(url, request, Void.class);
  }
}
