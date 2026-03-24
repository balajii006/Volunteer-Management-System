package com.volunteer.userservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "security.jwt")
public class JwtProperties {
  private String issuer;
  private String secret;
  private long expiresIn;
  private long refreshExpiresIn;

  public String getIssuer() {
    return issuer;
  }

  public void setIssuer(String issuer) {
    this.issuer = issuer;
  }

  public String getSecret() {
    return secret;
  }

  public void setSecret(String secret) {
    this.secret = secret;
  }

  public long getExpiresIn() {
    return expiresIn;
  }

  public void setExpiresIn(long expiresIn) {
    this.expiresIn = expiresIn;
  }

  public long getRefreshExpiresIn() {
    return refreshExpiresIn;
  }

  public void setRefreshExpiresIn(long refreshExpiresIn) {
    this.refreshExpiresIn = refreshExpiresIn;
  }
}
