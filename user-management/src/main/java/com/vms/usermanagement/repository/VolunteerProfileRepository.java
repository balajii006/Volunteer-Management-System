package com.vms.usermanagement.repository;

import com.vms.usermanagement.model.VolunteerProfile;
import com.vms.usermanagement.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface VolunteerProfileRepository extends JpaRepository<VolunteerProfile, Long> {
    Optional<VolunteerProfile> findByUser(User user);
}