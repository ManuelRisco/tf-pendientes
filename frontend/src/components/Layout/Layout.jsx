import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import TopBar from '../TopBar/TopBar';
import ProfileModal from '../Profile/ProfileModal';

function Layout({ children }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (window.innerWidth < 768) return false;
        const saved = localStorage.getItem('tf_sidebar_open');
        return saved !== null ? saved === 'true' : true;
    });
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setIsSidebarOpen(false);
            } else {
                const saved = localStorage.getItem('tf_sidebar_open');
                setIsSidebarOpen(saved !== null ? saved === 'true' : true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    }, [location.pathname, isMobile]);

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => {
            const next = !prev;
            if (!isMobile) {
                localStorage.setItem('tf_sidebar_open', String(next));
            }
            return next;
        });
    };

    return (
        <div className="flex h-screen w-full overflow-hidden transition-colors duration-300" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            {/* Mobile Backdrop */}
            {isSidebarOpen && isMobile && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                    aria-hidden="true"
                ></div>
            )}
            
            {/* Sidebar Fijo Independiente */}
            <Sidebar isOpen={isSidebarOpen} onOpenProfile={() => setIsProfileModalOpen(true)} />

            {/* Contenedor Principal Derecho con Scroll Independiente */}
            <div className={`flex-1 flex flex-col h-screen overflow-y-auto min-w-0 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
                <TopBar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
                <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-full">
                    {children}
                </main>
            </div>

            {/* Modal para Editar Perfil del Usuario */}
            <ProfileModal show={isProfileModalOpen} onHide={() => setIsProfileModalOpen(false)} />
        </div>
    );
}

export default Layout;
