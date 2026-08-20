<?php

class DashboardController {
    private DashboardModel $model;

    public function __construct() {
        $this->model = new DashboardModel();
    }

    // GET /dashboard[?scope=&usuario_id=]
    public function index(): void {
        $auth = AuthMiddleware::require();
        $isEmpleado = ((int)$auth['rol_id'] !== 1);

        $usuarioId = null;
        $excluirUsuarioId = null;

        if ($isEmpleado) {
            // Empleado solo ve las estadísticas de sus propias tareas
            $usuarioId = (int)$auth['id'];
        } else {
            // Administrador: soporte de scopes ('mis_tareas', 'otros', 'todos') o usuario específico
            $scope = $_GET['scope'] ?? 'todos';
            if ($scope === 'mis_tareas') {
                $usuarioId = (int)$auth['id'];
            } elseif ($scope === 'otros') {
                $excluirUsuarioId = (int)$auth['id'];
            } elseif (!empty($_GET['usuario_id']) && is_numeric($_GET['usuario_id'])) {
                $usuarioId = (int)$_GET['usuario_id'];
            }
        }

        $stats = $this->model->getStats($usuarioId, $excluirUsuarioId);
        $data = ['estadisticas' => $stats];

        if (!$isEmpleado) {
            $data['total_usuarios'] = $this->model->getTotalUsuarios();
            
            // Si el admin está filtrando por un usuario específico, mostrar actividad de ese usuario
            if ($usuarioId !== null) {
                $data['actividad_reciente'] = $this->model->getMovimientosPorUsuario($usuarioId, 5);
            } else {
                $data['actividad_reciente'] = $this->model->getMovimientos(5);
            }
        } else {
            // Empleado: solo su actividad reciente
            $data['actividad_reciente'] = $this->model->getMovimientosPorUsuario((int)$auth['id'], 5);
        }

        Response::success($data);
    }
}
