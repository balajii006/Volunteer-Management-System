package com.vms.usermanagement.repository;

import com.vms.usermanagement.model.OrganizerProfile;
import com.vms.usermanagement.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OrganizerProfileRepository extends JpaRepository<OrganizerProfile, Long> {
    Optional<OrganizerProfile> findByUser(User user);
}