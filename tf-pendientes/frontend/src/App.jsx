import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Usuarios from "./pages/Usuarios";
import Equipos from "./pages/Equipos";
import NotFound from "./pages/NotFound";
import HolaMundo from "./pages/HolaMundo";
import GestionTareas from "./pages/GestionTareas/GestionTareas";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/equipos" element={<Equipos />} />
        <Route path="/hola-mundo" element={<HolaMundo />} />
        <Route path="/gestion-tareas" element={<GestionTareas />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;