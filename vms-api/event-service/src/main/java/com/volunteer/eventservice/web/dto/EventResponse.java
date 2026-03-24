package com.volunteer.eventservice.web.dto;

import com.volunteer.eventservice.domain.EventStatus;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

public class EventResponse {
  private UUID id;
  private String title;
  private String description;
  private String location;
  private LocalDateTime eventDate;
  private Integer requiredVolunteers;
  private Integer registeredVolunteers;
  private UUID organizerId;
  private String organizerName;
  private EventStatus status;
  private Double averageRating;
  private Instant createdAt;
  private Instant updatedAt;

  public EventResponse(UUID id, String title, String description, String location,
      LocalDateTime eventDate, Integer requiredVolunteers, Integer registeredVolunteers,
      UUID organizerId, String organizerName, EventStatus status, Instant createdAt, Instant updatedAt) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.location = location;
    this.eventDate = eventDate;
    this.requiredVolunteers = requiredVolunteers;
    this.registeredVolunteers = registeredVolunteers;
    this.organizerId = organizerId;
    this.organizerName = organizerName;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
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

  public Double getAverageRating() {
    return averageRating;
  }

  public void setAverageRating(Double averageRating) {
    this.averageRating = averageRating;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(Instant updatedAt) {
    this.updatedAt = updatedAt;
  }
}
