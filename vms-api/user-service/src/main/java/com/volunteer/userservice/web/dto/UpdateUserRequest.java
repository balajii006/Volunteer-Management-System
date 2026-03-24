package com.volunteer.userservice.web.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.volunteer.userservice.domain.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public class UpdateUserRequest {
  @Size(min = 3, max = 50)
  private String username;

  @Email
  @Size(max = 120)
  private String email;

  @Size(min = 7, max = 30)
  @JsonProperty("phone_number")
  @JsonAlias({"phoneNumber", "phone_number"})
  private String phoneNumber;

  private Role role;

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  @JsonProperty("phone_number")
  public String getPhoneNumber() {
    return phoneNumber;
  }

  @JsonProperty("phone_number")
  @JsonAlias({"phoneNumber", "phone_number"})
  public void setPhoneNumber(String phoneNumber) {
    this.phoneNumber = phoneNumber;
  }

  public Role getRole() {
    return role;
  }

  public void setRole(Role role) {
    this.role = role;
  }
}
