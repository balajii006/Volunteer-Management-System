package com.volunteer.notificationservice.web;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.volunteer.notificationservice.domain.Notification;
import com.volunteer.notificationservice.service.NotificationService;
import com.volunteer.notificationservice.web.dto.CreateNotificationRequest;
import com.volunteer.notificationservice.web.dto.NotificationResponse;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
  private final NotificationService notificationService;

  public NotificationController(NotificationService notificationService) {
    this.notificationService = notificationService;
  }

  @PostMapping
  public NotificationResponse createNotification(@Valid @RequestBody CreateNotificationRequest request) {
    Notification notification = notificationService.createNotification(
        request.getRecipientId(),
        request.getRecipientEmail(),
        request.getType(),
        request.getSubject(),
        request.getMessage(),
        request.getEventId()
    );
    return toResponse(notification);
  }

  @PostMapping("/{id}/send")
  public Map<String, String> sendNotification(@PathVariable("id") UUID id) {
    notificationService.sendNotification(id);
    return Map.of("message", "Notification sent successfully");
  }

  @PostMapping("/send-pending")
  public Map<String, String> sendPendingNotifications() {
    notificationService.sendPendingNotifications();
    return Map.of("message", "Pending notifications processed");
  }

  @GetMapping
  public List<NotificationResponse> getNotifications(Authentication authentication) {
    return getMyNotifications(authentication);
  }

  @GetMapping("/my-notifications")
  public List<NotificationResponse> getMyNotifications(Authentication authentication) {
    Jwt jwt = (Jwt) authentication.getPrincipal();
    UUID userId = UUID.fromString(jwt.getClaimAsString("userId"));
    return notificationService.getUserNotifications(userId).stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  @GetMapping("/all")
  public List<NotificationResponse> getAllNotifications(Authentication authentication) {
    Jwt jwt = (Jwt) authentication.getPrincipal();
    String role = jwt.getClaimAsString("role");
    if (role == null || !"ADMIN".equalsIgnoreCase(role)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
    }
    return notificationService.getAllNotifications().stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  @GetMapping("/admin/history")
  public List<NotificationResponse> getAdminHistory(Authentication authentication) {
    return getAllNotifications(authentication);
  }

  @GetMapping("/unread")
  public List<NotificationResponse> getUnreadNotifications(Authentication authentication) {
    Jwt jwt = (Jwt) authentication.getPrincipal();
    UUID userId = UUID.fromString(jwt.getClaimAsString("userId"));
    return notificationService.getUnreadNotifications(userId).stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  @GetMapping("/unread-count")
  public Map<String, Long> getUnreadCount(Authentication authentication) {
    Jwt jwt = (Jwt) authentication.getPrincipal();
    UUID userId = UUID.fromString(jwt.getClaimAsString("userId"));
    long count = notificationService.getUnreadCount(userId);
    return Map.of("unreadCount", count);
  }

  @PutMapping("/{id}/read")
  public Map<String, String> markAsRead(@PathVariable("id") UUID id, Authentication authentication) {
    Jwt jwt = (Jwt) authentication.getPrincipal();
    UUID userId = UUID.fromString(jwt.getClaimAsString("userId"));
    notificationService.markAsRead(id, userId);
    return Map.of("message", "Notification marked as read");
  }

  @PutMapping("/read-all")
  public Map<String, String> markAllAsRead(Authentication authentication) {
    Jwt jwt = (Jwt) authentication.getPrincipal();
    UUID userId = UUID.fromString(jwt.getClaimAsString("userId"));
    notificationService.markAllAsRead(userId);
    return Map.of("message", "All notifications marked as read");
  }

  private NotificationResponse toResponse(Notification n) {
    return new NotificationResponse(
        n.getId(),
        n.getType(),
        n.getSubject(),
        n.getMessage(),
        n.getEventId(),
        n.getStatus(),
        n.getCreatedAt(),
        n.getSentAt(),
        n.getReadAt()
    );
  }
}
