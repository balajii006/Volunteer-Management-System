package com.volunteer.eventservice.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "participations", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"event_id", "volunteer_id"})
})
public class Participation {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "event_id", nullable = false)
  private UUID eventId;

  @Column(name = "volunteer_id", nullable = false)
  private UUID volunteerId;

  @Column(name = "volunteer_name", nullable = false, length = 100)
  private String volunteerName;

  @Column(name = "volunteer_email", nullable = false, length = 120)
  private String volunteerEmail;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30)
  private ParticipationStatus status = ParticipationStatus.REGISTERED;

  @Column(name = "role_played", length = 100)
  private String rolePlayed;

  @Column(name = "registered_at", nullable = false, updatable = false)
  private Instant registeredAt;

  @Column(name = "cancelled_at")
  private Instant cancelledAt;

  @PrePersist
  public void onCreate() {
    this.registeredAt = Instant.now();
    if (this.status == null) {
      this.status = ParticipationStatus.REGISTERED;
    }
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

  public Instant getCancelledAt() {
    return cancelledAt;
  }

  public void setCancelledAt(Instant cancelledAt) {
    this.cancelledAt = cancelledAt;
  }
}
