package com.volunteer.notificationservice.config;

import java.util.Base64;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
  @Value("${security.jwt.secret}")
  private String jwtSecret;

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers(
                "/swagger-ui/**",
                "/swagger-ui.html",
                "/v3/api-docs/**",
                "/actuator/health")
            .permitAll()
            .anyRequest()
            .authenticated())
        .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));
    return http.build();
  }

  @Bean
  public JwtDecoder jwtDecoder() {
    if (jwtSecret == null || jwtSecret.isBlank()) {
      throw new IllegalStateException("JWT_SECRET is required.");
    }
    byte[] keyBytes = Base64.getDecoder().decode(jwtSecret);
    if (keyBytes.length < 32) {
      throw new IllegalStateException("JWT_SECRET too short. Must decode to at least 32 bytes.");
    }
    SecretKey key = new SecretKeySpec(keyBytes, "HmacSHA256");
    return NimbusJwtDecoder.withSecretKey(key).build();
  }
}
