package com.vms.usermanagement.controller;

import com.vms.usermanagement.model.Participation;
import com.vms.usermanagement.service.ParticipationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class ParticipationController {

    @Autowired
    private ParticipationService participationService;

    @PostMapping("/events/{eventId}/signup")
    public ResponseEntity<?> signup(@PathVariable Long eventId,
                                    Principal principal,
                                    @RequestBody Map<String, Object> request) {
        try {
            Participation p = participationService
                    .signup(eventId, principal.getName(), request);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "participationId", p.getId(),
                    "eventId", p.getEvent().getId(),
                    "status", p.getStatus(),
                    "signedUpAt", p.getSignedUpAt().toString()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "error", Map.of("code", "CONFLICT", "message", e.getMessage())
            ));
        }
    }

    @PostMapping("/participations/{participationId}/cancel")
    public ResponseEntity<?> cancel(@PathVariable Long participationId,
                                    Principal principal,
                                    @RequestBody Map<String, Object> request) {
        try {
            Participation p = participationService
                    .cancel(participationId, principal.getName(), request);
            return ResponseEntity.ok(Map.of(
                    "participationId", p.getId(),
                    "status", p.getStatus(),
                    "cancelledAt", p.getCancelledAt().toString()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", Map.of("code", "ERROR", "message", e.getMessage())
            ));
        }
    }

    @GetMapping("/volunteers/me/participations")
    public ResponseEntity<?> getMyParticipations(Principal principal) {
        try {
            List<Map<String, Object>> result = participationService
                    .getMyParticipations(principal.getName());
            return ResponseEntity.ok(Map.of(
                    "total", result.size(),
                    "items", result
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", Map.of("code", "ERROR", "message", e.getMessage())
            ));
        }
    }

    @GetMapping("/events/{eventId}/volunteers")
    public ResponseEntity<?> getEventVolunteers(@PathVariable Long eventId,
                                                Principal principal) {
        try {
            List<Map<String, Object>> volunteers = participationService
                    .getEventVolunteers(eventId);
            return ResponseEntity.ok(Map.of(
                    "eventId", eventId,
                    "total", volunteers.size(),
                    "volunteers", volunteers
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", Map.of("code", "ERROR", "message", e.getMessage())
            ));
        }
    }

    @PatchMapping("/participations/{participationId}")
    public ResponseEntity<?> markAttendance(@PathVariable Long participationId,
                                            Principal principal,
                                            @RequestBody Map<String, Object> request) {
        try {
            Participation p = participationService
                    .markAttendance(participationId, principal.getName(), request);
            return ResponseEntity.ok(Map.of(
                    "participationId", p.getId(),
                    "status", p.getStatus(),
                    "rolePlayed", p.getRolePlayed() != null ? p.getRolePlayed() : ""
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", Map.of("code", "ERROR", "message", e.getMessage())
            ));
        }
    }
}