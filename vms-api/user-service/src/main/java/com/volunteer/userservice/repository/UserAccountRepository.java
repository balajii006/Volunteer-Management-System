package com.volunteer.userservice.repository;

import com.volunteer.userservice.domain.UserAccount;
import com.volunteer.userservice.domain.Role;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAccountRepository extends JpaRepository<UserAccount, UUID> {
  Optional<UserAccount> findByUsernameIgnoreCase(String username);

  Optional<UserAccount> findByEmailIgnoreCase(String email);

  boolean existsByUsernameIgnoreCase(String username);

  boolean existsByEmailIgnoreCase(String email);

  List<UserAccount> findByRole(Role role);
}
