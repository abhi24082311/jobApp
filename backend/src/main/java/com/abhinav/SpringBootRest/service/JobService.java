package com.abhinav.SpringBootRest.service;

import com.abhinav.SpringBootRest.dto.JobRequest;
import com.abhinav.SpringBootRest.model.JobPost;
import com.abhinav.SpringBootRest.model.Role;
import com.abhinav.SpringBootRest.model.User;
import com.abhinav.SpringBootRest.repo.ApplicationRepo;
import com.abhinav.SpringBootRest.repo.JobRepo;
import com.abhinav.SpringBootRest.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;

@Service
public class JobService {
    @Autowired
    private JobRepo jobRepo;

    @Autowired
    private ApplicationRepo applicationRepo;

    @Autowired
    private UserRepo userRepo;

    public List<JobPost> loadjobs(User recruiter){
        validateRecruiter(recruiter);

        List<JobPost> jobs = new ArrayList<>();
        addSeedJobIfMissing(jobs, recruiter, "AstraNova Technologies", "Backend Software Engineer", "Build resilient microservices and APIs for our hiring intelligence platform.", 3, List.of("Java", "Spring Boot", "PostgreSQL"));
        addSeedJobIfMissing(jobs, recruiter, "Nimbus Analytics", "Data Scientist", "Develop predictive models and experimentation pipelines for workforce insights.", 4, List.of("Python", "Machine Learning", "SQL"));
        addSeedJobIfMissing(jobs, recruiter, "PixelForge Studio", "Frontend React Developer", "Design and implement polished, accessible interfaces for enterprise clients.", 2, List.of("React", "TypeScript", "CSS"));
        addSeedJobIfMissing(jobs, recruiter, "Skyline Systems", "DevOps Engineer", "Automate deployment workflows and strengthen cloud reliability across environments.", 4, List.of("AWS", "Docker", "CI/CD"));
        addSeedJobIfMissing(jobs, recruiter, "Veridian Health", "Product UX Designer", "Craft intuitive product journeys for clinician and patient-facing web tools.", 3, List.of("Figma", "Design Systems", "User Research"));

        if (!jobs.isEmpty()) {
            jobRepo.saveAll(jobs);
        }

        return getAllJobs();
    }

    public JobPost addJob(JobRequest request, User recruiter){
        validateRecruiter(recruiter);
        validateJobRequest(request);

        JobPost jobPost = new JobPost();
        jobPost.setCompanyName(request.companyName().trim());
        jobPost.setPostProfile(request.postProfile().trim());
        jobPost.setPostDesc(request.postDesc().trim());
        jobPost.setReqExperience(request.reqExperience());
        jobPost.setPostTechStack(normalizeTechStack(request.postTechStack()));
        jobPost.setRecruiter(recruiter);
        return jobRepo.save(jobPost);
    }

    public List<JobPost> getAllJobs(){
        ensureSampleCatalogForHomeFeed();
        return jobRepo.findAll()
                .stream()
                .filter(this::isDisplayReadyJob)
                .collect(Collectors.toList());
    }

    public Optional<JobPost> getJob(int postId){
        return jobRepo.findById(postId);
    }

    public JobPost editJob(int postId, JobRequest request, User recruiter) {
        validateRecruiter(recruiter);
        validateJobRequest(request);

        JobPost existingJob = getJob(postId)
                .orElseThrow(() -> new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Job not found"));

        if (existingJob.getRecruiter() == null || !existingJob.getRecruiter().getId().equals(recruiter.getId())) {
            throw new ResponseStatusException(FORBIDDEN, "You can only edit your own jobs");
        }

        existingJob.setPostProfile(request.postProfile().trim());
        existingJob.setCompanyName(request.companyName().trim());
        existingJob.setPostDesc(request.postDesc().trim());
        existingJob.setReqExperience(request.reqExperience());
        existingJob.setPostTechStack(normalizeTechStack(request.postTechStack()));
        return jobRepo.save(existingJob);
    }

    public void deleteJob(int postId) {
        applicationRepo.deleteByJobPostPostId(postId);
        jobRepo.deleteById(postId);
    }

    public boolean isOwnedByRecruiter(int postId, Long recruiterId) {
        return recruiterId != null && jobRepo.existsByPostIdAndRecruiterId(postId, recruiterId);
    }

    public List<JobPost> search(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return getAllJobs();
        }

        String normalizedKeyword = keyword.trim().toLowerCase();
        return jobRepo.findAll()
                .stream()
                .filter(this::isDisplayReadyJob)
                .filter(job ->
                        containsIgnoreCase(job.getCompanyName(), normalizedKeyword) ||
                        containsIgnoreCase(job.getPostProfile(), normalizedKeyword) ||
                        containsIgnoreCase(job.getPostDesc(), normalizedKeyword) ||
                        (job.getPostTechStack() != null && job.getPostTechStack().stream()
                                .anyMatch(skill -> containsIgnoreCase(skill, normalizedKeyword)))
                )
                .collect(Collectors.toList());
    }

