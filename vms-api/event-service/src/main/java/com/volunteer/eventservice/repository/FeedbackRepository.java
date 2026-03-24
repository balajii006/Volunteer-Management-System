package com.volunteer.eventservice.repository;

import com.volunteer.eventservice.domain.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, UUID> {
  List<Feedback> findByEventId(UUID eventId);
  Optional<Feedback> findByEventIdAndVolunteerId(UUID eventId, UUID volunteerId);
  
  @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.eventId = :eventId")
  Double getAverageRatingForEvent(@Param("eventId") UUID eventId);
}
