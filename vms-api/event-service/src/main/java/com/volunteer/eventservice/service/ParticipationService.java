package com.volunteer.eventservice.service;

import com.volunteer.eventservice.domain.Event;
import com.volunteer.eventservice.domain.EventStatus;
import com.volunteer.eventservice.domain.Participation;
import com.volunteer.eventservice.domain.ParticipationStatus;
import com.volunteer.eventservice.repository.ParticipationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class ParticipationService {
  private final ParticipationRepository participationRepository;
  private final EventService eventService;
  private final NotificationDispatchService notificationDispatchService;

  public ParticipationService(
      ParticipationRepository participationRepository,
      EventService eventService,
      NotificationDispatchService notificationDispatchService) {
    this.participationRepository = participationRepository;
    this.eventService = eventService;
    this.notificationDispatchService = notificationDispatchService;
  }

  @Transactional
  public Participation registerForEvent(UUID eventId, UUID volunteerId, String volunteerName, String volunteerEmail) {
    Event event = eventService.getEventById(eventId);
    
    if (event.getStatus() == EventStatus.FULL) {
      throw new IllegalArgumentException("Event is full");
    }
    if (event.getStatus() == EventStatus.COMPLETED || event.getStatus() == EventStatus.CANCELLED) {
      throw new IllegalArgumentException("Cannot register for this event");
    }

    var existing = participationRepository.findByEventIdAndVolunteerId(eventId, volunteerId);
    if (existing.isPresent()) {
      Participation prev = existing.get();
      if (prev.getStatus() == ParticipationStatus.CANCELLED) {
        // Re-register: reactivate the cancelled participation
        prev.setStatus(ParticipationStatus.REGISTERED);
        prev.setCancelledAt(null);
        Participation saved = participationRepository.save(prev);
        eventService.incrementRegisteredVolunteers(eventId);
        try {
          notificationDispatchService.sendRegistrationNotification(
              event, volunteerId, volunteerEmail, volunteerName);
        } catch (Exception e) {
          org.slf4j.LoggerFactory.getLogger(ParticipationService.class)
              .warn("Failed to send registration notification for event {}: {}", eventId, e.getMessage());
        }
        return saved;
      }
      throw new IllegalArgumentException("Already registered for this event");
    }

    Participation participation = new Participation();
    participation.setEventId(eventId);
    participation.setVolunteerId(volunteerId);
    participation.setVolunteerName(volunteerName);
    participation.setVolunteerEmail(volunteerEmail);
    participation.setStatus(ParticipationStatus.REGISTERED);

    Participation saved = participationRepository.save(participation);
    eventService.incrementRegisteredVolunteers(eventId);
    try {
      notificationDispatchService.sendRegistrationNotification(
          event,
          volunteerId,
          volunteerEmail,
          volunteerName);
    } catch (Exception e) {
      // Don't fail registration if notification dispatch fails
      org.slf4j.LoggerFactory.getLogger(ParticipationService.class)
          .warn("Failed to send registration notification for event {}: {}", eventId, e.getMessage());
    }

    return saved;
  }

  @Transactional
  public void cancelParticipation(UUID eventId, UUID volunteerId) {
    Participation participation = participationRepository.findByEventIdAndVolunteerId(eventId, volunteerId)
        .orElseThrow(() -> new IllegalArgumentException("Participation not found"));

    if (participation.getStatus() == ParticipationStatus.CANCELLED) {
      throw new IllegalArgumentException("Participation already cancelled");
    }

    participation.setStatus(ParticipationStatus.CANCELLED);
    participation.setCancelledAt(Instant.now());
    participationRepository.save(participation);
    eventService.decrementRegisteredVolunteers(eventId);

    Event event = eventService.getEventById(eventId);
    try {
      notificationDispatchService.sendCancellationNotification(
          event,
          volunteerId,
          participation.getVolunteerEmail(),
          participation.getVolunteerName());
    } catch (Exception e) {
      org.slf4j.LoggerFactory.getLogger(ParticipationService.class)
          .warn("Failed to send cancellation notification for event {}: {}", eventId, e.getMessage());
    }
  }

  public List<Participation> getEventParticipations(UUID eventId) {
    return participationRepository.findByEventId(eventId);
  }

  public List<Participation> getVolunteerParticipations(UUID volunteerId) {
    return participationRepository.findByVolunteerId(volunteerId);
  }

  @Transactional
  public void markAttendance(UUID eventId, UUID volunteerId, boolean attended) {
    Participation participation = participationRepository.findByEventIdAndVolunteerId(eventId, volunteerId)
        .orElseThrow(() -> new IllegalArgumentException("Participation not found"));

    if (attended) {
      participation.setStatus(ParticipationStatus.ATTENDED);
    } else {
      participation.setStatus(ParticipationStatus.NO_SHOW);
    }
    participationRepository.save(participation);
  }

  @Transactional
  public Participation markAttended(UUID participationId) {
    Participation participation = participationRepository.findById(participationId)
        .orElseThrow(() -> new IllegalArgumentException("Participation not found"));
    participation.setStatus(ParticipationStatus.ATTENDED);
    return participationRepository.save(participation);
  }

  @Transactional
  public void updateRole(UUID eventId, UUID volunteerId, String role) {
    Participation participation = participationRepository.findByEventIdAndVolunteerId(eventId, volunteerId)
        .orElseThrow(() -> new IllegalArgumentException("Participation not found"));
    
    participation.setRolePlayed(role);
    participationRepository.save(participation);
  }
}
