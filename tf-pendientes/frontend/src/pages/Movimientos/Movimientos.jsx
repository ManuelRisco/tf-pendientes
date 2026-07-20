import { useEffect, useState, useMemo } from "react";
import { Form, InputGroup } from "react-bootstrap";
import Navbar from "../../components/Navbar/Navbar";
import api from "../../lib/axios";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

function Movimientos() {
    const { user } = useAuth();
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filtroUsuario, setFiltroUsuario] = useState('');
    const [filtroAccion, setFiltroAccion] = useState('');
    const [filtroModulo, setFiltroModulo] = useState('');

    const usuariosUnicos = useMemo(() => {
        const users = movimientos.map(m => m.email).filter(Boolean);
        return [...new Set(users)];
    }, [movimientos]);

    const accionesUnicas = useMemo(() => {
        const actions = movimientos.map(m => m.tipo_accion).filter(Boolean);
        return [...new Set(actions)];
    }, [movimientos]);

    const modulosUnicos = useMemo(() => {
        const mods = movimientos.map(m => m.modulo).filter(Boolean);
        return [...new Set(mods)];
    }, [movimientos]);

    const movimientosFiltrados = useMemo(() => {
        return movimientos.filter(mov => {
            const matchUsuario = filtroUsuario === '' || mov.email === filtroUsuario;
            const matchAccion = filtroAccion === '' || mov.tipo_accion === filtroAccion;
            const matchModulo = filtroModulo === '' || mov.modulo === filtroModulo;
            return matchUsuario && matchAccion && matchModulo;
        });
    }, [movimientos, filtroUsuario, filtroAccion, filtroModulo]);

    // Redirigir si no es administrador
    if (user && Number(user.rol_id) !== 1) {
        return <Navigate to="/dashboard" replace />;
    }

    useEffect(() => {
        const fetchMovimientos = async () => {
            try {
                const res = await api.get('/movimientos');
                setMovimientos(res.data.data.movimientos || []);
            } catch (error) {
                console.error("Error fetching movimientos", error);
            } finally {
                setLoading(false);
            }
        };
        
        if (user && Number(user.rol_id) === 1) {
            fetchMovimientos();
        }
    }, [user]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando bitácora...</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="fw-bold text-dark m-0">Movimientos del Sistema</h2>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 border-b pb-3 gap-3" style={{ borderColor: 'var(--border-color)' }}>
                            <h3 className="text-xl font-bold text-slate-900 m-0">
                                <i className="bi bi-clock-history me-2 text-primary"></i> Historial de Acciones
                            </h3>

                            {/* FILTROS */}
                            <div className="d-flex flex-wrap gap-3">
                                <div className="d-flex align-items-center gap-2 bg-light px-3 py-1 rounded-pill shadow-sm" style={{cursor: 'pointer'}} onClick={(e) => e.currentTarget.querySelector('select').focus()}>
                                    <i className="bi bi-person-circle text-secondary"></i>
                                    <Form.Select
                                        size="sm"
                                        value={filtroUsuario}
                                        onChange={(e) => setFiltroUsuario(e.target.value)}
                                        className="border-0 bg-transparent text-secondary shadow-none form-select-transparent w-auto cursor-pointer pe-4"
                                        style={{ outline: 'none', appearance: 'none', backgroundImage: 'none' }}
                                    >
                                        <option value="">Todos los Usuarios</option>
                                        {usuariosUnicos.map(u => (
                                            <option key={u} value={u}>{u}</option>
                                        ))}
                                    </Form.Select>
                                    <i className="bi bi-chevron-down text-secondary" style={{fontSize: '0.75rem'}}></i>
                                </div>

                                <div className="d-flex align-items-center gap-2 bg-light px-3 py-1 rounded-pill shadow-sm" style={{cursor: 'pointer'}} onClick={(e) => e.currentTarget.querySelector('select').focus()}>
                                    <i className="bi bi-activity text-secondary"></i>
                                    <Form.Select
                                        size="sm"
                                        value={filtroAccion}
                                        onChange={(e) => setFiltroAccion(e.target.value)}
                                        className="border-0 bg-transparent text-secondary shadow-none form-select-transparent w-auto cursor-pointer pe-4"
                                        style={{ outline: 'none', appearance: 'none', backgroundImage: 'none' }}
                                    >
                                        <option value="">Todas las Acciones</option>
                                        {accionesUnicas.map(a => (
                                            <option key={a} value={a}>{a}</option>
                                        ))}
                                    </Form.Select>
                                    <i className="bi bi-chevron-down text-secondary" style={{fontSize: '0.75rem'}}></i>
                                </div>

                                <div className="d-flex align-items-center gap-2 bg-light px-3 py-1 rounded-pill shadow-sm" style={{cursor: 'pointer'}} onClick={(e) => e.currentTarget.querySelector('select').focus()}>
                                    <i className="bi bi-box text-secondary"></i>
                                    <Form.Select
                                        size="sm"
                                        value={filtroModulo}
                                        onChange={(e) => setFiltroModulo(e.target.value)}
                                        className="border-0 bg-transparent text-secondary shadow-none form-select-transparent w-auto cursor-pointer pe-4"
                                        style={{ outline: 'none', appearance: 'none', backgroundImage: 'none' }}
                                    >
                                        <option value="">Todos los Módulos</option>
                                        {modulosUnicos.map(m => (
                                            <option key={m} value={m} className="capitalize">{m}</option>
                                        ))}
                                    </Form.Select>
                                    <i className="bi bi-chevron-down text-secondary" style={{fontSize: '0.75rem'}}></i>
                                </div>
                            </div>
                        </div>
                        
                        {movimientosFiltrados.length === 0 ? (
                            <p className="text-slate-500 text-center py-5 my-4 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                                No se encontraron movimientos que coincidan con los filtros.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse table-custom">
                                    <thead>
                                        <tr>
                                            <th className="py-3 px-4 bg-slate-50 border-b border-slate-200 font-semibold text-sm text-slate-700">Usuario</th>
                                            <th className="py-3 px-4 bg-slate-50 border-b border-slate-200 font-semibold text-sm text-slate-700">Acción</th>
                                            <th className="py-3 px-4 bg-slate-50 border-b border-slate-200 font-semibold text-sm text-slate-700">Módulo</th>
                                            <th className="py-3 px-4 bg-slate-50 border-b border-slate-200 font-semibold text-sm text-slate-700">ID Registro</th>
                                            <th className="py-3 px-4 bg-slate-50 border-b border-slate-200 font-semibold text-sm text-slate-700">Fecha</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100" style={{ borderColor: 'var(--border-color)' }}>
                                        {movimientosFiltrados.map(mov => {
                                            let actionColor = 'bg-slate-100 text-slate-700';
                                            switch(mov.tipo_accion) {
                                                case 'CREAR': actionColor = 'bg-green-100 text-green-700'; break;
                                                case 'ACTUALIZAR': actionColor = 'bg-blue-100 text-blue-700'; break;
                                                case 'ELIMINAR_LOGICO': actionColor = 'bg-red-100 text-red-700'; break;
                                                case 'RESTAURAR': actionColor = 'bg-yellow-100 text-yellow-700'; break;
                                            }

                                            return (
                                                <tr key={mov.id} className="hover:bg-slate-50 transition-colors" style={{ '--tw-bg-opacity': 1, backgroundColor: 'transparent' }}>
                                                    <td className="py-3 px-4">
                                                        <div className="font-medium text-slate-900">
                                                            {mov.persona_nombre} {mov.persona_apellido}
                                                        </div>
                                                        <div className="text-xs text-slate-500">{mov.email}</div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${actionColor}`}>
                                                            {mov.tipo_accion}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-slate-600 capitalize">
                                                        {mov.modulo}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-slate-600 font-mono">
                                                        #{mov.registro_id}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-slate-500">
                                                        {new Date(mov.created_at).toLocaleString('es-ES', {
                                                            day: '2-digit', month: '2-digit', year: 'numeric',
                                                            hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Movimientos;
