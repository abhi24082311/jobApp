import React, { useEffect, useState } from 'react';
import api from '../api';
import { Box, Card, Typography, Grid, Chip } from '@mui/material';

const MyApplications = () => {
    const [applications, setApplications] = useState([]);

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const response = await api.get('/api/applications/my');
                setApplications(response.data);
            } catch (err) {
                console.error("Error fetching applications", err);
            }
        };
        fetchApps();
    }, []);

    const getStatusColor = (status) => {
        switch(status) {
            case 'APPLIED': return 'primary';
            case 'REVIEWING': return 'warning';
            case 'SELECTED': return 'success';
            case 'REJECTED': return 'error';
            default: return 'default';
        }
    };

    return (
        <Box sx={{ padding: '2% 4%' }}>
            <Typography variant="h4" className="gradient-text" gutterBottom sx={{ mb: 4 }}>
                My Applications
            </Typography>
            
            {applications.length === 0 ? (
                <Typography sx={{ color: 'var(--text-muted)' }}>You haven't applied to any jobs yet.</Typography>
            ) : (
                <Grid container spacing={3}>
                    {applications.map((app) => (
                        <Grid item xs={12} md={6} key={app.id}>
                            <Card className="glass-card">
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {app.jobPost.postProfile}
                                        </Typography>
                                        <Typography sx={{ color: 'var(--text-muted)', fontSize: '0.9rem', mb: 2 }}>
                                            Experience Required: {app.jobPost.reqExperience} years
                                        </Typography>
                                    </Box>
                                    <Chip 
                                        label={app.status} 
                                        color={getStatusColor(app.status)}
                                        variant="outlined" 
                                    />
                                </Box>
                                <Typography variant="body2" sx={{ color: 'var(--text-light)', mb: 1 }}>
                                    Resume Uploaded: <span style={{ color: 'var(--accent)' }}>{app.resumeFileName}</span>
                                </Typography>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default MyApplications;
