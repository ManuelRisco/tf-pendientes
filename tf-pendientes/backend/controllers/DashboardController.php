<?php

class DashboardController {
    private DashboardModel $model;

    public function __construct() {
        $this->model = new DashboardModel();
    }

    // GET /dashboard
    public function index(): void {
        $auth = AuthMiddleware::require();

        $esAdmin   = (int)$auth['rol_id'] === 1;

        // Todos ven las estadísticas de todas las tareas
        $usuarioId = null;

        $stats = $this->model->getStats($usuarioId);

        $data = ['estadisticas' => $stats];

        // Solo el admin ve el total de usuarios y todos los movimientos detallados
        // Por ahora lo retornaremos para que se vea en el dashboard.
        $data['total_usuarios'] = $this->model->getTotalUsuarios();
        $data['actividad_reciente'] = $this->model->getMovimientos(3);

        Response::success($data);
    }
}
