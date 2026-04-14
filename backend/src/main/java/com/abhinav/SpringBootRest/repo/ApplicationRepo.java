package com.abhinav.SpringBootRest.repo;

import com.abhinav.SpringBootRest.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepo extends JpaRepository<Application, Long> {
    List<Application> findByCandidateId(Long candidateId);
    List<Application> findByJobPostPostId(int postId);
    boolean existsByJobPostPostIdAndCandidateId(int postId, Long candidateId);
    void deleteByJobPostPostId(int postId);
}
