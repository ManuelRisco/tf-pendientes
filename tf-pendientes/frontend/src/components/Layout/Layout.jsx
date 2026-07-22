import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import TopBar from '../TopBar/TopBar';
import './Layout.css';

function Layout({ children }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const location = useLocation();

    // Actualizar estado si la ventana cambia de tamaño
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (mobile) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Cerrar el sidebar en móviles cuando cambia la ruta (navegación)
    useEffect(() => {
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    }, [location.pathname]); // Dependencia: cada vez que cambie la URL

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className={`layout-wrapper ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
            {/* Mobile Overlay */}
            {isSidebarOpen && isMobile && (
                <div 
                    className="mobile-sidebar-overlay" 
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
            
            <Sidebar isOpen={isSidebarOpen} />
            <main className="main-content">
                <TopBar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
                <div className="page-content">
                    {children}
                </div>
            </main>
        </div>
    );
}


export default Layout;
