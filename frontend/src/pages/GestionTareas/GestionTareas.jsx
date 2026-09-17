import { Container, Row, Col } from 'react-bootstrap';
import { useGestionTareas } from './useGestionTareas';
import { useAuth } from '../../context/AuthContext';
import GestionTareasFilters from './components/GestionTareasFilters';
import GestionTareasTable from './components/GestionTareasTable';
import TaskFormModal from './components/TaskFormModal';
import TaskViewModal from './components/TaskViewModal';
import TaskLightboxModal from './components/TaskLightboxModal';

export default function GestionTareas() {
    const { user } = useAuth();
    const taskState = useGestionTareas();
    const isAdmin = Number(user?.rol_id) === 1;

    return (
        <div className="py-2 sm:py-4 animate-fade-in">
            <Container fluid className="px-2 sm:px-4">
                <Row className="justify-content-center">
                    <Col xs={12}>
                        {/* Cabecera */}
                        <div className="card-app p-4 sm:p-6 mb-4 sm:mb-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900/50 shrink-0">
                                            <i className="bi bi-clipboard-check text-lg"></i>
                                        </div>
                                        <h2 className="text-xl sm:text-2xl font-black tracking-tight m-0" style={{ color: 'var(--text-primary)' }}>
                                            Gestión de Tareas
                                        </h2>
                                    </div>
                                    <p className="text-xs sm:text-sm mt-1.5 mb-0" style={{ color: 'var(--text-secondary)' }}>
                                        {isAdmin
                                            ? 'Crea, supervisa y administra las tareas de todos los usuarios.'
                                            : 'Crea, consulta y gestiona el estado de tus tareas.'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => taskState.setShowModal(true)}
                                    className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95"
                                >
                                    <i className="bi bi-plus-lg"></i>
                                    <span>Nueva Tarea</span>
                                </button>
                            </div>
                        </div>

                        {/* Listado principal */}
                        <div className="card-app p-4 sm:p-6">
                            <GestionTareasFilters {...taskState} isAdmin={isAdmin} itemsCount={taskState.items.length} />
                            <GestionTareasTable {...taskState} isAdmin={isAdmin} user={user} />
                        </div>

                        {/* Modales */}
                        <TaskFormModal {...taskState} />
                        <TaskViewModal {...taskState} user={user} isAdmin={isAdmin} />
                        <TaskLightboxModal {...taskState} />
                    </Col>
                </Row>
            </Container>
        </div>
    );
}