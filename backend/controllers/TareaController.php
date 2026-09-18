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
            'atencion'     => $_GET['atencion']     ?? $_GET['filtro_atencion'] ?? null,
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
            } elseif ($scope === 'otros' || $scope === 'por_otros_usuarios') {
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
        
        // Detectar si la petición viene como multipart/form-data o como JSON
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        $isMultipart = str_contains($contentType, 'multipart/form-data') || !empty($_FILES);
        $body = $isMultipart ? $_POST : $this->json();

        $errors = $this->validate($body, true);
        if ($errors) Response::error('Datos inválidos.', 422, $errors);

        // Si no se envía usuario_id, asignar al usuario actual
        if (empty($body['usuario_id'])) {
            $body['usuario_id'] = $auth['id'];
        }

        // Procesar imágenes si existen
        $files = $this->normalizeFiles($_FILES['imagenes'] ?? null);
        if (count($files) > 5) {
            Response::error('Límite excedido: Solo se permite subir un máximo de 5 imágenes por ticket.', 422);
        }

        try {
            $id = $this->model->create($body, (int)$auth['id']);
            
            $imagenesGuardadas = [];
            if (!empty($files)) {
                $imagenesGuardadas = $this->model->guardarImagenes($id, $files);
            }

            Response::success([
                'id'       => $id,
                'imagenes' => $imagenesGuardadas
            ], 'Tarea creada exitosamente.', 201);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 422);
        } catch (Throwable $e) {
            Response::error('Error interno al crear la tarea: ' . $e->getMessage(), 500);
        }
    }

    // POST /api/tareas/:id/imagenes
    public function uploadImagenes(array $params): void {
        $auth  = AuthMiddleware::require();
        $id    = (int)$params['id'];
        $tarea = $this->model->findById($id);

        if (!$tarea) Response::notFound('Tarea no encontrada.');

        // Solo el creador puede subir imágenes a su ticket
        if ((int)$tarea['usuario_id'] !== (int)$auth['id']) {
            Response::forbidden('Solo el creador del ticket puede subir imágenes.');
        }

        $files = $this->normalizeFiles($_FILES['imagenes'] ?? null);
        if (empty($files)) {
            Response::error('No se seleccionó ninguna imagen válida para subir.', 400);
        }

        try {
            $guardadas = $this->model->guardarImagenes($id, $files);
            Response::success($guardadas, 'Imágenes subidas correctamente.', 201);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 422);
        } catch (Throwable $e) {
            Response::error('Error al subir imágenes: ' . $e->getMessage(), 500);
        }
    }

    // DELETE /api/tareas/:id/imagenes/:imagenId
    public function deleteImagen(array $params): void {
        $auth     = AuthMiddleware::require();
        $id       = (int)$params['id'];
        $imagenId = (int)$params['imagenId'];
        $tarea    = $this->model->findById($id);

        if (!$tarea) Response::notFound('Tarea no encontrada.');

        // Solo el creador puede eliminar imágenes
        if ((int)$tarea['usuario_id'] !== (int)$auth['id']) {
            Response::forbidden('Solo el creador del ticket puede eliminar imágenes.');
        }

        try {
            $ok = $this->model->eliminarImagen($id, $imagenId);
            if (!$ok) {
                Response::notFound('Imagen no encontrada o no pertenece a esta tarea.');
            }
            Response::success(null, 'Imagen eliminada correctamente.');
        } catch (Throwable $e) {
            Response::error('Error al eliminar imagen: ' . $e->getMessage(), 500);
        }
    }

    // PUT /api/tareas/:id
    public function update(array $params): void {
        $auth  = AuthMiddleware::require();
        $id    = (int)$params['id'];
        $body  = $this->json();
        $tarea = $this->model->findById($id);

        if (!$tarea) Response::notFound('Tarea no encontrada.');

        $isOwner = ((int)$tarea['usuario_id'] === (int)$auth['id']);
        $isAdmin = ((int)$auth['rol_id'] === 1);

        // Campos del ticket
        $ticketContentFields = ['titulo', 'descripcion', 'prioridad_id'];
        $hasTicketContentChanges = false;
        foreach ($ticketContentFields as $field) {
            if (array_key_exists($field, $body)) {
                $hasTicketContentChanges = true;
                break;
            }
        }

        // Solo el creador puede modificar su ticket
        if ($hasTicketContentChanges && !$isOwner) {
            Response::forbidden('Solo el creador puede modificar este ticket.');
        }

        // Si es empleado, no puede modificar el estado de la tarea
        if (!$isAdmin && isset($body['estado_id']) && (int)$body['estado_id'] !== (int)$tarea['estado_id']) {
            Response::forbidden('Solo los administradores pueden cambiar el estado de las tareas.');
        }

        // Control de respuesta del administrador: solo rol admin (1) puede responder
        if (array_key_exists('respuesta_admin', $body)) {
            if (!$isAdmin) {
                Response::forbidden('Solo los administradores pueden registrar o modificar la respuesta oficial.');
            }
            $body['admin_id'] = (int)$auth['id'];
            $body['fecha_respuesta'] = date('Y-m-d H:i:s');
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
    private function normalizeFiles(?array $files): array {
        if (!$files || empty($files['name'])) {
            return [];
        }

        $normalized = [];
        if (is_array($files['name'])) {
            $count = count($files['name']);
            for ($i = 0; $i < $count; $i++) {
                if (($files['error'][$i] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
                    continue;
                }
                $normalized[] = [
                    'name'     => $files['name'][$i],
                    'type'     => $files['type'][$i] ?? '',
                    'tmp_name' => $files['tmp_name'][$i] ?? '',
                    'error'    => $files['error'][$i] ?? UPLOAD_ERR_OK,
                    'size'     => (int)($files['size'][$i] ?? 0),
                ];
            }
        } else {
            if (($files['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
                $normalized[] = [
                    'name'     => $files['name'],
                    'type'     => $files['type'] ?? '',
                    'tmp_name' => $files['tmp_name'] ?? '',
                    'error'    => $files['error'] ?? UPLOAD_ERR_OK,
                    'size'     => (int)($files['size'] ?? 0),
                ];
            }
        }

        return $normalized;
    }

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
