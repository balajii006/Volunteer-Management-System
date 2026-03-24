package com.volunteer.userservice.service;

import com.volunteer.userservice.config.JwtProperties;
import com.volunteer.userservice.domain.Role;
import com.volunteer.userservice.domain.UserAccount;
import java.time.Instant;
import java.util.UUID;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
public class JwtTokenService {
  private final JwtEncoder jwtEncoder;
  private final JwtProperties properties;

  public JwtTokenService(JwtEncoder jwtEncoder, JwtProperties properties) {
    this.jwtEncoder = jwtEncoder;
    this.properties = properties;
  }

  public String generateAccessToken(UserAccount account) {
    Instant now = Instant.now();
    Role role = account.getRole() != null ? account.getRole() : Role.VOLUNTEER;
    JwtClaimsSet claims = JwtClaimsSet.builder()
        .issuer(properties.getIssuer())
        .issuedAt(now)
        .expiresAt(now.plusSeconds(properties.getExpiresIn()))
        // Use username as subject so resource server principal name maps to username.
        .subject(account.getUsername())
        .claim("userId", account.getId().toString())
        .claim("username", account.getUsername())
        .claim("role", role.name())
        .claim("roles", java.util.List.of(role.name()))
        .build();

    JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
    return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
  }

  public String generateRefreshToken(UserAccount account) {
    Instant now = Instant.now();
    JwtClaimsSet claims = JwtClaimsSet.builder()
        .issuer(properties.getIssuer())
        .issuedAt(now)
        .expiresAt(now.plusSeconds(properties.getRefreshExpiresIn()))
        .subject(account.getUsername())
        .id(UUID.randomUUID().toString())
        .claim("userId", account.getId().toString())
        .claim("type", "refresh")
        .build();

    JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
    return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
  }

  public long getExpiresIn() {
    return properties.getExpiresIn();
  }

  public long getRefreshExpiresIn() {
    return properties.getRefreshExpiresIn();
  }
}
