import React, { useContext } from 'react';
import {
    AppBar,
    Toolbar,
    Box,
    Typography,
    Button,
} from "@mui/material";
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <Box sx={{ flexGrow: 1, padding: '1% 2%' }}>
            <AppBar
                position="static"
                elevation={0}
                style={{
                    background: 'rgba(10, 10, 14, 0.36)',
                    borderBottom: '1px solid var(--glass-border)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)'
                }}
            >
                <Toolbar variant="dense" sx={{ padding: '10px 0' }}>
                    <Typography variant="h4" component={Link} to="/" sx={{ 
                        flexGrow: 1, 
                        textDecoration: 'none',
                        fontWeight: '700', 
                        fontFamily: "'Outfit', sans-serif" 
                    }} className="gradient-text">
                        JobApp
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Button color="inherit" component={Link} to="/" sx={{ color: 'var(--text-light)' }}>
                            Home
                        </Button>
                        
                        {user?.role === 'RECRUITER' && (
                            <Button color="inherit" component={Link} to="/create" sx={{ color: 'var(--text-light)' }}>
                                Add Job
                            </Button>
                        )}

                        {user?.role === 'CANDIDATE' && (
                            <Button color="inherit" component={Link} to="/my-applications" sx={{ color: 'var(--text-light)' }}>
                                My Applications
                            </Button>
                        )}

                        {user ? (
                            <>
                                <Typography sx={{ color: 'var(--text-muted)', ml: 2, mr: 1 }}>
                                    Hi, {user.username}
                                </Typography>
                                <Button variant="outlined" onClick={handleLogout} sx={{ 
                                    borderColor: 'var(--glass-border)', 
                                    color: 'var(--text-light)',
                                    '&:hover': { borderColor: 'var(--accent)', background: 'rgba(178, 107, 255, 0.08)' }
                                }}>
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button component={Link} to="/login" sx={{ color: 'var(--text-light)' }}>
                                    Login
                                </Button>
                                <Button component={Link} to="/register" variant="contained" className="btn-primary">
                                    Sign Up
                                </Button>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>
        </Box>
    );
};

export default Navbar;
