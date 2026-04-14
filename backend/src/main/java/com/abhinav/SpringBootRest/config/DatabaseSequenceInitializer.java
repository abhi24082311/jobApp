package com.abhinav.SpringBootRest.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSequenceInitializer {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void initializeJobPostSequence() {
        // Keep sequence aligned with existing records when schema already exists.
        jdbcTemplate.execute(
                "SELECT setval('job_post_seq', COALESCE((SELECT MAX(post_id) FROM job_post), 0) + 1, false)"
        );
    }
}
