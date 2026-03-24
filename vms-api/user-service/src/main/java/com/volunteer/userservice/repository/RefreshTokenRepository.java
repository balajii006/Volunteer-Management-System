package com.volunteer.userservice.repository;

import com.volunteer.userservice.domain.RefreshToken;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
  Optional<RefreshToken> findByTokenHash(String tokenHash);
}
