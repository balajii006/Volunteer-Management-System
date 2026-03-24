package com.volunteer.eventservice.service;

import com.volunteer.eventservice.domain.Event;
import com.volunteer.eventservice.domain.EventStatus;
import com.volunteer.eventservice.repository.EventRepository;
import com.volunteer.eventservice.repository.FeedbackRepository;
import com.volunteer.eventservice.web.dto.CreateEventRequest;
import com.volunteer.eventservice.web.dto.UpdateEventRequest;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class EventService {
  private final EventRepository eventRepository;
  private final FeedbackRepository feedbackRepository;

  public EventService(EventRepository eventRepository, FeedbackRepository feedbackRepository) {
    this.eventRepository = eventRepository;
    this.feedbackRepository = feedbackRepository;
  }

  @Transactional
  @CacheEvict(value = "events", allEntries = true)
  public Event createEvent(CreateEventRequest request, UUID organizerId, String organizerName) {
    Event event = new Event();
    event.setTitle(request.getTitle());
    event.setDescription(request.getDescription());
    event.setLocation(request.getLocation());
    event.setEventDate(request.getEventDate());
    event.setRequiredVolunteers(request.getRequiredVolunteers());
    event.setOrganizerId(organizerId);
    event.setOrganizerName(organizerName);
    event.setStatus(EventStatus.OPEN);
    return eventRepository.save(event);
  }

  @Cacheable(value = "events", key = "#root.args[0]")
  public Event getEventById(UUID id) {
    return eventRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Event not found"));
  }

  @Cacheable(value = "events", key = "'all'")
  public List<Event> getAllEvents() {
    return eventRepository.findAll();
  }

  @Cacheable(value = "events", key = "'upcoming'")
  public List<Event> getUpcomingEvents() {
    return eventRepository.findByStatusAndEventDateAfter(EventStatus.OPEN, LocalDateTime.now());
  }

  @Cacheable(value = "events", key = "#root.args[0]")
  public List<Event> getEventsByOrganizer(UUID organizerId) {
    return eventRepository.findByOrganizerId(organizerId);
  }

  @Transactional
  @CacheEvict(value = "events", allEntries = true)
  public Event updateEvent(UUID id, UpdateEventRequest request, UUID organizerId) {
    Event event = getEventById(id);
    
    if (!event.getOrganizerId().equals(organizerId)) {
      throw new IllegalArgumentException("Only the organizer can update this event");
    }

    if (request.getTitle() != null) {
      event.setTitle(request.getTitle());
    }
    if (request.getDescription() != null) {
      event.setDescription(request.getDescription());
    }
    if (request.getLocation() != null) {
      event.setLocation(request.getLocation());
    }
    if (request.getEventDate() != null) {
      event.setEventDate(request.getEventDate());
    }
    if (request.getRequiredVolunteers() != null) {
      event.setRequiredVolunteers(request.getRequiredVolunteers());
      updateEventStatus(event);
    }
    if (request.getStatus() != null) {
      event.setStatus(request.getStatus());
    }

    return eventRepository.save(event);
  }

  @Transactional
  @CacheEvict(value = "events", allEntries = true)
  public void deleteEvent(UUID id, UUID organizerId) {
    Event event = getEventById(id);
    
    if (!event.getOrganizerId().equals(organizerId)) {
      throw new IllegalArgumentException("Only the organizer can delete this event");
    }

    eventRepository.deleteById(id);
  }

  @Transactional
  @CacheEvict(value = "events", allEntries = true)
  public void incrementRegisteredVolunteers(UUID eventId) {
    Event event = getEventById(eventId);
    event.setRegisteredVolunteers(event.getRegisteredVolunteers() + 1);
    updateEventStatus(event);
    eventRepository.save(event);
  }

  @Transactional
  @CacheEvict(value = "events", allEntries = true)
  public void decrementRegisteredVolunteers(UUID eventId) {
    Event event = getEventById(eventId);
    if (event.getRegisteredVolunteers() > 0) {
      event.setRegisteredVolunteers(event.getRegisteredVolunteers() - 1);
      updateEventStatus(event);
      eventRepository.save(event);
    }
  }

  private void updateEventStatus(Event event) {
    if (event.getRegisteredVolunteers() >= event.getRequiredVolunteers()) {
      event.setStatus(EventStatus.FULL);
    } else if (event.getStatus() == EventStatus.FULL) {
      event.setStatus(EventStatus.OPEN);
    }
  }

  @Cacheable(value = "events", key = "'rating_' + #root.args[0]")
  public Double getAverageRating(UUID eventId) {
    return feedbackRepository.getAverageRatingForEvent(eventId);
  }
}
