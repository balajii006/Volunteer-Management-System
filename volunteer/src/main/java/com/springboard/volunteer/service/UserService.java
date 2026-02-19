package com.springboard.volunteer.service;

import java.util.List;

import com.springboard.volunteer.entity.User;

public interface UserService {
    User saveUser(User user);
    List<User> getAllUsers();
}
