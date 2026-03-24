package com.volunteer.eventservice.web;

import com.volunteer.eventservice.domain.Participation;
import com.volunteer.eventservice.service.ParticipationService;
import com.volunteer.eventservice.web.dto.ParticipationResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/participations")
public class ParticipationController {
  private final ParticipationService participationService;

  public ParticipationController(ParticipationService participationService) {
    this.participationService = participationService;
  }

  @PostMapping("/events/{eventId}/register")
  public ParticipationResponse registerForEvent(@PathVariable("eventId") UUID eventId, Authentication authentication) {
    Jwt jwt = (Jwt) authentication.getPrincipal();
    UUID volunteerId = UUID.fromString(jwt.getClaimAsString("userId"));
    String volunteerName = jwt.getClaimAsString("username");
    String volunteerEmail = jwt.getSubject();

    Participation participation = participationService.registerForEvent(eventId, volunteerId, volunteerName, volunteerEmail);
    return toResponse(participation);
  }

  @PostMapping("/events/{eventId}/cancel")
  public Map<String, String> cancelParticipation(@PathVariable("eventId") UUID eventId, Authentication authentication) {
    Jwt jwt = (Jwt) authentication.getPrincipal();
    UUID volunteerId = UUID.fromString(jwt.getClaimAsString("userId"));
    participationService.cancelParticipation(eventId, volunteerId);
    return Map.of("message", "Participation cancelled successfully");
  }

  @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
  @GetMapping("/events/{eventId}")
  public List<ParticipationResponse> getEventParticipations(@PathVariable("eventId") UUID eventId) {
    return participationService.getEventParticipations(eventId).stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  @GetMapping("/my-participations")
  public List<ParticipationResponse> getMyParticipations(Authentication authentication) {
    Jwt jwt = (Jwt) authentication.getPrincipal();
    UUID volunteerId = UUID.fromString(jwt.getClaimAsString("userId"));
    return participationService.getVolunteerParticipations(volunteerId).stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  @GetMapping("/me")
  public List<ParticipationResponse> getMeParticipations(Authentication authentication) {
    return getMyParticipations(authentication);
  }

  @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
  @GetMapping("/events/{eventId}/participants")
  public List<ParticipationResponse> getEventParticipants(@PathVariable("eventId") UUID eventId) {
    return getEventParticipations(eventId);
  }

  @PutMapping("/{participationId}/mark-attended")
  public ParticipationResponse markAttended(@PathVariable("participationId") UUID participationId) {
    Participation participation = participationService.markAttended(participationId);
    return toResponse(participation);
  }

  @PutMapping("/events/{eventId}/volunteers/{volunteerId}/attendance")
  public Map<String, String> markAttendance(@PathVariable("eventId") UUID eventId,
      @PathVariable("volunteerId") UUID volunteerId,
      @RequestParam boolean attended) {
    participationService.markAttendance(eventId, volunteerId, attended);
    return Map.of("message", "Attendance marked successfully");
  }

  @PutMapping("/events/{eventId}/volunteers/{volunteerId}/role")
  public Map<String, String> updateRole(@PathVariable("eventId") UUID eventId,
      @PathVariable("volunteerId") UUID volunteerId,
      @RequestParam String role) {
    participationService.updateRole(eventId, volunteerId, role);
    return Map.of("message", "Role updated successfully");
  }

  private ParticipationResponse toResponse(Participation p) {
    return new ParticipationResponse(
        p.getId(),
        p.getEventId(),
        p.getVolunteerId(),
        p.getVolunteerName(),
        p.getVolunteerEmail(),
        p.getStatus(),
        p.getRolePlayed(),
        p.getRegisteredAt()
    );
  }
}
