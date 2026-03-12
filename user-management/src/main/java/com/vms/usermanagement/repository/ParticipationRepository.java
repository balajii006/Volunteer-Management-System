package com.vms.usermanagement.repository;

import com.vms.usermanagement.model.Participation;
import com.vms.usermanagement.model.Event;
import com.vms.usermanagement.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ParticipationRepository extends JpaRepository<Participation, Long> {
    List<Participation> findByVolunteer(User volunteer);
    List<Participation> findByEvent(Event event);
    Optional<Participation> findByEventAndVolunteer(Event event, User volunteer);
}