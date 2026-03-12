package com.vms.usermanagement.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "organizer_id")
    private User organizer;

    private String title;
    private String description;
    private String locationName;
    private String locationAddress;
    private Double lat;
    private Double lng;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer requiredVolunteers;
    private Integer spotsFilled = 0;
    private String tags;

    @Enumerated(EnumType.STRING)
    private Status status = Status.PUBLISHED;

    private LocalDateTime createdAt;

    public enum Status { PUBLISHED, CANCELLED }

    @PrePersist
    public void onCreate() { createdAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getOrganizer() { return organizer; }
    public void setOrganizer(User organizer) { this.organizer = organizer; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }
    public String getLocationAddress() { return locationAddress; }
    public void setLocationAddress(String locationAddress) { this.locationAddress = locationAddress; }
    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }
    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    public Integer getRequiredVolunteers() { return requiredVolunteers; }
    public void setRequiredVolunteers(Integer requiredVolunteers) { this.requiredVolunteers = requiredVolunteers; }
    public Integer getSpotsFilled() { return spotsFilled; }
    public void setSpotsFilled(Integer spotsFilled) { this.spotsFilled = spotsFilled; }
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}