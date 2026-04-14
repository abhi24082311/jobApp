package com.abhinav.SpringBootRest.dto;

import com.abhinav.SpringBootRest.model.JobPost;

import java.util.List;

public record JobResponse(
        int postId,
        String companyName,
        String postProfile,
        String postDesc,
        Integer reqExperience,
        List<String> postTechStack,
        UserSummary recruiter
) {
    public static JobResponse fromEntity(JobPost jobPost) {
        return new JobResponse(
                jobPost.getPostId(),
                jobPost.getCompanyName(),
                jobPost.getPostProfile(),
                jobPost.getPostDesc(),
                jobPost.getReqExperience(),
                jobPost.getPostTechStack() == null ? List.of() : List.copyOf(jobPost.getPostTechStack()),
                UserSummary.fromUser(jobPost.getRecruiter(), false)
        );
    }
}
