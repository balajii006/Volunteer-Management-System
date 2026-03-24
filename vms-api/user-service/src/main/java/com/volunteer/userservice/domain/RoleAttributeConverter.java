package com.volunteer.userservice.domain;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class RoleAttributeConverter implements AttributeConverter<Role, String> {
  @Override
  public String convertToDatabaseColumn(Role role) {
    if (role == null) {
      return null;
    }
    return role.name().toLowerCase();
  }

  @Override
  public Role convertToEntityAttribute(String value) {
    if (value == null || value.isBlank()) {
      return null;
    }
    return Role.valueOf(value.trim().toUpperCase());
  }
}
