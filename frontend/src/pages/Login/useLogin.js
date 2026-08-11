import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function useLogin() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            if (isRegistering) {
                await register({ nombre, apellido, email, password, rol_id: 2 });
                navigate("/dashboard");
            } else {
                await login({ email, password });
                navigate("/dashboard");
            }
        } catch (err) {
            setError(
                isRegistering 
                ? (err.response?.data?.message || "Error al registrar. Verifica los datos.") 
                : "Credenciales incorrectas o error de conexión."
            );
        }
    };

    const handleSwitchMode = (registerMode) => {
        setIsRegistering(registerMode);
        setError("");
        setEmail("");
        setPassword("");
        setNombre("");
        setApellido("");
    };

    return {
        isRegistering,
        nombre,
        setNombre,
        apellido,
        setApellido,
        email,
        setEmail,
        password,
        setPassword,
        error,
        handleSubmit,
        handleSwitchMode
    };
}
