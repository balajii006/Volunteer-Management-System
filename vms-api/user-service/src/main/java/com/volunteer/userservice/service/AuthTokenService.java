package com.volunteer.userservice.service;

import com.volunteer.userservice.domain.PasswordResetToken;
import com.volunteer.userservice.domain.RefreshToken;
import com.volunteer.userservice.domain.UserAccount;
import com.volunteer.userservice.repository.PasswordResetTokenRepository;
import com.volunteer.userservice.repository.RefreshTokenRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthTokenService {
  private static final int RESET_TOKEN_BYTES = 48;
  private static final long RESET_TOKEN_MINUTES = 30;
  private final RefreshTokenRepository refreshTokenRepository;
  private final PasswordResetTokenRepository passwordResetTokenRepository;

  public AuthTokenService(
      RefreshTokenRepository refreshTokenRepository,
      PasswordResetTokenRepository passwordResetTokenRepository) {
    this.refreshTokenRepository = refreshTokenRepository;
    this.passwordResetTokenRepository = passwordResetTokenRepository;
  }

  @Transactional
  public void storeRefreshToken(UserAccount account, String refreshToken, Instant expiresAt) {
    RefreshToken entity = new RefreshToken();
    entity.setUserId(account.getId());
    entity.setTokenHash(hash(refreshToken));
    entity.setExpiresAt(expiresAt);
    entity.setCreatedAt(Instant.now());
    refreshTokenRepository.save(entity);
  }

  @Transactional
  public void revokeRefreshToken(String refreshToken) {
    refreshTokenRepository.findByTokenHash(hash(refreshToken))
        .ifPresent(token -> {
          if (token.getRevokedAt() == null) {
            token.setRevokedAt(Instant.now());
            refreshTokenRepository.save(token);
          }
        });
  }

  public RefreshToken getValidRefreshToken(String refreshToken) {
    RefreshToken token = refreshTokenRepository.findByTokenHash(hash(refreshToken))
        .orElseThrow(() -> new IllegalArgumentException("Refresh token not found."));
    if (token.getRevokedAt() != null) {
      throw new IllegalArgumentException("Refresh token revoked.");
    }
    if (token.getExpiresAt().isBefore(Instant.now())) {
      throw new IllegalArgumentException("Refresh token expired.");
    }
    return token;
  }

  @Transactional
  public String createPasswordResetToken(UserAccount account) {
    String raw = randomToken();
    PasswordResetToken entity = new PasswordResetToken();
    entity.setUserId(account.getId());
    entity.setTokenHash(hash(raw));
    entity.setCreatedAt(Instant.now());
    entity.setExpiresAt(Instant.now().plus(RESET_TOKEN_MINUTES, ChronoUnit.MINUTES));
    passwordResetTokenRepository.save(entity);
    return raw;
  }

  @Transactional
  public void usePasswordResetToken(String rawToken) {
    PasswordResetToken token = passwordResetTokenRepository.findByTokenHash(hash(rawToken))
        .orElseThrow(() -> new IllegalArgumentException("Reset token not found."));
    if (token.getUsedAt() != null) {
      throw new IllegalArgumentException("Reset token already used.");
    }
    if (token.getExpiresAt().isBefore(Instant.now())) {
      throw new IllegalArgumentException("Reset token expired.");
    }
    token.setUsedAt(Instant.now());
    passwordResetTokenRepository.save(token);
  }

  public UserAccount getAccountForResetToken(UserAccountService userAccountService, String rawToken) {
    PasswordResetToken token = passwordResetTokenRepository.findByTokenHash(hash(rawToken))
        .orElseThrow(() -> new IllegalArgumentException("Reset token not found."));
    if (token.getUsedAt() != null) {
      throw new IllegalArgumentException("Reset token already used.");
    }
    if (token.getExpiresAt().isBefore(Instant.now())) {
      throw new IllegalArgumentException("Reset token expired.");
    }
    return userAccountService.findById(token.getUserId())
        .orElseThrow(() -> new IllegalArgumentException("User not found."));
  }

  private String randomToken() {
    byte[] bytes = new byte[RESET_TOKEN_BYTES];
    new SecureRandom().nextBytes(bytes);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
  }

  private String hash(String value) {
    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
      return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
    } catch (NoSuchAlgorithmException ex) {
      throw new IllegalStateException("SHA-256 not available.", ex);
    }
  }
}
