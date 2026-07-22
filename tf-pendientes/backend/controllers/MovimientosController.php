<?php

class MovimientosController {
    private DashboardModel $model;

    public function __construct() {
        $this->model = new DashboardModel();
    }

    // GET /movimientos
    public function index(): void {
        // Solo los administradores pueden ver los movimientos
        AuthMiddleware::requireAdmin();

        $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
        $limit = isset($_GET['limit']) ? max(1, (int)$_GET['limit']) : 10;
        $offset = ($page - 1) * $limit;

        $items = $this->model->getMovimientos($limit, $offset);
        $total = $this->model->countMovimientos();
        $totalPages = ceil($total / $limit);

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
