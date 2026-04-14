import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [authReady, setAuthReady] = useState(false);

    useEffect(() => {
        if (!token) {
            setAuthReady(true);
            return;
        }

        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.exp && decoded.exp * 1000 <= Date.now()) {
                    logout();
                    return;
                }
                setUser({
                    username: decoded.sub,
                    role: decoded.role,
                    userId: decoded.userId
                });
                setAuthReady(true);
            } catch (error) {
                console.error("Invalid token");
                logout();
            }
        }
    }, [token]);

    const login = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setAuthReady(true);
    };

    return (
        <AuthContext.Provider value={{ user, token, authReady, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
