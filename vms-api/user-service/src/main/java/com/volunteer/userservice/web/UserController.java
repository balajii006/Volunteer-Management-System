package com.volunteer.userservice.web;

import com.volunteer.userservice.domain.Role;
import com.volunteer.userservice.domain.UserAccount;
import com.volunteer.userservice.service.UserAccountService;
import com.volunteer.userservice.web.dto.UpdateUserRequest;
import com.volunteer.userservice.web.dto.UserResponse;
import java.security.Principal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {
  private final UserAccountService userAccountService;

  public UserController(UserAccountService userAccountService) {
    this.userAccountService = userAccountService;
  }

  @GetMapping("/profile")
  public UserResponse profile(Principal principal) {
    UserAccount account = userAccountService.findByUsernameOrEmail(principal.getName())
        .orElseThrow(() -> new IllegalArgumentException("User not found."));
    return new UserResponse(
        account.getId(),
        account.getUsername(),
        account.getEmail(),
        account.getRole(),
        account.getPhoneNumber(),
        account.getCreatedAt(),
        account.getUpdatedAt());
  }

  @GetMapping("/me")
  public UserResponse me(Principal principal) {
    return profile(principal);
  }

  @PutMapping("/me")
  public UserResponse updateMe(Principal principal, @Valid @RequestBody UpdateUserRequest request) {
    UserAccount current = userAccountService.findByUsernameOrEmail(principal.getName())
        .orElseThrow(() -> new IllegalArgumentException("User not found."));
    // Prevent self-service privilege escalation.
    request.setRole(null);
    UserAccount account = userAccountService.updateUser(current.getId(), request);
    return new UserResponse(
        account.getId(),
        account.getUsername(),
        account.getEmail(),
        account.getRole(),
        account.getPhoneNumber(),
        account.getCreatedAt(),
        account.getUpdatedAt());
  }

  @GetMapping
  public List<UserResponse> getAll(@RequestParam(name = "role", required = false) Role role) {
    List<UserAccount> accounts = role == null
        ? userAccountService.findAll()
        : userAccountService.findAllByRole(role);
    return accounts.stream()
        .map(account -> new UserResponse(
            account.getId(),
            account.getUsername(),
            account.getEmail(),
            account.getRole(),
            account.getPhoneNumber(),
            account.getCreatedAt(),
            account.getUpdatedAt()))
        .collect(Collectors.toList());
  }

  @GetMapping("/{id}")
  public UserResponse getById(@PathVariable("id") UUID id) {
    UserAccount account = userAccountService.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("User not found."));
    return new UserResponse(
        account.getId(),
        account.getUsername(),
        account.getEmail(),
        account.getRole(),
        account.getPhoneNumber(),
        account.getCreatedAt(),
        account.getUpdatedAt());
  }

  @PutMapping("/{id}")
  public UserResponse update(@PathVariable("id") UUID id,
      @Valid @RequestBody UpdateUserRequest request) {
    UserAccount account = userAccountService.updateUser(id, request);
    return new UserResponse(
        account.getId(),
        account.getUsername(),
        account.getEmail(),
        account.getRole(),
        account.getPhoneNumber(),
        account.getCreatedAt(),
        account.getUpdatedAt());
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable("id") UUID id) {
    userAccountService.deleteUser(id);
  }
}
