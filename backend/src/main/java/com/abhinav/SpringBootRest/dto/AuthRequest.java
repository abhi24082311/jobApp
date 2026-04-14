package com.abhinav.SpringBootRest.dto;

import com.abhinav.SpringBootRest.model.Role;
import lombok.Data;

@Data
public class AuthRequest {
    private String username;
    private String password;
}
