package com.volunteer.eventservice.web.dto;

import com.volunteer.eventservice.domain.EventStatus;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public class UpdateEventRequest {
  @Size(max = 200, message = "Title must not exceed 200 characters")
  private String title;

  private String description;

  @Size(max = 500, message = "Location must not exceed 500 characters")
  private String location;

  @Future(message = "Event date must be in the future")
  private LocalDateTime eventDate;

  @Min(value = 1, message = "At least 1 volunteer is required")
  private Integer requiredVolunteers;

  private EventStatus status;

  // Getters and Setters
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

  public EventStatus getStatus() {
    return status;
  }

  public void setStatus(EventStatus status) {
    this.status = status;
  }
}
