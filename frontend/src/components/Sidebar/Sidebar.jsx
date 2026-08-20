import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Sidebar({ isOpen }) {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: "/dashboard", label: "Dashboard", icon: "bi-grid-1x2-fill" },
        { path: "/gestion-tareas", label: "Tareas", icon: "bi-card-checklist" },
        { path: "/usuarios", label: "Usuarios", icon: "bi-people" },
        ...(user && Number(user.rol_id) === 1 ? [
            { path: "/movimientos", label: "Movimientos", icon: "bi-arrow-left-right" },
            { path: "/reportes", label: "Reportes", icon: "bi-bar-chart-fill" }
        ] : [])
    ];

    return (
        <aside
            className={`w-64 max-w-[85vw] h-screen fixed left-0 top-0 z-50 flex flex-col border-r transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
            aria-label="Menú lateral"
        >
            {/* Header Brand */}
            <div className="p-6 flex items-center border-b" style={{ borderColor: 'var(--border-color)' }}>
                <Link
                    to="/"
                    className="text-xl font-extrabold flex items-center gap-2 no-underline hover:no-underline"
                    style={{ color: 'var(--text-primary)', textDecoration: 'none' }}
                >
                    <i className="bi bi-buildings text-blue-600 text-2xl" aria-hidden="true"></i>
                    <span style={{ textDecoration: 'none' }}>Tecno<span className="text-blue-600">film</span></span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Navegación principal">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all no-underline hover:no-underline ${active
                                ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 font-semibold'
                                : 'hover:bg-slate-500/10'
                                }`}
                            style={{
                                color: active ? '#2563eb' : 'var(--text-secondary)',
                                textDecoration: 'none'
                            }}
                            aria-current={active ? "page" : undefined}
                        >
                            <i className={`bi ${item.icon} text-base ${active ? 'text-blue-600 dark:text-blue-400' : 'opacity-70'}`}></i>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / User Profile */}
            <div className="p-4 border-t flex flex-col gap-3" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 border" style={{ borderColor: 'var(--border-color)' }}>
                        <i className="bi bi-person-fill text-lg"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                            {user?.nombre ? `${user.nombre} ${user.apellido || ''}`.trim() : (user?.email || 'Usuario')}
                        </div>
                        <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                            {user?.rol_id === 1 ? 'Administrador' : 'Empleado'}
                        </div>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20"
                    aria-label="Cerrar sesión"
                >
                    <i className="bi bi-box-arrow-right"></i>
                    <span>Cerrar sesión</span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
