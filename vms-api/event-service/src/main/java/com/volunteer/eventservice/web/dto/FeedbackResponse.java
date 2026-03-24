package com.volunteer.eventservice.web.dto;

import java.time.Instant;
import java.util.UUID;

public class FeedbackResponse {
  private UUID id;
  private UUID eventId;
  private UUID volunteerId;
  private String volunteerName;
  private Integer rating;
  private String comment;
  private Instant createdAt;

  public FeedbackResponse(UUID id, UUID eventId, UUID volunteerId, String volunteerName,
      Integer rating, String comment, Instant createdAt) {
    this.id = id;
    this.eventId = eventId;
    this.volunteerId = volunteerId;
    this.volunteerName = volunteerName;
    this.rating = rating;
    this.comment = comment;
    this.createdAt = createdAt;
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

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }
}
