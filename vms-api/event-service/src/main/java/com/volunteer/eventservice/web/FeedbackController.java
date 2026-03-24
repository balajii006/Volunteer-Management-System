package com.volunteer.eventservice.web;

import com.volunteer.eventservice.domain.Feedback;
import com.volunteer.eventservice.service.FeedbackService;
import com.volunteer.eventservice.web.dto.FeedbackRequest;
import com.volunteer.eventservice.web.dto.FeedbackResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/feedbacks")
public class FeedbackController {
  private final FeedbackService feedbackService;

  public FeedbackController(FeedbackService feedbackService) {
    this.feedbackService = feedbackService;
  }

  @PostMapping("/events/{eventId}")
  public FeedbackResponse submitFeedback(@PathVariable("eventId") UUID eventId,
      @Valid @RequestBody FeedbackRequest request,
      Authentication authentication) {
    Jwt jwt = (Jwt) authentication.getPrincipal();
    UUID volunteerId = UUID.fromString(jwt.getClaimAsString("userId"));
    String volunteerName = jwt.getClaimAsString("username");

    Feedback feedback = feedbackService.submitFeedback(eventId, volunteerId, volunteerName, request);
    return toResponse(feedback);
  }

  @PostMapping("/events/{eventId}/submit")
  public FeedbackResponse submitFeedbackAlias(@PathVariable("eventId") UUID eventId,
      @Valid @RequestBody FeedbackRequest request, Authentication authentication) {
    return submitFeedback(eventId, request, authentication);
  }

  @GetMapping("/events/{eventId}")
  public List<FeedbackResponse> getEventFeedbacks(@PathVariable("eventId") UUID eventId) {
    return feedbackService.getEventFeedbacks(eventId).stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  @GetMapping("/events/{eventId}/average-rating")
  public Double getAverageRating(@PathVariable("eventId") UUID eventId) {
    Double avgRating = feedbackService.getAverageRating(eventId);
    return avgRating != null ? avgRating : 0.0;
  }

  private FeedbackResponse toResponse(Feedback f) {
    return new FeedbackResponse(
        f.getId(),
        f.getEventId(),
        f.getVolunteerId(),
        f.getVolunteerName(),
        f.getRating(),
        f.getComment(),
        f.getCreatedAt()
    );
  }
}
