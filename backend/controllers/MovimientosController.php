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

        $filters = [
            'modulo' => !empty($_GET['modulo']) ? trim((string)$_GET['modulo']) : null,
            'accion' => !empty($_GET['accion']) ? trim((string)$_GET['accion']) : null,
            'search' => !empty($_GET['search']) ? trim((string)$_GET['search']) : null,
        ];

        $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
        $limit = isset($_GET['limit']) ? max(1, (int)$_GET['limit']) : 10;
        $offset = ($page - 1) * $limit;

        $items = $this->model->getMovimientos($limit, $offset, $usuarioId, $excluirUsuarioId, $filters);
        $total = $this->model->countMovimientos($usuarioId, $excluirUsuarioId, $filters);
        $totalPages = max(1, ceil($total / $limit));

        $metrics = $this->model->getMovimientosMetrics($usuarioId, $excluirUsuarioId);
        $acciones = $this->model->getTiposAcciones();

        Response::success([
            'items' => $items,
            'meta' => [
                'total'      => $total,
                'page'       => $page,
                'limit'      => $limit,
                'totalPages' => $totalPages,
                'metrics'    => $metrics,
                'acciones'   => $acciones
            ]
        ]);
    }
}
