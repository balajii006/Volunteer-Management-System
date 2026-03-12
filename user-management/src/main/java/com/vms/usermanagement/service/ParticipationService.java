package com.vms.usermanagement.service;

import com.vms.usermanagement.model.*;
import com.vms.usermanagement.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class ParticipationService {

    @Autowired
    private ParticipationRepository participationRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    public Participation signup(Long eventId, String email, Map<String, Object> request) {
        User volunteer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (event.getStatus() == Event.Status.CANCELLED)
            throw new RuntimeException("Event is cancelled");

        if (event.getSpotsFilled() >= event.getRequiredVolunteers())
            throw new RuntimeException("Event is full");

        participationRepository.findByEventAndVolunteer(event, volunteer)
                .ifPresent(p -> { throw new RuntimeException("Already signed up"); });

        Participation participation = new Participation();
        participation.setEvent(event);
        participation.setVolunteer(volunteer);
        participation.setStatus(Participation.Status.CONFIRMED);
        if (request.get("notes") != null)
            participation.setNotes((String) request.get("notes"));

        event.setSpotsFilled(event.getSpotsFilled() + 1);
        eventRepository.save(event);

        return participationRepository.save(participation);
    }

    public Participation cancel(Long participationId, String email, Map<String, Object> request) {
        Participation participation = participationRepository.findById(participationId)
                .orElseThrow(() -> new RuntimeException("Participation not found"));

        if (!participation.getVolunteer().getEmail().equals(email))
            throw new RuntimeException("Not authorized");

        participation.setStatus(Participation.Status.CANCELLED);
        participation.setCancelledAt(LocalDateTime.now());
        if (request.get("reason") != null)
            participation.setCancelReason((String) request.get("reason"));

        Event event = participation.getEvent();
        event.setSpotsFilled(Math.max(0, event.getSpotsFilled() - 1));
        eventRepository.save(event);

        return participationRepository.save(participation);
    }

    public List<Map<String, Object>> getMyParticipations(String email) {
        User volunteer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Participation p : participationRepository.findByVolunteer(volunteer)) {
            Map<String, Object> item = new HashMap<>();
            item.put("participationId", p.getId());
            item.put("eventId", p.getEvent().getId());
            item.put("eventTitle", p.getEvent().getTitle());
            item.put("startTime", p.getEvent().getStartTime());
            item.put("status", p.getStatus());
            item.put("signedUpAt", p.getSignedUpAt());
            result.add(item);
        }
        return result;
    }

    public List<Map<String, Object>> getEventVolunteers(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Participation p : participationRepository.findByEvent(event)) {
            Map<String, Object> item = new HashMap<>();
            item.put("participationId", p.getId());
            item.put("volunteerId", p.getVolunteer().getId());
            item.put("fullName", p.getVolunteer().getFullName());
            item.put("email", p.getVolunteer().getEmail());
            item.put("status", p.getStatus());
            item.put("signedUpAt", p.getSignedUpAt());
            result.add(item);
        }
        return result;
    }

    public Participation markAttendance(Long participationId, String email,
                                        Map<String, Object> request) {
        Participation participation = participationRepository.findById(participationId)
                .orElseThrow(() -> new RuntimeException("Participation not found"));

        if (!participation.getEvent().getOrganizer().getEmail().equals(email))
            throw new RuntimeException("Only organizer can mark attendance");

        if (request.get("status") != null)
            participation.setStatus(
                    Participation.Status.valueOf((String) request.get("status")));
        if (request.get("rolePlayed") != null)
            participation.setRolePlayed((String) request.get("rolePlayed"));

        return participationRepository.save(participation);
    }
}