package com.abhinav.SpringBootRest.dto;

import java.util.List;

public record JobRequest(
        String companyName,
        String postProfile,
        String postDesc,
        Integer reqExperience,
        List<String> postTechStack
) {
}
