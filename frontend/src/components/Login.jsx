import React, { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { Box, Card, TextField, Button, Typography, Alert } from '@mui/material';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const redirectPath = location.state?.from?.pathname || '/';

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/auth/login', { username, password });
            login(res.data.token);
            navigate(redirectPath, { replace: true });
        } catch (err) {
            setError('Login failed. Please check credentials.');
        }
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
            <Card className="glass-card" sx={{ width: 400, padding: 4 }}>
                <Typography variant="h4" gutterBottom className="gradient-text" textAlign="center">
                    Welcome Back
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <form onSubmit={handleLogin}>
                    <TextField 
                        fullWidth margin="normal" label="Username" variant="outlined" 
                        value={username} onChange={e => setUsername(e.target.value)} 
                    />
                    <TextField 
                        fullWidth margin="normal" label="Password" type="password" variant="outlined" 
                        value={password} onChange={e => setPassword(e.target.value)} 
                    />
                    <Button fullWidth type="submit" variant="contained" className="btn-primary" sx={{ mt: 3, mb: 2 }}>
                        Sign In
                    </Button>
                </form>
                <Typography textAlign="center">
                    Don't have an account? <Link to="/register" style={{ color: 'var(--accent)' }}>Sign up</Link>
                </Typography>
            </Card>
        </Box>
    );
};

export default Login;
