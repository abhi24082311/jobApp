import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Box, Button, Card, CircularProgress, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import api from "../api";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`/job/${id}`);
        setJob(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.response?.data || "Unable to load job details.");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: "2% 4%" }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: "2% 4%" }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ color: "var(--text-light)", mb: 2 }}>
        Back
      </Button>
      <Card className="glass-card">
        <Typography variant="overline" sx={{ color: "var(--text-muted)", letterSpacing: 1.2 }}>
          {job?.companyName}
        </Typography>
        <Typography variant="h4" className="gradient-text" gutterBottom>
          {job?.postProfile}
        </Typography>
        <Typography sx={{ color: "var(--text-muted)", mb: 2 }}>
          Posted by: {job?.recruiter?.username || "Unknown recruiter"}
        </Typography>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Job Description
        </Typography>
        <Typography sx={{ color: "var(--text-light)", mb: 3 }}>{job?.postDesc}</Typography>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Required Experience
        </Typography>
        <Typography sx={{ color: "var(--text-light)", mb: 3 }}>
          {job?.reqExperience} year(s)
        </Typography>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Required Skills
        </Typography>
        <Typography sx={{ color: "var(--text-light)" }}>
          {job?.postTechStack?.length ? job.postTechStack.join(", ") : "No specific skills listed."}
        </Typography>
      </Card>
    </Box>
  );
};

export default JobDetails;
