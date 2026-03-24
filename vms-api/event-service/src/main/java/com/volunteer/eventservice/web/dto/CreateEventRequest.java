package com.volunteer.eventservice.web.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public class CreateEventRequest {
  @NotBlank(message = "Title is required")
  @Size(max = 200, message = "Title must not exceed 200 characters")
  private String title;

  private String description;

  @NotBlank(message = "Location is required")
  @Size(max = 500, message = "Location must not exceed 500 characters")
  private String location;

  @NotNull(message = "Event date is required")
  @Future(message = "Event date must be in the future")
  private LocalDateTime eventDate;

  @NotNull(message = "Required volunteers count is required")
  @Min(value = 1, message = "At least 1 volunteer is required")
  private Integer requiredVolunteers;

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
}
