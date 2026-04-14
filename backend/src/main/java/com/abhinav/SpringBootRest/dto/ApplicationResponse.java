package com.abhinav.SpringBootRest.dto;

import com.abhinav.SpringBootRest.model.AppStatus;
import com.abhinav.SpringBootRest.model.Application;

public record ApplicationResponse(
        Long id,
        AppStatus status,
        String resumeFileName,
        JobResponse jobPost,
        UserSummary candidate
) {
    public static ApplicationResponse fromEntity(Application application, boolean includeCandidateEmail) {
        return new ApplicationResponse(
                application.getId(),
                application.getStatus(),
                application.getResumeFileName(),
                JobResponse.fromEntity(application.getJobPost()),
                UserSummary.fromUser(application.getCandidate(), includeCandidateEmail)
        );
    }
}
