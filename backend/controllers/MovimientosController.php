<?php

class MovimientosController {
    private DashboardModel $model;

    public function __construct() {
        $this->model = new DashboardModel();
    }

    // GET /movimientos
    public function index(): void {
        $auth = AuthMiddleware::require();
        $isEmpleado = ((int)$auth['rol_id'] !== 1);

        $usuarioId = null;
        $excluirUsuarioId = null;

        if ($isEmpleado) {
            // Empleado solo ve sus propios movimientos
            $usuarioId = (int)$auth['id'];
        } else {
            // Administrador: soporte de scopes ('mis_movimientos', 'otros', 'todos') o usuario_id
            $scope = $_GET['scope'] ?? 'todos';
            if ($scope === 'mis_movimientos' || $scope === 'mis_tareas') {
                $usuarioId = (int)$auth['id'];
            } elseif ($scope === 'otros') {
                $excluirUsuarioId = (int)$auth['id'];
            } elseif (!empty($_GET['usuario_id']) && is_numeric($_GET['usuario_id'])) {
                $usuarioId = (int)$_GET['usuario_id'];
            }
        }

        $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
        $limit = isset($_GET['limit']) ? max(1, (int)$_GET['limit']) : 10;
        $offset = ($page - 1) * $limit;

        $items = $this->model->getMovimientos($limit, $offset, $usuarioId, $excluirUsuarioId);
        $total = $this->model->countMovimientos($usuarioId, $excluirUsuarioId);
        $totalPages = max(1, ceil($total / $limit));

        Response::success([
            'items' => $items,
            'meta' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'totalPages' => $totalPages
            ]
        ]);
    }
}
