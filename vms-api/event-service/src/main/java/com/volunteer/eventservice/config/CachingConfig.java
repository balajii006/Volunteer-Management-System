package com.volunteer.eventservice.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for event service caching.
 * Caches frequently accessed event data to reduce database queries.
 */
@Configuration
@EnableCaching
public class CachingConfig {

  @Bean
  public CacheManager cacheManager() {
    return new ConcurrentMapCacheManager("events");
  }
}
