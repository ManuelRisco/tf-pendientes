import { useTheme } from "../../context/ThemeContext";
import AccessibilityMenu from "../Accessibility/AccessibilityMenu";

function TopBar({ toggleSidebar, isSidebarOpen }) {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <header 
            className="h-16 px-4 sm:px-6 flex items-center justify-between border-b sticky top-0 z-30 transition-colors shrink-0"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
        >
            <div className="flex items-center gap-3">
                <button 
                    className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-500/10 transition-all active:scale-95 border-0 cursor-pointer" 
                    style={{ color: 'var(--text-primary)' }}
                    onClick={toggleSidebar}
                    title={isSidebarOpen ? "Ocultar menú" : "Mostrar menú"}
                    aria-label={isSidebarOpen ? "Cerrar menú lateral" : "Abrir menú lateral"}
                    aria-expanded={isSidebarOpen}
                >
                    <i className={`bi bi-list text-2xl transition-transform duration-300 ${isSidebarOpen ? 'rotate-0' : 'rotate-90'}`} aria-hidden="true"></i>
                </button>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
                <button 
                    className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-500/10 transition-all active:scale-95 border-0 cursor-pointer" 
                    style={{ color: 'var(--text-primary)' }}
                    onClick={toggleTheme}
                    title={isDarkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
                    aria-label={isDarkMode ? "Activar modo claro" : "Activar modo oscuro"}
                >
                    {isDarkMode ? (
                        <i className="bi bi-sun text-amber-400 text-lg" aria-hidden="true"></i>
                    ) : (
                        <i className="bi bi-moon-stars text-slate-800 text-lg" aria-hidden="true"></i>
                    )}
                </button>
                <AccessibilityMenu />
            </div>
        </header>
    );
}

export default TopBar;
