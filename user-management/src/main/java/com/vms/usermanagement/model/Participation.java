package com.vms.usermanagement.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "participations")
public class Participation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

    @ManyToOne
    @JoinColumn(name = "volunteer_id")
    private User volunteer;

    @Enumerated(EnumType.STRING)
    private Status status = Status.CONFIRMED;

    private String rolePlayed;
    private String notes;
    private String cancelReason;
    private LocalDateTime signedUpAt;
    private LocalDateTime cancelledAt;

    public enum Status { CONFIRMED, CANCELLED, ATTENDED, WAITLISTED }

    @PrePersist
    public void onCreate() { signedUpAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }
    public User getVolunteer() { return volunteer; }
    public void setVolunteer(User volunteer) { this.volunteer = volunteer; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public String getRolePlayed() { return rolePlayed; }
    public void setRolePlayed(String rolePlayed) { this.rolePlayed = rolePlayed; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getCancelReason() { return cancelReason; }
    public void setCancelReason(String cancelReason) { this.cancelReason = cancelReason; }
    public LocalDateTime getSignedUpAt() { return signedUpAt; }
    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }
}