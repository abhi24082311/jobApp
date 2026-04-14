import React, { useContext, useEffect, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import {
    Box,
    Card,
    Grid,
    InputAdornment,
    TextField,
    Typography,
    Button
} from "@mui/material";
import api from "../api";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ApplyModal from './ApplyModal'; // added import

const AllPosts = () => {
    const [query, setQuery] = useState("");
    const [posts, setPosts] = useState([]);
    const [applyModalOpen, setApplyModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const handleEdit = (id) => {
        navigate(`/edit/${id}`);
    }

    const openApplyModal = (job) => {
        if (!user) {
            navigate('/login');
            return;
        }
        setSelectedJob(job);
        setApplyModalOpen(true);
    };

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await api.get(`/jobs`, {
                    params: { keyword: query }
                });
                setPosts(response.data);
            } catch (err) {
                console.error(err);
            }
        };
        const fetchInitialPosts = async () => {
            try {
                const response = await api.get(`/jobs`);
                setPosts(response.data);
            } catch (err) {
                console.error(err);
            }
        }
        if (query.length === 0) fetchInitialPosts();
        if (query.length > 2) fetchPosts();
    }, [query]);

    const handleDelete = async (id) => {
        try {
            await api.post(`/job/delete/${id}`);
            setPosts(posts.filter(p => p.postId !== id));
        } catch (err) {
            console.error("Failed to delete", err);
        }
    }

    return (
        <Grid container spacing={4} sx={{ padding: "2% 4%" }}>
            <ApplyModal 
                open={applyModalOpen} 
                handleClose={() => setApplyModalOpen(false)} 
                job={selectedJob} 
            />
            <Grid item xs={12}>
                <Box display="flex" justifyContent="center">
                    <TextField
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: 'var(--text-muted)' }} />
                                </InputAdornment>
                            ),
                            style: { color: 'var(--text-light)', background: 'var(--bg-card)', borderRadius: '12px' }
                        }}
                        placeholder="Search jobs by profile or description..."
                        sx={{ width: "60%" }}
                        variant="outlined"
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </Box>
            </Grid>
            {posts && posts.map((p) => {
                return (
                    <Grid key={p.postId} item xs={12} sm={6} md={4}>
                        <Card className="glass-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-card)' }}>
                            <Typography variant="overline" sx={{ color: "var(--text-muted)", letterSpacing: 1.2 }}>
                                {p.companyName}
                            </Typography>
                            <Typography variant="h5" sx={{ mb: 1, fontWeight: "600" }} className="gradient-text">
                                {p.postProfile}
                            </Typography>
                            <Typography sx={{ color: "var(--text-muted)", mb: 2 }} variant="body2">
                                {p.postDesc}
                            </Typography>
                            
                            <Box sx={{ mt: 'auto' }}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                    Experience: <span style={{ color: 'var(--accent)' }}>{p.reqExperience} years</span>
                                </Typography>
                                <Typography variant="subtitle2" gutterBottom>Skills:</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                    {p.postTechStack && p.postTechStack.length > 0 ? p.postTechStack.map((s, i) => (
                                        <Box
                                            key={i}
                                            sx={{
                                                background: 'rgba(178, 107, 255, 0.22)',
                                                border: '1px solid rgba(214, 182, 255, 0.45)',
                                                color: '#f8f2ff',
                                                padding: '4px 9px',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                letterSpacing: '0.01em',
                                                textShadow: '0 1px 8px rgba(0, 0, 0, 0.35)'
                                            }}
                                        >
                                            {s}
                                        </Box>
                                    )) : <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>None listed</Typography>}
                                </Box>

                                <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        sx={{ color: 'var(--text-light)', borderColor: 'var(--glass-border)' }}
                                        onClick={() => navigate(`/jobs/${p.postId}`)}
                                    >
                                        View Details
                                    </Button>
                                    {user?.role === 'CANDIDATE' && (
                                        <Button variant="contained" className="btn-primary" size="small" onClick={() => openApplyModal(p)}>
                                            Apply
                                        </Button>
                                    )}
                                    {user?.role === 'RECRUITER' && user?.userId === p.recruiter?.id && (
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Button 
                                                variant="outlined" 
                                                size="small" 
                                                sx={{ color: 'var(--text-light)', borderColor: 'var(--glass-border)' }}
                                                onClick={() => navigate(`/applicants/${p.postId}`)}
                                            >
                                                Applicants
                                            </Button>
                                            <EditIcon sx={{ cursor: 'pointer', ml: 1, mr: 1, color: 'var(--text-muted)', '&:hover': { color: 'var(--accent)' } }} onClick={() => handleEdit(p.postId)} />
                                            <DeleteIcon sx={{ cursor: 'pointer', color: 'var(--text-muted)', '&:hover': { color: 'var(--secondary)' } }} onClick={() => handleDelete(p.postId)} />
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </Card>
                    </Grid>
                );
            })}
        </Grid>
    )
}

export default AllPosts;
