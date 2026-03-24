package com.volunteer.eventservice.repository;

import com.volunteer.eventservice.domain.Event;
import com.volunteer.eventservice.domain.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {
  List<Event> findByOrganizerId(UUID organizerId);
  List<Event> findByStatus(EventStatus status);
  List<Event> findByEventDateAfter(LocalDateTime date);
  List<Event> findByStatusAndEventDateAfter(EventStatus status, LocalDateTime date);
}
