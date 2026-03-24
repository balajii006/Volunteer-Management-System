package com.volunteer.notificationservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import java.util.concurrent.Executor;

/**
 * Configuration for asynchronous processing of notifications.
 * Enables non-blocking notification sending to improve response times.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

  /**
   * Task executor for email notification sending.
   * Configures a thread pool for async operations.
   */
  @Bean(name = "notificationExecutor")
  public Executor notificationExecutor() {
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(5);
    executor.setMaxPoolSize(10);
    executor.setQueueCapacity(100);
    executor.setThreadNamePrefix("notification-");
    executor.initialize();
    return executor;
  }

  /**
   * Task executor for general async operations.
   */
  @Bean(name = "asyncExecutor")
  public Executor asyncExecutor() {
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(3);
    executor.setMaxPoolSize(8);
    executor.setQueueCapacity(50);
    executor.setThreadNamePrefix("async-");
    executor.initialize();
    return executor;
  }
}
