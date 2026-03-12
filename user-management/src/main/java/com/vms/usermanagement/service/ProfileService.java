package com.vms.usermanagement.service;

import com.vms.usermanagement.model.*;
import com.vms.usermanagement.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class ProfileService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizerProfileRepository organizerProfileRepository;

    @Autowired
    private VolunteerProfileRepository volunteerProfileRepository;

    public Map<String, Object> getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("fullName", user.getFullName());
        response.put("phone", user.getPhone());
        response.put("role", user.getRole());
        response.put("status", user.getStatus());

        if (user.getRole() == User.Role.ORGANIZER) {
            OrganizerProfile profile = organizerProfileRepository
                    .findByUser(user).orElse(new OrganizerProfile());
            response.put("organizationName", profile.getOrganizationName());
            response.put("bio", profile.getBio());
            response.put("website", profile.getWebsite());
            response.put("address", profile.getAddress());
        } else {
            VolunteerProfile profile = volunteerProfileRepository
                    .findByUser(user).orElse(new VolunteerProfile());
            response.put("bio", profile.getBio());
            response.put("skills", profile.getSkills());
            response.put("interests", profile.getInterests());
            response.put("availability", profile.getAvailability());
        }
        return response;
    }

    public Map<String, Object> updateProfile(String email, Map<String, Object> request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.get("fullName") != null)
            user.setFullName((String) request.get("fullName"));
        if (request.get("phone") != null)
            user.setPhone((String) request.get("phone"));
        userRepository.save(user);

        if (user.getRole() == User.Role.ORGANIZER) {
            OrganizerProfile profile = organizerProfileRepository
                    .findByUser(user).orElse(new OrganizerProfile());
            profile.setUser(user);
            if (request.get("organizationName") != null)
                profile.setOrganizationName((String) request.get("organizationName"));
            if (request.get("bio") != null)
                profile.setBio((String) request.get("bio"));
            if (request.get("website") != null)
                profile.setWebsite((String) request.get("website"));
            if (request.get("address") != null)
                profile.setAddress((String) request.get("address"));
            organizerProfileRepository.save(profile);
        } else {
            VolunteerProfile profile = volunteerProfileRepository
                    .findByUser(user).orElse(new VolunteerProfile());
            profile.setUser(user);
            if (request.get("bio") != null)
                profile.setBio((String) request.get("bio"));
            if (request.get("skills") != null)
                profile.setSkills((String) request.get("skills"));
            if (request.get("interests") != null)
                profile.setInterests((String) request.get("interests"));
            if (request.get("availability") != null)
                profile.setAvailability((String) request.get("availability"));
            volunteerProfileRepository.save(profile);
        }
        return getProfile(email);
    }
}