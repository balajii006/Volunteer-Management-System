package com.volunteer.userservice.service;

import com.volunteer.userservice.domain.Role;
import com.volunteer.userservice.domain.UserAccount;
import com.volunteer.userservice.repository.UserAccountRepository;
import com.volunteer.userservice.web.dto.RegisterRequest;
import com.volunteer.userservice.web.dto.UpdateUserRequest;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserAccountService {
  private final UserAccountRepository repository;
  private final PasswordEncoder passwordEncoder;

  public UserAccountService(UserAccountRepository repository, PasswordEncoder passwordEncoder) {
    this.repository = repository;
    this.passwordEncoder = passwordEncoder;
  }

  @Transactional
  public UserAccount register(RegisterRequest request) {
    if (repository.existsByUsernameIgnoreCase(request.getUsername())) {
      throw new IllegalArgumentException("Username already in use.");
    }
    if (repository.existsByEmailIgnoreCase(request.getEmail())) {
      throw new IllegalArgumentException("Email already in use.");
    }

    UserAccount account = new UserAccount();
    account.setUsername(request.getUsername().trim());
    account.setEmail(request.getEmail().trim().toLowerCase());
    account.setPasswordHash(passwordEncoder.encode(request.getPassword()));
    account.setRole(Role.VOLUNTEER);
    account.setPhoneNumber(request.getPhoneNumber().trim());

    return repository.save(account);
  }

  public Optional<UserAccount> findByUsernameOrEmail(String value) {
    return repository.findByUsernameIgnoreCase(value)
        .or(() -> repository.findByEmailIgnoreCase(value));
  }

  public Optional<UserAccount> findByEmail(String email) {
    return repository.findByEmailIgnoreCase(email);
  }

  public Optional<UserAccount> findById(UUID id) {
    return repository.findById(id);
  }

  public List<UserAccount> findAll() {
    return repository.findAll();
  }

  public List<UserAccount> findAllByRole(Role role) {
    return repository.findByRole(role);
  }

  @Transactional
  public UserAccount updateUser(UUID id, UpdateUserRequest request) {
    UserAccount account = repository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("User not found."));

    if (request.getUsername() != null) {
      String username = request.getUsername().trim();
      if (!username.equalsIgnoreCase(account.getUsername())
          && repository.existsByUsernameIgnoreCase(username)) {
        throw new IllegalArgumentException("Username already in use.");
      }
      account.setUsername(username);
    }

    if (request.getEmail() != null) {
      String email = request.getEmail().trim().toLowerCase();
      if (!email.equalsIgnoreCase(account.getEmail())
          && repository.existsByEmailIgnoreCase(email)) {
        throw new IllegalArgumentException("Email already in use.");
      }
      account.setEmail(email);
    }

    if (request.getPhoneNumber() != null) {
      account.setPhoneNumber(request.getPhoneNumber().trim());
    }

    if (request.getRole() != null) {
      account.setRole(request.getRole());
    } else if (account.getRole() == null) {
      account.setRole(Role.VOLUNTEER);
    }

    return repository.save(account);
  }

  @Transactional
  public void deleteUser(UUID id) {
    if (!repository.existsById(id)) {
      throw new IllegalArgumentException("User not found.");
    }
    repository.deleteById(id);
  }

  @Transactional
  public void changePassword(String principal, String currentPassword, String newPassword) {
    UserAccount account = findByUsernameOrEmail(principal)
        .orElseThrow(() -> new IllegalArgumentException("User not found."));
    if (!passwordEncoder.matches(currentPassword, account.getPasswordHash())) {
      throw new IllegalArgumentException("Current password is incorrect.");
    }
    account.setPasswordHash(passwordEncoder.encode(newPassword));
    repository.save(account);
  }

  @Transactional
  public void setPassword(UUID userId, String newPassword) {
    UserAccount account = repository.findById(userId)
        .orElseThrow(() -> new IllegalArgumentException("User not found."));
    account.setPasswordHash(passwordEncoder.encode(newPassword));
    repository.save(account);
  }
}
