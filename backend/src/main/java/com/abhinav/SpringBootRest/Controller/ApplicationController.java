package com.abhinav.SpringBootRest.Controller;

import com.abhinav.SpringBootRest.dto.ApplicationResponse;
import com.abhinav.SpringBootRest.model.AppStatus;
import com.abhinav.SpringBootRest.model.Application;
import com.abhinav.SpringBootRest.model.JobPost;
import com.abhinav.SpringBootRest.model.Role;
import com.abhinav.SpringBootRest.model.User;
import com.abhinav.SpringBootRest.repo.ApplicationRepo;
import com.abhinav.SpringBootRest.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin("http://localhost:3000")
public class ApplicationController {

    @Autowired
    private ApplicationRepo applicationRepo;

    @Autowired
    private JobService jobService;

    private static final Path UPLOAD_DIR = Paths.get("uploads").toAbsolutePath().normalize();

    @PostMapping("/apply/{jobId}")
    public ResponseEntity<?> applyForJob(
            @PathVariable int jobId,
            @RequestParam("resume") MultipartFile resumeFile,
            @AuthenticationPrincipal User candidate) {
        if (candidate == null || candidate.getRole() != Role.CANDIDATE) {
            return ResponseEntity.status(403).body("Only candidates can apply for jobs");
        }

        JobPost job = jobService.getJob(jobId).orElse(null);
        if (job == null) {
            return ResponseEntity.badRequest().body("Job not found");
        }
        if (job.getRecruiter() == null) {
            return ResponseEntity.badRequest().body("This job is not available for applications");
        }
        if (resumeFile.isEmpty()) {
            return ResponseEntity.badRequest().body("Resume file is required");
        }
        String originalFileName = resumeFile.getOriginalFilename();
        if (originalFileName == null || !originalFileName.toLowerCase().endsWith(".pdf")) {
            return ResponseEntity.badRequest().body("Only PDF resumes are supported");
        }
        if (applicationRepo.existsByJobPostPostIdAndCandidateId(jobId, candidate.getId())) {
            return ResponseEntity.badRequest().body("You have already applied for this job");
        }

        try {
            if (!Files.exists(UPLOAD_DIR)) {
                Files.createDirectories(UPLOAD_DIR);
            }

            String fileExtension = getFileExtension(originalFileName);
            String newFileName = UUID.randomUUID().toString() + "." + fileExtension;
            Path filePath = UPLOAD_DIR.resolve(newFileName);
            Files.copy(resumeFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            Application app = new Application();
            app.setJobPost(job);
            app.setCandidate(candidate);
            app.setResumeFileName(Paths.get(originalFileName).getFileName().toString());
            app.setResumeFilePath(filePath.toString());
            app.setStatus(AppStatus.APPLIED);

            Application savedApplication = applicationRepo.save(app);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApplicationResponse.fromEntity(savedApplication, false));

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to store resume file");
        }
    }

    @GetMapping("/my")
    public List<ApplicationResponse> getMyApplications(@AuthenticationPrincipal User candidate) {
        if (candidate == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return applicationRepo.findByCandidateId(candidate.getId()).stream()
                .map(application -> ApplicationResponse.fromEntity(application, false))
                .collect(Collectors.toList());
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<?> getApplicationsForJob(
            @PathVariable int jobId,
            @AuthenticationPrincipal User recruiter) {
        if (recruiter == null || recruiter.getRole() != Role.RECRUITER) {
            return ResponseEntity.status(403).body("Only recruiters can review applicants");
        }

        JobPost job = jobService.getJob(jobId).orElse(null);
        if (job == null || job.getRecruiter() == null || !job.getRecruiter().getId().equals(recruiter.getId())) {
            return ResponseEntity.badRequest().body("Not authorized or job not found");
        }

        return ResponseEntity.ok(applicationRepo.findByJobPostPostId(jobId).stream()
                .map(application -> ApplicationResponse.fromEntity(application, true))
                .collect(Collectors.toList()));
    }

    @PutMapping("/{appId}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long appId,
            @RequestParam AppStatus status,
            @AuthenticationPrincipal User recruiter) {
        if (recruiter == null || recruiter.getRole() != Role.RECRUITER) {
            return ResponseEntity.status(403).body("Only recruiters can update application status");
        }

        Application app = applicationRepo.findById(appId).orElse(null);
        if (app == null || app.getJobPost() == null || app.getJobPost().getRecruiter() == null ||
                !app.getJobPost().getRecruiter().getId().equals(recruiter.getId())) {
            return ResponseEntity.badRequest().body("Application not found or unauthorized");
        }

        app.setStatus(status);
        Application updatedApplication = applicationRepo.save(app);
        return ResponseEntity.ok(ApplicationResponse.fromEntity(updatedApplication, true));
    }

    @GetMapping("/download/{appId}")
    public ResponseEntity<Resource> downloadResume(@PathVariable Long appId, @AuthenticationPrincipal User recruiter) {
        if (recruiter == null || recruiter.getRole() != Role.RECRUITER) {
            return ResponseEntity.status(403).build();
        }
        Application app = applicationRepo.findById(appId).orElse(null);
        if (app == null || app.getJobPost() == null || app.getJobPost().getRecruiter() == null ||
                !app.getJobPost().getRecruiter().getId().equals(recruiter.getId())) {
            return ResponseEntity.badRequest().build();
        }

        try {
            Path filePath = Paths.get(app.getResumeFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + app.getResumeFileName() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private String getFileExtension(String fileName) {
        if (fileName == null) return "";
        int lastIndexOf = fileName.lastIndexOf(".");
        if (lastIndexOf == -1) return "";
        return fileName.substring(lastIndexOf + 1);
    }
}
