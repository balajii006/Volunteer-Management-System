package com.volunteer.eventservice.web;

import com.volunteer.eventservice.domain.Event;
import com.volunteer.eventservice.service.EventService;
import com.volunteer.eventservice.web.dto.CreateEventRequest;
import com.volunteer.eventservice.web.dto.EventResponse;
import com.volunteer.eventservice.web.dto.UpdateEventRequest;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
public class EventController {
  private final EventService eventService;

  public EventController(EventService eventService) {
    this.eventService = eventService;
  }

  @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
  @PostMapping
  public EventResponse createEvent(@Valid @RequestBody CreateEventRequest request, Authentication authentication) {
    Jwt jwt = (Jwt) authentication.getPrincipal();
    UUID organizerId = UUID.fromString(jwt.getClaimAsString("userId"));
    String organizerName = jwt.getClaimAsString("username");

    Event event = eventService.createEvent(request, organizerId, organizerName);
    return toResponse(event);
  }

  @GetMapping
  public List<EventResponse> getAllEvents(@RequestParam(name = "upcoming", required = false) Boolean upcoming) {
    List<Event> events = upcoming != null && upcoming
        ? eventService.getUpcomingEvents()
        : eventService.getAllEvents();
    return events.stream().map(this::toResponse).collect(Collectors.toList());
  }

  @GetMapping("/{id}")
  public EventResponse getEvent(@PathVariable("id") UUID id) {
    Event event = eventService.getEventById(id);
    return toResponse(event);
  }

  @GetMapping("/organizer/my-events")
  public List<EventResponse> getMyEvents(Authentication authentication) {
    Jwt jwt = (Jwt) authentication.getPrincipal();
    UUID organizerId = UUID.fromString(jwt.getClaimAsString("userId"));
    List<Event> events = eventService.getEventsByOrganizer(organizerId);
    return events.stream().map(this::toResponse).collect(Collectors.toList());
  }

  @PutMapping("/{id}")
  public EventResponse updateEvent(@PathVariable("id") UUID id, @Valid @RequestBody UpdateEventRequest request,
      Authentication authentication) {
    Jwt jwt = (Jwt) authentication.getPrincipal();
    UUID organizerId = UUID.fromString(jwt.getClaimAsString("userId"));
    Event event = eventService.updateEvent(id, request, organizerId);
    return toResponse(event);
  }

  @DeleteMapping("/{id}")
  public void deleteEvent(@PathVariable("id") UUID id, Authentication authentication) {
    Jwt jwt = (Jwt) authentication.getPrincipal();
    UUID organizerId = UUID.fromString(jwt.getClaimAsString("userId"));
    eventService.deleteEvent(id, organizerId);
  }

  private EventResponse toResponse(Event event) {
    EventResponse response = new EventResponse(
        event.getId(),
        event.getTitle(),
        event.getDescription(),
        event.getLocation(),
        event.getEventDate(),
        event.getRequiredVolunteers(),
        event.getRegisteredVolunteers(),
        event.getOrganizerId(),
        event.getOrganizerName(),
        event.getStatus(),
        event.getCreatedAt(),
        event.getUpdatedAt()
    );
    Double avgRating = eventService.getAverageRating(event.getId());
    response.setAverageRating(avgRating);
    return response;
  }
}
