package com.volunteer.userservice.web.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ChangePasswordRequest {
  @NotBlank
  @JsonProperty("current_password")
  @JsonAlias({"currentPassword", "oldPassword"})
  private String currentPassword;

  @NotBlank
  @Size(min = 8, max = 120)
  @JsonProperty("new_password")
  @JsonAlias({"newPassword"})
  private String newPassword;

  @JsonProperty("current_password")
  public String getCurrentPassword() {
    return currentPassword;
  }

  @JsonProperty("current_password")
  public void setCurrentPassword(String currentPassword) {
    this.currentPassword = currentPassword;
  }

  @JsonProperty("new_password")
  public String getNewPassword() {
    return newPassword;
  }

  @JsonProperty("new_password")
  public void setNewPassword(String newPassword) {
    this.newPassword = newPassword;
  }
}
