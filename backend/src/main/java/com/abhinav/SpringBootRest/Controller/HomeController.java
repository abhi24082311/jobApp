package com.abhinav.SpringBootRest.Controller;

import com.abhinav.SpringBootRest.model.JobPost;
import com.abhinav.SpringBootRest.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin("http://localhost:3000")
public class HomeController {
    @Autowired
    private JobService service;


    @GetMapping("load")
    public void loadjobs(){
        service.loadjobs();
    }

    @GetMapping("jobs")
    public List<JobPost> viewalljobs(){
        return service.getAllJobs();
    }

    @GetMapping("jobs/keyword/{keyword}")
    public List<JobPost> search(@PathVariable("keyword") String keyword){
        return service.search(keyword);
    }

    @GetMapping("job/{postId}")
    public Optional<JobPost> getJob(@PathVariable int postId){
        return service.getJob(postId);
    }

    @PostMapping("job")
    public Optional<JobPost> addJob(@RequestBody JobPost jobPost){
        service.addJob(jobPost);
        return service.getJob(jobPost.getPostId());
    }

    @PutMapping("job")
    public void editJob(@RequestBody JobPost job1){
        service.editJob(job1);
    }

    @DeleteMapping("job/{postId}")
    public void deleteJob(@PathVariable int postId){
        service.deleteJob(postId);
    }
}
