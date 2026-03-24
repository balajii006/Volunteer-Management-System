package com.volunteer.userservice.service;

import com.volunteer.userservice.domain.UserAccount;
import com.volunteer.userservice.repository.UserAccountRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
  private final UserAccountRepository repository;

  public UserDetailsServiceImpl(UserAccountRepository repository) {
    this.repository = repository;
  }

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    UserAccount account = repository.findByEmailIgnoreCase(username)
        .orElseThrow(() -> new UsernameNotFoundException("User not found."));

    return new User(
        account.getEmail(),
        account.getPasswordHash(),
        java.util.Set.of(new SimpleGrantedAuthority("ROLE_" + account.getRole().name())));
  }
}
