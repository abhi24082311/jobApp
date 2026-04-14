package com.abhinav.SpringBootRest.repo;

import com.abhinav.SpringBootRest.model.Role;
import com.abhinav.SpringBootRest.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findFirstByRole(Role role);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
}
