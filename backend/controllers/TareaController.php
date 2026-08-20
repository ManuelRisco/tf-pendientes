<?php

class TareaController {
    private TareaModel $model;

    public function __construct() {
        $this->model = new TareaModel();
    }

    // GET /api/tareas[?estado_id=&prioridad_id=&search=&scope=&usuario_id=]
    public function index(): void {
        $auth    = AuthMiddleware::require();
        $filters = [
            'estado_id'    => $_GET['estado_id']    ?? null,
            'prioridad_id' => $_GET['prioridad_id'] ?? null,
            'search'       => $_GET['search']       ?? null,
        ];

        // Control de visibilidad según rol
        $isEmpleado = ((int)$auth['rol_id'] !== 1);
        if ($isEmpleado) {
            // Empleado solo puede ver sus propias tareas
            $filters['usuario_id'] = (int)$auth['id'];
        } else {
            // Administrador: soporte de scopes ('mis_tareas', 'otros', 'todos') o usuario específico
            $scope = $_GET['scope'] ?? 'todos';
            if ($scope === 'mis_tareas') {
                $filters['usuario_id'] = (int)$auth['id'];
            } elseif ($scope === 'otros') {
                $filters['excluir_usuario_id'] = (int)$auth['id'];
            } elseif (!empty($_GET['usuario_id']) && is_numeric($_GET['usuario_id'])) {
                $filters['usuario_id'] = (int)$_GET['usuario_id'];
            }
        }

        $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
        $limit = isset($_GET['limit']) ? max(1, (int)$_GET['limit']) : 10;
        $offset = ($page - 1) * $limit;

        $items = $this->model->getAll($filters, null, $limit, $offset);
        $total = $this->model->countAll($filters, null);
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

    // GET /api/tareas/:id
    public function show(array $params): void {
        $auth  = AuthMiddleware::require();
        $tarea = $this->model->findById((int)$params['id']);

        if (!$tarea) Response::notFound('Tarea no encontrada.');

        // Si es empleado, solo puede ver sus propias tareas
        if ((int)$auth['rol_id'] !== 1 && (int)$tarea['usuario_id'] !== (int)$auth['id']) {
            Response::forbidden('No tienes permisos para ver esta tarea.');
        }

        Response::success($tarea);
    }

    // POST /api/tareas
    public function store(): void {
        $auth = AuthMiddleware::require();
        $body = $this->json();

        $errors = $this->validate($body, true);
        if ($errors) Response::error('Datos inválidos.', 422, $errors);

        // Si no se envía usuario_id, asignar al usuario actual
        if (empty($body['usuario_id'])) {
            $body['usuario_id'] = $auth['id'];
        }

        $id = $this->model->create($body, (int)$auth['id']);
        Response::success(['id' => $id], 'Tarea creada.', 201);
    }

    // PUT /api/tareas/:id
    public function update(array $params): void {
        $auth  = AuthMiddleware::require();
        $id    = (int)$params['id'];
        $body  = $this->json();
        $tarea = $this->model->findById($id);

        if (!$tarea) Response::notFound('Tarea no encontrada.');

        // Si es empleado, solo puede actualizar sus propias tareas
        if ((int)$auth['rol_id'] !== 1 && (int)$tarea['usuario_id'] !== (int)$auth['id']) {
            Response::forbidden('No tienes permisos para modificar esta tarea.');
        }

        $errors = $this->validate($body, false);
        if ($errors) Response::error('Datos inválidos.', 422, $errors);

        $ok = $this->model->update($id, $body, (int)$auth['id']);
        if (!$ok) Response::error('Sin cambios detectados.', 400);

        Response::success(null, 'Tarea actualizada.');
    }

    // DELETE /api/tareas/:id
    public function destroy(array $params): void {
        $auth  = AuthMiddleware::require();
        $id    = (int)$params['id'];
        $tarea = $this->model->findById($id);

        if (!$tarea) Response::notFound('Tarea no encontrada.');

        // Solo los administradores pueden eliminar tareas
        if ((int)$auth['rol_id'] !== 1) {
            Response::forbidden('No tienes permisos para eliminar tareas.');
        }

        $ok = $this->model->softDelete($id, (int)$auth['id']);
        if (!$ok) Response::error('No se pudo eliminar la tarea.', 400);

        Response::success(null, 'Tarea eliminada.');
    }

    // PATCH /api/tareas/:id/restaurar
    public function restore(array $params): void {
        $auth = AuthMiddleware::requireAdmin();
        $id   = (int)$params['id'];

        $ok = $this->model->restore($id, (int)$auth['id']);
        if (!$ok) Response::error('Tarea no encontrada o ya activa.', 400);

        Response::success(null, 'Tarea restaurada.');
    }

    // -----------------------------------------------------------------------
    private function json(): array {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }

    private function validate(array $data, bool $isCreate): array {
        $errors = [];
        if ($isCreate) {
            if (empty($data['titulo']))       $errors['titulo']       = 'Requerido.';
            if (empty($data['prioridad_id'])) $errors['prioridad_id'] = 'Requerido.';
        }
        if (isset($data['estado_id']) && !in_array((int)$data['estado_id'], [1,2,3,4])) {
            $errors['estado_id'] = 'Estado inválido.';
        }
        return $errors;
    }
}
