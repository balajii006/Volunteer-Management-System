package com.vms.usermanagement.controller;

import com.vms.usermanagement.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<?> getProfile(Principal principal) {
        try {
            Map<String, Object> profile = profileService.getProfile(principal.getName());
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", Map.of("code", "ERROR", "message", e.getMessage())
            ));
        }
    }

    @PatchMapping("/me")
    public ResponseEntity<?> updateProfile(Principal principal,
                                           @RequestBody Map<String, Object> request) {
        try {
            Map<String, Object> profile = profileService
                    .updateProfile(principal.getName(), request);
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", Map.of("code", "ERROR", "message", e.getMessage())
            ));
        }
    }
}