import React, { useContext, useState } from "react";
import api from "../api";
import {
  Typography,
  TextField,
  Button,
  Box,
  Card,
  Chip,
  Alert,
  Snackbar
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const initial = { companyName: "", postProfile: "", reqExperience: 0, postTechStack: [], postDesc: "" };

const Create = () => {
  const skillSet = ["Javascript", "Java", "Python", "Django", "Rust"];

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState(initial);
  const [alertInfo, setAlertInfo] = useState({ open: false, message: "", severity: "success" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user?.role !== "RECRUITER") {
      setAlertInfo({ open: true, message: "Only recruiters can create jobs.", severity: "error" });
      return;
    }

    const payload = {
      companyName: form.companyName.trim(),
      postProfile: form.postProfile.trim(),
      postDesc: form.postDesc.trim(),
      reqExperience: Number(form.reqExperience),
      postTechStack: form.postTechStack
    };

    try {
      await api.post("/job", payload);
      setAlertInfo({ open: true, message: "Job post created successfully!", severity: "success" });
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
       console.error("Error creating job:", error);
       const message =
        error.response?.data?.message ||
        error.response?.data ||
        "Failed to create a job.";
       setAlertInfo({ open: true, message, severity: "error" });
    }
  };

  const { companyName, postProfile, reqExperience, postDesc, postTechStack } = form;

  const handleSkillToggle = (skill) => {
    setForm(prevForm => {
      const currentIndex = prevForm.postTechStack.indexOf(skill);
      const newTechStack = [...prevForm.postTechStack];
      if (currentIndex === -1) {
        newTechStack.push(skill);
      } else {
        newTechStack.splice(currentIndex, 1);
      }
      return { ...prevForm, postTechStack: newTechStack };
    });
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" padding="2%">
      <Card className="glass-card" sx={{ width: "100%", maxWidth: 600, padding: 4 }}>
        <Typography variant="h4" className="gradient-text" align="center" gutterBottom sx={{ fontWeight: '600' }}>
          Create New Job Post
        </Typography>
        
        <form autoComplete="off" onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 3 }}>
            <TextField
              type="text"
              required
              fullWidth
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              label="Company Name"
              variant="outlined"
              value={companyName}
            />

            <TextField
              type="text"
              required
              fullWidth
              onChange={(e) => setForm({ ...form, postProfile: e.target.value })}
              label="Job Role / Profile"
              variant="outlined"
              value={postProfile}
            />
            
            <TextField
              type="number"
              required
              fullWidth
              inputProps={{ min: 0 }}
              onChange={(e) => setForm({ ...form, reqExperience: Number(e.target.value) })}
              label="Years of Experience"
              variant="outlined"
              value={reqExperience}
            />
            
            <TextField
              type="text"
              required
              fullWidth
              multiline
              rows={4}
              onChange={(e) => setForm({ ...form, postDesc: e.target.value })}
              label="Job Description"
              variant="outlined"
              value={postDesc}
            />
            
            <Box>
              <Typography variant="subtitle1" sx={{ color: 'var(--text-light)', mb: 1 }}>
                Required Skills
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {skillSet.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    onClick={() => handleSkillToggle(skill)}
                    color={postTechStack.includes(skill) ? "primary" : "default"}
                    sx={{
                       cursor: 'pointer',
                       backgroundColor: postTechStack.includes(skill) ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                       color: 'var(--text-light)',
                       '&:hover': {
                         backgroundColor: postTechStack.includes(skill) ? 'var(--accent)' : 'rgba(255,255,255,0.2)'
                       }
                    }}
                  />
                ))}
              </Box>
            </Box>

            <Button
              variant="contained"
              type="submit"
              className="btn-primary"
              size="large"
              sx={{ mt: 2 }}
            >
              Post Job
            </Button>
          </Box>
        </form>
      </Card>
      
      <Snackbar open={alertInfo.open} autoHideDuration={6000} onClose={() => setAlertInfo({...alertInfo, open: false})}>
        <Alert onClose={() => setAlertInfo({...alertInfo, open: false})} severity={alertInfo.severity} sx={{ width: '100%' }}>
          {alertInfo.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Create;
