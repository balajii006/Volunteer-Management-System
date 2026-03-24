package com.volunteer.eventservice.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "events")
public class Event {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(nullable = false, length = 200)
  private String title;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Column(nullable = false, length = 500)
  private String location;

  @Column(name = "event_date", nullable = false)
  private LocalDateTime eventDate;

  @Column(name = "required_volunteers", nullable = false)
  private Integer requiredVolunteers;

  @Column(name = "registered_volunteers", nullable = false)
  private Integer registeredVolunteers = 0;

  @Column(name = "organizer_id", nullable = false)
  private UUID organizerId;

  @Column(name = "organizer_name", nullable = false, length = 100)
  private String organizerName;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30)
  private EventStatus status = EventStatus.OPEN;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  @PrePersist
  public void onCreate() {
    Instant now = Instant.now();
    this.createdAt = now;
    this.updatedAt = now;
    if (this.registeredVolunteers == null) {
      this.registeredVolunteers = 0;
    }
    if (this.status == null) {
      this.status = EventStatus.OPEN;
    }
  }

  @PreUpdate
  public void onUpdate() {
    this.updatedAt = Instant.now();
  }

  // Getters and Setters
  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getLocation() {
    return location;
  }

  public void setLocation(String location) {
    this.location = location;
  }

  public LocalDateTime getEventDate() {
    return eventDate;
  }

  public void setEventDate(LocalDateTime eventDate) {
    this.eventDate = eventDate;
  }

  public Integer getRequiredVolunteers() {
    return requiredVolunteers;
  }

  public void setRequiredVolunteers(Integer requiredVolunteers) {
    this.requiredVolunteers = requiredVolunteers;
  }

  public Integer getRegisteredVolunteers() {
    return registeredVolunteers;
  }

  public void setRegisteredVolunteers(Integer registeredVolunteers) {
    this.registeredVolunteers = registeredVolunteers;
  }

  public UUID getOrganizerId() {
    return organizerId;
  }

  public void setOrganizerId(UUID organizerId) {
    this.organizerId = organizerId;
  }

  public String getOrganizerName() {
    return organizerName;
  }

  public void setOrganizerName(String organizerName) {
    this.organizerName = organizerName;
  }

  public EventStatus getStatus() {
    return status;
  }

  public void setStatus(EventStatus status) {
    this.status = status;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }
}
