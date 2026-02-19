package com.springboard.volunteer.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.springboard.volunteer.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
}
