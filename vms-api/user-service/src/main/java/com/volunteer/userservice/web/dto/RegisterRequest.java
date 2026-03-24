package com.volunteer.userservice.web.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {
  @NotBlank
  @Size(min = 3, max = 50)
  private String username;

  @NotBlank
  @Email
  @Size(max = 120)
  private String email;

  @NotBlank
  @Size(min = 8, max = 120)
  private String password;

  @NotBlank
  @Size(min = 7, max = 30)
  @JsonProperty("phone_number")
  @JsonAlias({"phoneNumber", "phone_number"})
  private String phoneNumber;

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

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
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
}
