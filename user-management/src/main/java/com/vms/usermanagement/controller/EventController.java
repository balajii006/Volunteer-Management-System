package com.vms.usermanagement.controller;

import com.vms.usermanagement.model.Event;
import com.vms.usermanagement.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/events")
public class EventController {

    @Autowired
    private EventService eventService;

    @PostMapping
    public ResponseEntity<?> createEvent(Principal principal,
                                         @RequestBody Map<String, Object> request) {
        try {
            Event event = eventService.createEvent(principal.getName(), request);
            return ResponseEntity.status(HttpStatus.CREATED).body(event);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", Map.of("code", "ERROR", "message", e.getMessage())
            ));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllEvents() {
        try {
            List<Event> events = eventService.getAllEvents();
            return ResponseEntity.ok(Map.of(
                    "total", events.size(),
                    "items", events
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", Map.of("code", "ERROR", "message", e.getMessage())
            ));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEvent(@PathVariable Long id) {
        try {
            Event event = eventService.getEventById(id);
            return ResponseEntity.ok(event);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "error", Map.of("code", "NOT_FOUND", "message", e.getMessage())
            ));
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable Long id,
                                         Principal principal,
                                         @RequestBody Map<String, Object> request) {
        try {
            Event event = eventService.updateEvent(id, principal.getName(), request);
            return ResponseEntity.ok(event);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", Map.of("code", "ERROR", "message", e.getMessage())
            ));
        }
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelEvent(@PathVariable Long id,
                                         Principal principal,
                                         @RequestBody Map<String, Object> request) {
        try {
            Event event = eventService.cancelEvent(id, principal.getName(), request);
            return ResponseEntity.ok(event);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", Map.of("code", "ERROR", "message", e.getMessage())
            ));
        }
    }
}