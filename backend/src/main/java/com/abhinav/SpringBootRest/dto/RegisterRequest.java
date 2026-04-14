package com.abhinav.SpringBootRest.dto;

import com.abhinav.SpringBootRest.model.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String password;
    private String email;
    private Role role;
}
