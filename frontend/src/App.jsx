import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { lazy, Suspense } from "react";
import Layout from "./components/Layout/Layout";

// Lazy loading de páginas para mejorar el rendimiento (Code Splitting)
const Login = lazy(() => import("./pages/Login/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const Usuarios = lazy(() => import("./pages/Usuarios/Usuarios"));
const Equipos = lazy(() => import("./pages/Equipos/Equipos"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));
const GestionTareas = lazy(() => import("./pages/GestionTareas/GestionTareas"));
const Movimientos = lazy(() => import("./pages/Movimientos/Movimientos"));

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (!user) return <Navigate to="/login" />;

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (user) return <Navigate to="/dashboard" />;

  return children;
};

function App() {
  // Cuando React termina de renderizar la aplicación por primera vez, 
  // quitamos el candado (preload) para que las transiciones de Modo Oscuro vuelvan a funcionar con normalidad.
  useEffect(() => {
    document.body.classList.remove('preload');
  }, []);

  return (
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando aplicación...</div>}>
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/usuarios" element={<ProtectedRoute><Layout><Usuarios /></Layout></ProtectedRoute>} />
            <Route path="/equipos" element={<ProtectedRoute><Layout><Equipos /></Layout></ProtectedRoute>} />
            <Route path="/gestion-tareas" element={<ProtectedRoute><Layout><GestionTareas /></Layout></ProtectedRoute>} />
            <Route path="/movimientos" element={<ProtectedRoute><Layout><Movimientos /></Layout></ProtectedRoute>} />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
  );
}

export default App;