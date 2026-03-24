package com.volunteer.eventservice.service;

import com.volunteer.eventservice.domain.Feedback;
import com.volunteer.eventservice.domain.Participation;
import com.volunteer.eventservice.domain.ParticipationStatus;
import com.volunteer.eventservice.repository.FeedbackRepository;
import com.volunteer.eventservice.repository.ParticipationRepository;
import com.volunteer.eventservice.web.dto.FeedbackRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
public class FeedbackService {
  private final FeedbackRepository feedbackRepository;
  private final ParticipationRepository participationRepository;

  public FeedbackService(FeedbackRepository feedbackRepository, ParticipationRepository participationRepository) {
    this.feedbackRepository = feedbackRepository;
    this.participationRepository = participationRepository;
  }

  @Transactional
  public Feedback submitFeedback(UUID eventId, UUID volunteerId, String volunteerName, FeedbackRequest request) {
    // Verify volunteer attended the event
    Participation participation = participationRepository.findByEventIdAndVolunteerId(eventId, volunteerId)
        .orElseThrow(() -> new IllegalArgumentException("You must participate in the event to provide feedback"));

    if (participation.getStatus() != ParticipationStatus.ATTENDED) {
      throw new IllegalArgumentException("You must attend the event to provide feedback");
    }

    // Check if feedback already exists
    if (feedbackRepository.findByEventIdAndVolunteerId(eventId, volunteerId).isPresent()) {
      throw new IllegalArgumentException("Feedback already submitted for this event");
    }

    Feedback feedback = new Feedback();
    feedback.setEventId(eventId);
    feedback.setVolunteerId(volunteerId);
    feedback.setVolunteerName(volunteerName);
    feedback.setRating(request.getRating());
    feedback.setComment(request.getComment());

    return feedbackRepository.save(feedback);
  }

  public List<Feedback> getEventFeedbacks(UUID eventId) {
    return feedbackRepository.findByEventId(eventId);
  }

  public Double getAverageRating(UUID eventId) {
    return feedbackRepository.getAverageRatingForEvent(eventId);
  }
}
