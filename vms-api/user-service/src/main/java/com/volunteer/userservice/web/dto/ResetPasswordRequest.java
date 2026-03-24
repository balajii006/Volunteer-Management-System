package com.volunteer.userservice.web.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ResetPasswordRequest {
  @NotBlank
  @JsonProperty("reset_token")
  @JsonAlias({"resetToken", "token"})
  private String resetToken;

  @NotBlank
  @Size(min = 8, max = 120)
  @JsonProperty("new_password")
  @JsonAlias({"newPassword"})
  private String newPassword;

  @JsonProperty("reset_token")
  public String getResetToken() {
    return resetToken;
  }

  @JsonProperty("reset_token")
  public void setResetToken(String resetToken) {
    this.resetToken = resetToken;
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
