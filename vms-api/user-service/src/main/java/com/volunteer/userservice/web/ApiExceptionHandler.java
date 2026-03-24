package com.volunteer.userservice.web;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.jwt.JwtEncodingException;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice
public class ApiExceptionHandler {
  @ExceptionHandler(MethodArgumentNotValidException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public Map<String, Object> handleValidation(MethodArgumentNotValidException ex) {
    Map<String, String> fields = ex.getBindingResult().getFieldErrors().stream()
        .collect(Collectors.toMap(FieldError::getField, FieldError::getDefaultMessage,
            (a, b) -> a));
    Map<String, Object> payload = new HashMap<>();
    payload.put("error", "Validation failed.");
    payload.put("fields", fields);
    return payload;
  }

  @ExceptionHandler(ConstraintViolationException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public Map<String, Object> handleConstraintViolation(ConstraintViolationException ex) {
    Map<String, String> fields = ex.getConstraintViolations().stream()
        .collect(Collectors.toMap(v -> v.getPropertyPath().toString(), v -> v.getMessage(),
            (a, b) -> a));
    Map<String, Object> payload = new HashMap<>();
    payload.put("error", "Validation failed.");
    payload.put("fields", fields);
    return payload;
  }

  @ExceptionHandler(HttpMessageNotReadableException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public Map<String, String> handleUnreadable(HttpMessageNotReadableException ex) {
    return Map.of("error", "Malformed JSON request.");
  }

  @ExceptionHandler(IllegalArgumentException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public Map<String, String> handleIllegalArgument(IllegalArgumentException ex) {
    return Map.of("error", ex.getMessage());
  }

  @ExceptionHandler(AuthenticationException.class)
  @ResponseStatus(HttpStatus.UNAUTHORIZED)
  public Map<String, String> handleAuth(AuthenticationException ex) {
    return Map.of("error", "Invalid username/email or password.");
  }

  @ExceptionHandler(AccessDeniedException.class)
  @ResponseStatus(HttpStatus.FORBIDDEN)
  public Map<String, String> handleAccessDenied(AccessDeniedException ex) {
    return Map.of("error", "Access denied.");
  }

  @ExceptionHandler(JwtEncodingException.class)
  @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
  public Map<String, String> handleJwt(JwtEncodingException ex) {
    return Map.of("error", "Failed to generate access token.");
  }

  @ExceptionHandler(JwtException.class)
  @ResponseStatus(HttpStatus.UNAUTHORIZED)
  public Map<String, String> handleJwtException(JwtException ex) {
    return Map.of("error", "Invalid or expired token.");
  }

  @ExceptionHandler(Exception.class)
  @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
  public Map<String, String> handleGeneric(Exception ex) {
    return Map.of("error", "Unexpected server error.");
  }
}
