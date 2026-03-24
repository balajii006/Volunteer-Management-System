package com.volunteer.eventservice.repository;

import com.volunteer.eventservice.domain.Participation;
import com.volunteer.eventservice.domain.ParticipationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ParticipationRepository extends JpaRepository<Participation, UUID> {
  List<Participation> findByEventId(UUID eventId);
  List<Participation> findByVolunteerId(UUID volunteerId);
  Optional<Participation> findByEventIdAndVolunteerId(UUID eventId, UUID volunteerId);
  List<Participation> findByEventIdAndStatus(UUID eventId, ParticipationStatus status);
  long countByEventIdAndStatus(UUID eventId, ParticipationStatus status);
}