    private void addSeedJobIfMissing(List<JobPost> jobs, User recruiter, String companyName, String profile, String description, int experience, List<String> techStack) {
        if (jobRepo.existsByPostProfileIgnoreCaseAndPostDescIgnoreCaseAndRecruiterId(profile, description, recruiter.getId())) {
            return;
        }

        JobPost job = new JobPost();
        job.setCompanyName(companyName);
        job.setPostProfile(profile);
        job.setPostDesc(description);
        job.setReqExperience(experience);
        job.setPostTechStack(techStack);
        job.setRecruiter(recruiter);
        jobs.add(job);
    }

    private void validateRecruiter(User recruiter) {
        if (recruiter == null) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        if (recruiter.getRole() != Role.RECRUITER) {
            throw new ResponseStatusException(FORBIDDEN, "Only recruiters can manage jobs");
        }
    }

    private void validateJobRequest(JobRequest request) {
        if (request == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Job payload is required");
        }
        if (request.companyName() == null || request.companyName().trim().isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "Company name is required");
        }
        if (request.postProfile() == null || request.postProfile().trim().isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "Job profile is required");
        }
        if (request.postDesc() == null || request.postDesc().trim().isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "Job description is required");
        }
        if (request.reqExperience() == null || request.reqExperience() < 0) {
            throw new ResponseStatusException(BAD_REQUEST, "Required experience must be zero or greater");
        }
    }

    private List<String> normalizeTechStack(List<String> techStack) {
        if (techStack == null) {
            return List.of();
        }

        return techStack.stream()
                .filter(skill -> skill != null && !skill.trim().isEmpty())
                .map(String::trim)
                .distinct()
                .collect(Collectors.toList());
    }

    private boolean containsIgnoreCase(String value, String normalizedKeyword) {
        return value != null && value.toLowerCase().contains(normalizedKeyword);
    }

    private boolean isDisplayReadyJob(JobPost job) {
        return job != null
                && job.getCompanyName() != null && !job.getCompanyName().isBlank()
                && job.getPostProfile() != null && !job.getPostProfile().isBlank()
                && job.getPostDesc() != null && !job.getPostDesc().isBlank();
    }

    private void ensureSampleCatalogForHomeFeed() {
        boolean hasDisplayReadyJobs = jobRepo.findAll().stream().anyMatch(this::isDisplayReadyJob);
        if (hasDisplayReadyJobs) {
            return;
        }

        User seedRecruiter = userRepo.findFirstByRole(Role.RECRUITER).orElse(null);
        if (seedRecruiter == null) {
            return;
        }

        List<JobPost> curated = new ArrayList<>();
        addSeedJobIfMissing(curated, seedRecruiter, "AstraNova Technologies", "Backend Software Engineer", "Build resilient microservices and APIs for our hiring intelligence platform.", 3, List.of("Java", "Spring Boot", "PostgreSQL"));
        addSeedJobIfMissing(curated, seedRecruiter, "Nimbus Analytics", "Data Scientist", "Develop predictive models and experimentation pipelines for workforce insights.", 4, List.of("Python", "Machine Learning", "SQL"));
        addSeedJobIfMissing(curated, seedRecruiter, "PixelForge Studio", "Frontend React Developer", "Design and implement polished, accessible interfaces for enterprise clients.", 2, List.of("React", "TypeScript", "CSS"));
        addSeedJobIfMissing(curated, seedRecruiter, "Skyline Systems", "DevOps Engineer", "Automate deployment workflows and strengthen cloud reliability across environments.", 4, List.of("AWS", "Docker", "CI/CD"));
        addSeedJobIfMissing(curated, seedRecruiter, "Veridian Health", "Product UX Designer", "Craft intuitive product journeys for clinician and patient-facing web tools.", 3, List.of("Figma", "Design Systems", "User Research"));

        if (!curated.isEmpty()) {
            jobRepo.saveAll(curated);
        }
    }
}
