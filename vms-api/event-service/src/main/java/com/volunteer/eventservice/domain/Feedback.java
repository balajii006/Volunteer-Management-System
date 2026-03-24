package com.volunteer.eventservice.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "feedbacks", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"event_id", "volunteer_id"})
})
public class Feedback {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "event_id", nullable = false)
  private UUID eventId;

  @Column(name = "volunteer_id", nullable = false)
  private UUID volunteerId;

  @Column(name = "volunteer_name", nullable = false, length = 100)
  private String volunteerName;

  @Column(nullable = false)
  private Integer rating;

  @Column(columnDefinition = "TEXT")
  private String comment;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @PrePersist
  public void onCreate() {
    this.createdAt = Instant.now();
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

  public Integer getRating() {
    return rating;
  }

  public void setRating(Integer rating) {
    this.rating = rating;
  }

  public String getComment() {
    return comment;
  }

  public void setComment(String comment) {
    this.comment = comment;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }
}
