import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/axios';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Al iniciar la app, verifica si hay un token guardado y obtiene el usuario
    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            // Ruta: GET /auth/me — devuelve { success, data: { id, email, nombre, ... } }
            const res = await api.get('/auth/me');
            setUser(res.data.data);
        } catch (error) {
            // Token inválido o expirado
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    // Polling en tiempo real: verificar cada 5 segundos si el usuario sigue activo
    useEffect(() => {
        let interval;
        if (user) {
            interval = setInterval(() => {
                // Si el backend devuelve 401, el interceptor de axios se encarga de mostrar la alerta
                api.get('/auth/me').catch(() => {});
            }, 5000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [user]);

    const login = async (credentials) => {
        // Ruta: POST /auth/login — devuelve { success, data: { token, user: {...} } }
        const res = await api.post('/auth/login', credentials);
        const { token, user: userData } = res.data.data;

        // Guardar token en localStorage (el interceptor de axios lo adjuntará automáticamente)
        localStorage.setItem('token', token);

        setUser(userData);
        return userData;
    };

    const logout = () => {
        // El backend PHP no tiene endpoint de logout (JWT es stateless)
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
