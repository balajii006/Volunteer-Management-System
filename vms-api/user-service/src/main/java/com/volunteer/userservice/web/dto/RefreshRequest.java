package com.volunteer.userservice.web.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public class RefreshRequest {
  @NotBlank
  @JsonProperty("refresh_token")
  @JsonAlias({"refreshToken"})
  private String refreshToken;

  @JsonProperty("refresh_token")
  public String getRefreshToken() {
    return refreshToken;
  }

  @JsonProperty("refresh_token")
  public void setRefreshToken(String refreshToken) {
    this.refreshToken = refreshToken;
  }
}
