package com.volunteer.eventservice.config;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import java.time.Duration;

/**
 * Configuration for Resilience4j Circuit Breaker pattern.
 * Provides fault tolerance for inter-service communication.
 */
@Configuration
public class CircuitBreakerConfiguration {
  private static final Logger logger = LoggerFactory.getLogger(CircuitBreakerConfiguration.class);

  @Bean
  public CircuitBreakerRegistry circuitBreakerRegistry() {
    CircuitBreakerRegistry registry = CircuitBreakerRegistry.of(
        CircuitBreakerConfig.custom()
            .failureRateThreshold(50.0f)
            .slowCallRateThreshold(50.0f)
            .slowCallDurationThreshold(Duration.ofSeconds(2))
            .permittedNumberOfCallsInHalfOpenState(3)
            .automaticTransitionFromOpenToHalfOpenEnabled(true)
            .waitDurationInOpenState(Duration.ofSeconds(10))
            .recordExceptions(Exception.class)
            .ignoreExceptions()
            .build()
    );

    logger.info("CircuitBreaker registry initialized");
    return registry;
  }

  @Bean
  public CircuitBreaker userServiceCircuitBreaker(CircuitBreakerRegistry registry) {
    return registry.circuitBreaker("user-service", CircuitBreakerConfig.custom()
        .failureRateThreshold(50.0f)
        .waitDurationInOpenState(Duration.ofSeconds(10))
        .build());
  }

  @Bean
  public CircuitBreaker notificationServiceCircuitBreaker(CircuitBreakerRegistry registry) {
    return registry.circuitBreaker("notification-service", CircuitBreakerConfig.custom()
        .failureRateThreshold(60.0f)
        .waitDurationInOpenState(Duration.ofSeconds(15))
        .build());
  }

  @Bean
  public RestTemplate restTemplate() {
    return new RestTemplate();
  }
}
