package com.volunteer.userservice.web.dto;

import com.volunteer.userservice.domain.Role;
import java.time.Instant;

public class AuthResponse {
  private Tokens tokens;
  private User user;

  public AuthResponse(Tokens tokens, User user) {
    this.tokens = tokens;
    this.user = user;
  }

  public Tokens getTokens() {
    return tokens;
  }

  public User getUser() {
    return user;
  }

  public static class Tokens {
    private String accessToken;
    private String refreshToken;

    public Tokens(String accessToken, String refreshToken) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
    }

    public String getAccessToken() {
      return accessToken;
    }

    public String getRefreshToken() {
      return refreshToken;
    }
  }

  public static class User {
    private String username;
    private String email;
    private Role role;
    private String id;
    private String phoneNumber;
    private Instant createdAt;
    private Instant updatedAt;

    public User(String username, String email, Role role, String id, String phoneNumber, Instant createdAt,
        Instant updatedAt) {
      this.username = username;
      this.email = email;
      this.role = role;
      this.id = id;
      this.phoneNumber = phoneNumber;
      this.createdAt = createdAt;
      this.updatedAt = updatedAt;
    }

    public String getUsername() {
      return username;
    }

    public String getEmail() {
      return email;
    }

    public Role getRole() {
      return role;
    }

    public String getId() {
      return id;
    }

    public String getPhoneNumber() {
      return phoneNumber;
    }

    public Instant getCreatedAt() {
      return createdAt;
    }

    public Instant getUpdatedAt() {
      return updatedAt;
    }
  }
}
