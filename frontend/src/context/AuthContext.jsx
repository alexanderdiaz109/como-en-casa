import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // AL REFRESCAR (F5): El sistema busca si hay un token guardado
        const savedToken = localStorage.getItem('cec_token');
        if (savedToken) {
            // Aquí podríamos validar el token con el backend
            // Por ahora, si hay token, recuperamos la sesión
            const savedUser = JSON.parse(localStorage.getItem('cec_user'));
            setUser(savedUser);
        }
        setLoading(false);
    }, []);

    const login = (token, userData) => {
        localStorage.setItem('cec_token', token);
        localStorage.setItem('cec_user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
