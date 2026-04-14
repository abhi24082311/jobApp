package com.abhinav.SpringBootRest.dto;

import com.abhinav.SpringBootRest.model.Role;
import com.abhinav.SpringBootRest.model.User;

public record UserSummary(
        Long id,
        String username,
        String email,
        Role role
) {
    public static UserSummary fromUser(User user, boolean includeEmail) {
        if (user == null) {
            return null;
        }

        return new UserSummary(
                user.getId(),
                user.getUsername(),
                includeEmail ? user.getEmail() : null,
                user.getRole()
        );
    }
}
