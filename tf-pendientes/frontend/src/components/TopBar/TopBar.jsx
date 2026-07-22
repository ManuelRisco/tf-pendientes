import { useState, useEffect } from "react";
import AccessibilityMenu from "../Accessibility/AccessibilityMenu";
import './TopBar.css';

function TopBar({ toggleSidebar, isSidebarOpen }) {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem("darkMode");
        // For the new layout, we might want to default to true as per design
        return saved !== null ? saved === "true" : true; 
    });

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
        localStorage.setItem("darkMode", isDarkMode);
    }, [isDarkMode]);

    return (
        <header className="topbar">
            <div className="d-flex align-items-center gap-3">
                <button 
                    className="icon-btn" 
                    onClick={toggleSidebar}
                    title={isSidebarOpen ? "Ocultar menú" : "Mostrar menú"}
                    aria-label={isSidebarOpen ? "Cerrar menú lateral" : "Abrir menú lateral"}
                    aria-expanded={isSidebarOpen}
                >
                    <i className="bi bi-list fs-4" aria-hidden="true"></i>
                </button>
            </div>
            
            <div className="topbar-actions">
                <button 
                    className="icon-btn" 
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    title={isDarkMode ? "Modo Claro" : "Modo Oscuro"}
                    aria-label={isDarkMode ? "Activar modo claro" : "Activar modo oscuro"}
                >
                    {isDarkMode ? <i className="bi bi-sun" aria-hidden="true"></i> : <i className="bi bi-moon" aria-hidden="true"></i>}
                </button>
                <AccessibilityMenu />
            </div>
        </header>
    );
}

export default TopBar;
