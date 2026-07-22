import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import './Sidebar.css';

function Sidebar({ isOpen }) {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path ? "active" : "";

    return (
        <aside className={`sidebar ${!isOpen ? 'collapsed' : ''}`} aria-label="Menú lateral">
            <div className="sidebar-header">
                <Link to="/" className="sidebar-brand" aria-label="Inicio Tecnofilm">
                    <i className="bi bi-buildings text-primary me-2" aria-hidden="true"></i>
                    Tecno<span className="text-primary">film</span>
                </Link>
            </div>

            <nav className="sidebar-nav" aria-label="Navegación principal">
                <ul className="nav-list">
                    <li className="nav-item">
                        <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`} aria-current={isActive('/dashboard') ? "page" : undefined}>
                            <i className="bi bi-grid-1x2-fill" aria-hidden="true"></i>
                            <span>Dashboard</span>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/gestion-tareas" className={`nav-link ${isActive('/gestion-tareas')}`} aria-current={isActive('/gestion-tareas') ? "page" : undefined}>
                            <i className="bi bi-card-checklist" aria-hidden="true"></i>
                            <span>Tareas</span>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/usuarios" className={`nav-link ${isActive('/usuarios')}`} aria-current={isActive('/usuarios') ? "page" : undefined}>
                            <i className="bi bi-people" aria-hidden="true"></i>
                            <span>Usuarios</span>
                        </Link>
                    </li>
                    {user && Number(user.rol_id) === 1 && (
                        <li className="nav-item">
                            <Link to="/movimientos" className={`nav-link ${isActive('/movimientos')}`} aria-current={isActive('/movimientos') ? "page" : undefined}>
                                <i className="bi bi-arrow-left-right" aria-hidden="true"></i>
                                <span>Movimientos</span>
                            </Link>
                        </li>
                    )}
                    <li className="nav-item">
                        <Link to="/equipos" className={`nav-link ${isActive('/equipos')}`} aria-current={isActive('/equipos') ? "page" : undefined}>
                            <i className="bi bi-tools" aria-hidden="true"></i>
                            <span>Equipos</span>
                        </Link>
                    </li>
                </ul>
            </nav>

            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="avatar">
                        <i className="bi bi-person-circle" aria-hidden="true"></i>
                    </div>
                    <div className="user-info">
                        <span className="user-name">{user?.nombre || 'Usuario'}</span>
                        <span className="user-role">{user?.rol_id === 1 ? 'Administrator' : 'Empleado'}</span>
                    </div>
                </div>
                <button onClick={logout} className="logout-btn" aria-label="Cerrar sesión">
                    <i className="bi bi-box-arrow-right" aria-hidden="true"></i>
                    <span>Salir</span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
