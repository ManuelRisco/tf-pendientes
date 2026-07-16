import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Navbar() {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem("darkMode") === "true";
    });

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
        localStorage.setItem("darkMode", isDarkMode);
    }, [isDarkMode]);

    return (<nav className="navbar-premium d-flex justify-content-between align-items-center sticky-top">
        <Link to="/" className="navbar-brand-custom">
            Tecno<span>film</span>
        </Link>
        <div className="d-flex gap-1 align-items-center">
            <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="btn btn-link nav-link-custom border-0 text-decoration-none"
                title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
                {isDarkMode ? <i className="bi bi-sun-fill text-warning"></i> : <i className="bi bi-moon-fill"></i>}
            </button>
            <Link to="/hola-mundo" className="nav-link-custom">Hola Mundo</Link>
            <Link to="/dashboard" className="nav-link-custom">Dashboard</Link>
            <Link to="/usuarios" className="nav-link-custom">Usuarios</Link>
            <Link to="/equipos" className="nav-link-custom">Equipos</Link>
            <Link to="/gestion-tareas" className="nav-link-custom">Gestion Tareas</Link>
            <Link to="/" className="nav-link-custom ms-2 text-danger"><i className="bi bi-box-arrow-right"></i> Salir</Link>
        </div>
    </nav>);
}

export default Navbar