package com.vms.usermanagement.service;

import com.vms.usermanagement.model.*;
import com.vms.usermanagement.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    public Event createEvent(String email, Map<String, Object> request) {
        User organizer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (organizer.getRole() != User.Role.ORGANIZER) {
            throw new RuntimeException("Only organizers can create events");
        }

        Event event = new Event();
        event.setOrganizer(organizer);
        event.setTitle((String) request.get("title"));
        event.setDescription((String) request.get("description"));
        event.setLocationName((String) request.get("locationName"));
        event.setLocationAddress((String) request.get("locationAddress"));
        if (request.get("lat") != null)
            event.setLat(Double.parseDouble(request.get("lat").toString()));
        if (request.get("lng") != null)
            event.setLng(Double.parseDouble(request.get("lng").toString()));
        event.setStartTime(LocalDateTime.parse((String) request.get("startTime")));
        event.setEndTime(LocalDateTime.parse((String) request.get("endTime")));
        event.setRequiredVolunteers((Integer) request.get("requiredVolunteers"));
        if (request.get("tags") != null)
            event.setTags((String) request.get("tags"));

        return eventRepository.save(event);
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
    }

    public Event updateEvent(Long id, String email, Map<String, Object> request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getOrganizer().getEmail().equals(email)) {
            throw new RuntimeException("Only the organizer can update this event");
        }

        if (request.get("title") != null)
            event.setTitle((String) request.get("title"));
        if (request.get("description") != null)
            event.setDescription((String) request.get("description"));
        if (request.get("locationName") != null)
            event.setLocationName((String) request.get("locationName"));
        if (request.get("locationAddress") != null)
            event.setLocationAddress((String) request.get("locationAddress"));
        if (request.get("startTime") != null)
            event.setStartTime(LocalDateTime.parse((String) request.get("startTime")));
        if (request.get("endTime") != null)
            event.setEndTime(LocalDateTime.parse((String) request.get("endTime")));
        if (request.get("requiredVolunteers") != null)
            event.setRequiredVolunteers((Integer) request.get("requiredVolunteers"));
        if (request.get("tags") != null)
            event.setTags((String) request.get("tags"));

        return eventRepository.save(event);
    }

    public Event cancelEvent(Long id, String email, Map<String, Object> request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getOrganizer().getEmail().equals(email)) {
            throw new RuntimeException("Only the organizer can cancel this event");
        }

        event.setStatus(Event.Status.CANCELLED);
        return eventRepository.save(event);
    }
}