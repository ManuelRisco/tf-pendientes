import { Container, Row, Col } from 'react-bootstrap';
import { useUsuarios } from './useUsuarios';
import UsuariosFilters from './components/UsuariosFilters';
import UsuariosTable from './components/UsuariosTable';
import UsuariosModal from './components/UsuariosModal';

export default function Usuarios() {
    const userHook = useUsuarios();
    const { user, usuarios, totalCount, handleCreateClick } = userHook;
    const isAdmin = Number(user?.rol_id) === 1;

    return (
        <div className="py-1 sm:py-4 px-0 sm:px-2 max-w-7xl mx-auto">
            <Container fluid className="p-0">
                <Row className="justify-content-center m-0">
                    <Col xs={12} className="p-0">
                        <div className="card-app p-3.5 sm:p-6 mb-5 sm:mb-6">
                            {/* Encabezado */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
                                <div>
                                    <h4 className="text-xl sm:text-2xl font-bold tracking-tight m-0" style={{ color: 'var(--text-primary)' }}>
                                        Usuarios
                                    </h4>
                                    <p className="text-xs sm:text-sm mt-1 mb-0" style={{ color: 'var(--text-secondary)' }}>
                                        Administra los usuarios, roles y accesos del sistema.
                                    </p>
                                </div>
                                {isAdmin && (
                                    <button
                                        onClick={handleCreateClick}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 transition-all active:scale-95 cursor-pointer shrink-0"
                                    >
                                        <i className="bi bi-person-plus-fill"></i>
                                        <span>Nuevo Usuario</span>
                                    </button>
                                )}
                            </div>

                            <UsuariosFilters
                                {...userHook}
                                totalFiltrados={usuarios.length}
                                totalCount={totalCount}
                            />

                            <UsuariosTable {...userHook} />
                        </div>
                    </Col>
                </Row>
            </Container>

            <UsuariosModal {...userHook} />
        </div>
    );
}
