import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function useLogin() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (isRegistering) {
            if (password !== confirmPassword) {
                setError("Las contraseñas no coinciden.");
                return;
            }
            if (password.length < 6) {
                setError("La contraseña debe tener al menos 6 caracteres.");
                return;
            }
        }

        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    const handleSwitchMode = (registerMode) => {
        setIsRegistering(registerMode);
        setError("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
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
        confirmPassword,
        setConfirmPassword,
        error,
        loading,
        handleSubmit,
        handleSwitchMode
    };
}
