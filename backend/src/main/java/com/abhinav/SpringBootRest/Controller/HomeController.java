package com.abhinav.SpringBootRest.Controller;

import com.abhinav.SpringBootRest.dto.JobRequest;
import com.abhinav.SpringBootRest.dto.JobResponse;
import com.abhinav.SpringBootRest.model.JobPost;
import com.abhinav.SpringBootRest.model.Role;
import com.abhinav.SpringBootRest.model.User;
import com.abhinav.SpringBootRest.security.JwtUtil;
import com.abhinav.SpringBootRest.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@CrossOrigin("http://localhost:3000")
public class HomeController {
    @Autowired
    private JobService service;

    @Autowired
    private JwtUtil jwtUtil;


    @GetMapping("load")
    public List<JobResponse> loadjobs(@AuthenticationPrincipal User user){
        return service.loadjobs(user).stream()
                .map(JobResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("jobs")
    public List<JobResponse> viewalljobs(@RequestParam(value = "keyword", required = false) String keyword){
        List<JobPost> jobs = (keyword == null || keyword.isBlank())
                ? service.getAllJobs()
                : service.search(keyword);

        return jobs.stream()
                .map(JobResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("jobs/keyword/{keyword}")
    public List<JobResponse> search(@PathVariable("keyword") String keyword){
        return service.search(keyword).stream()
                .map(JobResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("job/{postId}")
    public JobResponse getJob(@PathVariable int postId){
        return service.getJob(postId)
                .map(JobResponse::fromEntity)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found"));
    }

    @PostMapping("job")
    public ResponseEntity<JobResponse> addJob(@RequestBody JobRequest jobRequest, @AuthenticationPrincipal User user){
        JobPost createdJob = service.addJob(jobRequest, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(JobResponse.fromEntity(createdJob));
    }

    @PutMapping("job/{postId}")
    public ResponseEntity<JobResponse> editJob(@PathVariable("postId") int postId, @RequestBody JobRequest jobRequest, @AuthenticationPrincipal User user){
        JobPost updatedJob = service.editJob(postId, jobRequest, user);
        return ResponseEntity.ok(JobResponse.fromEntity(updatedJob));
    }

    @DeleteMapping("job/{postId}")
    public ResponseEntity<?> deleteJob(@PathVariable int postId, @RequestHeader(value = "Authorization", required = false) String authHeader){
        return deleteJobInternal(postId, authHeader);
    }

    @PostMapping("job/delete/{postId}")
    public ResponseEntity<?> deleteJobByPost(@PathVariable int postId, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return deleteJobInternal(postId, authHeader);
    }

    private ResponseEntity<?> deleteJobInternal(int postId, String authHeader) {
        JobPost existingJob = service.getJob(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found"));

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        String token = authHeader.substring(7);
        String role = jwtUtil.extractClaim(token, claims -> claims.get("role", String.class));
        if (!Role.RECRUITER.name().equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only recruiters can delete jobs");
        }

        service.deleteJob(postId);
        return ResponseEntity.noContent().build();
    }
}
