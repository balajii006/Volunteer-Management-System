package com.volunteer.eventservice.web.dto;

import com.volunteer.eventservice.domain.ParticipationStatus;
import java.time.Instant;
import java.util.UUID;

public class ParticipationResponse {
  private UUID id;
  private UUID eventId;
  private String eventTitle;
  private UUID volunteerId;
  private String volunteerName;
  private String volunteerEmail;
  private ParticipationStatus status;
  private String rolePlayed;
  private Instant registeredAt;

  public ParticipationResponse(UUID id, UUID eventId, UUID volunteerId, String volunteerName,
      String volunteerEmail, ParticipationStatus status, String rolePlayed, Instant registeredAt) {
    this.id = id;
    this.eventId = eventId;
    this.volunteerId = volunteerId;
    this.volunteerName = volunteerName;
    this.volunteerEmail = volunteerEmail;
    this.status = status;
    this.rolePlayed = rolePlayed;
    this.registeredAt = registeredAt;
  }

  // Getters and Setters
  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public UUID getEventId() {
    return eventId;
  }

  public void setEventId(UUID eventId) {
    this.eventId = eventId;
  }

  public String getEventTitle() {
    return eventTitle;
  }

  public void setEventTitle(String eventTitle) {
    this.eventTitle = eventTitle;
  }

  public UUID getVolunteerId() {
    return volunteerId;
  }

  public void setVolunteerId(UUID volunteerId) {
    this.volunteerId = volunteerId;
  }

  public String getVolunteerName() {
    return volunteerName;
  }

  public void setVolunteerName(String volunteerName) {
    this.volunteerName = volunteerName;
  }

  public String getVolunteerEmail() {
    return volunteerEmail;
  }

  public void setVolunteerEmail(String volunteerEmail) {
    this.volunteerEmail = volunteerEmail;
  }

  public ParticipationStatus getStatus() {
    return status;
  }

  public void setStatus(ParticipationStatus status) {
    this.status = status;
  }

  public String getRolePlayed() {
    return rolePlayed;
  }

  public void setRolePlayed(String rolePlayed) {
    this.rolePlayed = rolePlayed;
  }

  public Instant getRegisteredAt() {
    return registeredAt;
  }

  public void setRegisteredAt(Instant registeredAt) {
    this.registeredAt = registeredAt;
  }
}
