package com.volunteer.userservice.config;

import java.util.Base64;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Component;

@Component
public class JwtKeyProvider {
  private final JwtProperties properties;
  private SecretKey cachedKey;

  public JwtKeyProvider(JwtProperties properties) {
    this.properties = properties;
  }

  public synchronized SecretKey getSigningKey() {
    if (cachedKey != null) {
      return cachedKey;
    }

    String secret = properties.getSecret();
    if (secret == null || secret.isBlank()) {
      throw new IllegalStateException(
          "JWT_SECRET is required. Configure a Base64-encoded secret with at least 32 bytes.");
    }

    byte[] keyBytes;
    try {
      keyBytes = Base64.getDecoder().decode(secret);
    } catch (IllegalArgumentException ex) {
      throw new IllegalStateException(
          "JWT_SECRET must be Base64-encoded (same format used by other services).", ex);
    }
    if (keyBytes.length < 32) {
      throw new IllegalStateException(
          "JWT_SECRET too short. Use a Base64 value that decodes to at least 32 bytes for HS256.");
    }

    cachedKey = new SecretKeySpec(keyBytes, "HmacSHA256");
    return cachedKey;
  }
}
