import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Sidebar({ isOpen, onOpenProfile }) {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: "/dashboard", label: "Dashboard", icon: "bi-grid-1x2-fill" },
        { path: "/gestion-tareas", label: "Tareas", icon: "bi-card-checklist" },
        { path: "/movimientos", label: "Movimientos", icon: "bi-arrow-left-right" },
        { path: "/usuarios", label: "Usuarios", icon: "bi-people" },
        ...(user && Number(user.rol_id) === 1 ? [
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
            <div className="p-6 flex items-center border-b shrink-0" style={{ borderColor: 'var(--border-color)' }}>
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

            {/* Footer / User Profile (Clickeable para editar) */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-1.5" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <button
                    onClick={onOpenProfile}
                    type="button"
                    className="w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all hover:bg-blue-50 dark:hover:bg-slate-800/80 border-0 group cursor-pointer"
                    title="Hacer clic para ver y editar tu perfil"
                    aria-label="Editar mi perfil"
                >
                    <div className="w-10 h-10 rounded-full bg-blue-600/10 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center font-bold text-sm shrink-0 border border-blue-500/20 transition-colors">
                        {(user?.nombre?.charAt(0) || 'U').toUpperCase()}
                        {(user?.apellido?.charAt(0) || '').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate group-hover:text-blue-600 transition-colors flex items-center justify-between" style={{ color: 'var(--text-primary)' }}>
                            <span className="truncate">{user?.nombre ? `${user.nombre} ${user.apellido || ''}`.trim() : (user?.email || 'Usuario')}</span>
                            <i className="bi bi-pencil-square text-xs opacity-0 group-hover:opacity-100 text-blue-600 transition-opacity ml-1"></i>
                        </div>
                        <div className="text-xs truncate flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                            <span>{Number(user?.rol_id) === 1 ? 'Administrador' : 'Empleado'}</span>
                            <span className="text-[10px] opacity-60">• Editar</span>
                        </div>
                    </div>
                </button>

                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors border-0 cursor-pointer"
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
