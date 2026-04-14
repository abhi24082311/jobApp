import React, { useEffect, useState } from 'react';
import { Box, Button, Modal, Typography, TextField, Alert } from '@mui/material';
import api from '../api';

const ApplyModal = ({ open, handleClose, job }) => {
    const [resume, setResume] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [inputKey, setInputKey] = useState(0);

    useEffect(() => {
        if (!open) {
            setResume(null);
            setMessage('');
            setError('');
            setInputKey(prev => prev + 1);
        }
    }, [open]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            setResume(null);
            return;
        }
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            setError('Please upload a PDF resume.');
            setResume(null);
            setInputKey(prev => prev + 1);
            return;
        }
        setError('');
        setResume(file);
    };

    const handleApply = async (e) => {
        e.preventDefault();
        if (!resume) {
            setError('Please select a resume to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('resume', resume);

        try {
            await api.post(`/api/applications/apply/${job?.postId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage('Application submitted successfully!');
            setError('');
            setTimeout(() => {
                handleClose();
                setMessage('');
                setResume(null);
            }, 2000);
        } catch (err) {
            setError(err.response?.data || 'Failed to apply. Please try again.');
        }
    };

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'var(--bg-card)',
        border: '1px solid var(--glass-border)',
        boxShadow: 24,
        p: 4,
        borderRadius: '12px',
        backdropFilter: 'blur(16px)'
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
                <Typography variant="h5" component="h2" className="gradient-text" gutterBottom>
                    Apply for {job?.postProfile}
                </Typography>
                
                {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <form onSubmit={handleApply}>
                    <Typography sx={{ color: 'var(--text-light)', mb: 1 }}>
                        Upload Resume (PDF only)
                    </Typography>
                    <TextField 
                        key={inputKey}
                        type="file" 
                        fullWidth 
                        inputProps={{ accept: ".pdf" }}
                        onChange={handleFileChange}
                        sx={{ 
                            input: { color: 'var(--text-light)' }, 
                            mb: 3, 
                            border: '1px solid var(--glass-border)',
                            borderRadius: '4px'
                        }}
                    />
                    <Box display="flex" justifyContent="flex-end" gap={2}>
                        <Button onClick={handleClose} sx={{ color: 'var(--text-muted)' }}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" className="btn-primary">
                            Submit Application
                        </Button>
                    </Box>
                </form>
            </Box>
        </Modal>
    );
};

export default ApplyModal;
