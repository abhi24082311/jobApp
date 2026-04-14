import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Box, Card, TextField, Button, Typography, Alert, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const Register = () => {
    const [user, setUser] = useState({ username: '', password: '', email: '', role: 'CANDIDATE' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/auth/register', user);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data || 'Registration failed');
        }
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
            <Card className="glass-card" sx={{ width: 400, padding: 4 }}>
                <Typography variant="h4" gutterBottom className="gradient-text" textAlign="center">
                    Create Account
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <form onSubmit={handleRegister}>
                    <TextField 
                        fullWidth margin="normal" label="Username" 
                        value={user.username} onChange={e => setUser({...user, username: e.target.value})} 
                    />
                    <TextField 
                        fullWidth margin="normal" label="Email" type="email"
                        value={user.email} onChange={e => setUser({...user, email: e.target.value})} 
                    />
                    <TextField 
                        fullWidth margin="normal" label="Password" type="password" 
                        value={user.password} onChange={e => setUser({...user, password: e.target.value})} 
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>I am a...</InputLabel>
                        <Select 
                            value={user.role} 
                            onChange={e => setUser({...user, role: e.target.value})}
                            label="I am a..."
                        >
                            <MenuItem value="CANDIDATE">Candidate looking for jobs</MenuItem>
                            <MenuItem value="RECRUITER">Recruiter</MenuItem>
                        </Select>
                    </FormControl>
                    <Button fullWidth type="submit" variant="contained" className="btn-primary" sx={{ mt: 3, mb: 2 }}>
                        Sign Up
                    </Button>
                </form>
                <Typography textAlign="center">
                    Already have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Login</Link>
                </Typography>
            </Card>
        </Box>
    );
};

export default Register;
