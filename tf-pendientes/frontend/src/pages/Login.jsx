import Navbar from "../components/Navbar";

import { useState } from "react";

function Login() {
    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aquí se puede manejar la autenticación
        console.log("Iniciando sesión con:", { usuario, password });
    };

    return (
        <div>
            <Navbar />
            <div className="container mt-5">
                <div className="card mx-auto" style={{ maxWidth: "400px" }}>
                    <div className="card-body">
                        <h2 className="text-center mb-4">Iniciar sesión</h2>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="usuario" className="form-label">
                                    Usuario
                                </label>
                                <input
                                    id="usuario"
                                    type="text"
                                    className="form-control"
                                    value={usuario}
                                    onChange={(e) => setUsuario(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">
                                    Contraseña
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    className="form-control"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn btn-primary w-100">
                                Ingresar
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
