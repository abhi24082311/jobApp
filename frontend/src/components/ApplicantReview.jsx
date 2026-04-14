import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Box, Card, Typography, Grid, Select, MenuItem, Button, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AuthContext } from '../context/AuthContext';

const ApplicantReview = () => {
    const { jobId } = useParams();
    const [applicants, setApplicants] = useState([]);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchApplicants = async () => {
            try {
                const response = await api.get(`/api/applications/job/${jobId}`);
                setApplicants(response.data);
            } catch (err) {
                console.error("Error fetching applicants", err);
            }
        };
        if (user?.role === 'RECRUITER') {
            fetchApplicants();
        }
    }, [jobId, user]);

    const handleStatusChange = async (appId, newStatus) => {
        try {
            await api.put(`/api/applications/${appId}/status?status=${newStatus}`);
            setApplicants(applicants.map(app => app.id === appId ? { ...app, status: newStatus } : app));
        } catch (err) {
            console.error("Error updating status", err);
        }
    };

    const handleDownload = async (app) => {
        try {
            const response = await api.get(`/api/applications/download/${app.id}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', app.resumeFileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error("Error downloading file", err);
        }
    };

    return (
        <Box sx={{ padding: '2% 4%' }}>
            <Box display="flex" alignItems="center" sx={{ mb: 4 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ color: 'var(--text-light)', mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" className="gradient-text" sx={{ margin: 0 }}>
                    Applicant Review
                </Typography>
            </Box>

            {applicants.length === 0 ? (
                <Typography sx={{ color: 'var(--text-muted)' }}>No applicants yet for this position.</Typography>
            ) : (
                <Grid container spacing={3}>
                    {applicants.map((app) => (
                        <Grid item xs={12} key={app.id}>
                            <Card className="glass-card" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Candidate: {app.candidate.username}
                                    </Typography>
                                    <Typography sx={{ color: 'var(--text-muted)', fontSize: '0.9rem', mb: 1 }}>
                                        Email: {app.candidate.email}
                                    </Typography>
                                    <Button 
                                        variant="outlined" 
                                        size="small" 
                                        onClick={() => handleDownload(app)}
                                        sx={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
                                    >
                                        Download Resume
                                    </Button>
                                </Box>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <Typography sx={{ color: 'var(--text-light)' }}>Status:</Typography>
                                    <Select
                                        size="small"
                                        value={app.status}
                                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                        sx={{ 
                                            color: 'var(--text-light)', 
                                            '.MuiOutlinedInput-notchedOutline': { borderColor: 'var(--glass-border)' },
                                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--accent)' },
                                            '.MuiSvgIcon-root ': { fill: "white !important" }
                                        }}
                                    >
                                        <MenuItem value="APPLIED">Applied</MenuItem>
                                        <MenuItem value="REVIEWING">Reviewing</MenuItem>
                                        <MenuItem value="SELECTED">Selected</MenuItem>
                                        <MenuItem value="REJECTED">Rejected</MenuItem>
                                    </Select>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default ApplicantReview;
