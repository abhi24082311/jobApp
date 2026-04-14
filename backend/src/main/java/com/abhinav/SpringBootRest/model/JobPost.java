package com.abhinav.SpringBootRest.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Component
@Entity
public class JobPost {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "job_post_seq_gen")
    @SequenceGenerator(name = "job_post_seq_gen", sequenceName = "job_post_seq", allocationSize = 1)
    private int postId;
    private String companyName;
    private String postProfile;
    private String postDesc;
    private Integer reqExperience;
    
    @jakarta.persistence.ElementCollection
    private List<String> postTechStack;

    @jakarta.persistence.ManyToOne(fetch = jakarta.persistence.FetchType.EAGER)
    @jakarta.persistence.JoinColumn(name = "recruiter_id")
    private User recruiter;
    
    public JobPost(int postId, String companyName, String postProfile, String postDesc, Integer reqExperience, List<String> postTechStack) {
        this.postId = postId;
        this.companyName = companyName;
        this.postProfile = postProfile;
        this.postDesc = postDesc;
        this.reqExperience = reqExperience;
        this.postTechStack = postTechStack;
    }
}
