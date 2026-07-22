import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
});

// Interceptor: adjunta el Bearer token automáticamente si existe en localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor de respuesta: si recibimos 401, limpiamos el token y redirigimos al login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            const msg = error.response?.data?.message || 'Tu sesión ha expirado.';
            // Solo redirigir si no estamos ya en login
            if (window.location.pathname !== '/login') {
                import('sweetalert2').then(({ default: Swal }) => {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Sesión terminada',
                        text: msg,
                        confirmButtonText: 'Entendido',
                        confirmButtonColor: '#0d6efd'
                    }).then(() => {
                        window.location.href = '/login';
                    });
                });
            }
        }
        return Promise.reject(error);
    }
);

export default api;
