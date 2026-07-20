import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Navbar as BsNavbar, Nav, Container, Button } from 'react-bootstrap';
import './Navbar.css';

function Navbar() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

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

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path ? "active-link" : "";

    return (
        <BsNavbar expand="lg" className="navbar-premium sticky-top shadow-sm" variant={isDarkMode ? "dark" : "light"}>
            <Container fluid className="px-4">
                <BsNavbar.Brand as={Link} to="/" className="navbar-brand-custom fw-bold fs-4">
                    <i className="bi bi-buildings text-primary me-2"></i>
                    Tecno<span className="text-primary">film</span>
                </BsNavbar.Brand>
                <BsNavbar.Toggle aria-controls="basic-navbar-nav" />
                <BsNavbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto ms-4 gap-2">
                        {user && (
                            <>
                                <Nav.Link as={Link} to="/dashboard" className={`nav-link-custom ${isActive('/dashboard')}`}>
                                    <i className="bi bi-speedometer2 me-1"></i> Dashboard
                                </Nav.Link>
                                <Nav.Link as={Link} to="/gestion-tareas" className={`nav-link-custom ${isActive('/gestion-tareas')}`}>
                                    <i className="bi bi-card-checklist me-1"></i> Tareas
                                </Nav.Link>
                                <Nav.Link as={Link} to="/usuarios" className={`nav-link-custom ${isActive('/usuarios')}`}>
                                    <i className="bi bi-people me-1"></i> Usuarios
                                </Nav.Link>
                                {Number(user.rol_id) === 1 && (
                                    <Nav.Link as={Link} to="/movimientos" className={`nav-link-custom ${isActive('/movimientos')}`}>
                                        <i className="bi bi-clock-history me-1"></i> Movimientos
                                    </Nav.Link>
                                )}
                                <Nav.Link as={Link} to="/equipos" className={`nav-link-custom ${isActive('/equipos')}`}>
                                    <i className="bi bi-tools me-1"></i> Equipos
                                </Nav.Link>
                            </>
                        )}
                    </Nav>
                    <Nav className="align-items-center gap-3">
                        <Button
                            variant="link"
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="p-0 text-decoration-none text-secondary theme-toggle-btn"
                            title={isDarkMode ? "Modo Claro" : "Modo Oscuro"}
                        >
                            {isDarkMode ? <i className="bi bi-sun-fill text-warning fs-5"></i> : <i className="bi bi-moon-stars-fill fs-5"></i>}
                        </Button>

                        {user ? (
                            <div className="d-flex align-items-center gap-3 ms-2 border-start ps-3 border-secondary-subtle">
                                <div className="text-end d-none d-md-block">
                                    <div className="fw-semibold nav-user-name">{user.nombre}</div>
                                    <div className="nav-user-role" style={{ fontSize: '0.75rem' }}>
                                        {user.rol_id === 1 ? 'Administrador' : 'Empleado'}
                                    </div>
                                </div>
                                <Button variant="outline-danger" size="sm" onClick={handleLogout} className="rounded-pill px-3 fw-medium">
                                    <i className="bi bi-box-arrow-right me-1"></i> Salir
                                </Button>
                            </div>
                        ) : (
                            <Button as={Link} to="/login" variant="primary" className="rounded-pill px-4">
                                Ingresar
                            </Button>
                        )}
                    </Nav>
                </BsNavbar.Collapse>
            </Container>
        </BsNavbar>
    );
}

export default Navbar;