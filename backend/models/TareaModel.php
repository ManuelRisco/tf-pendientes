<?php

use Illuminate\Database\Capsule\Manager as Capsule;

class TareaModel {

    // ------------------------------------------------------------------
    // Listar tareas con filtros opcionales
    // Admins ven todas; Empleados solo las suyas
    // ------------------------------------------------------------------
    public function getAll(array $filters = [], ?int $usuarioId = null, int $limit = 10, int $offset = 0): array {
        $query = Tarea::with(['estado', 'prioridad', 'usuario.persona', 'usuario.rol', 'imagenes', 'admin.persona', 'respuestas.usuario.persona'])
            ->orderBy('created_at', 'desc');

        if ($usuarioId !== null) {
            $query->where('usuario_id', $usuarioId);
        }

        if (!empty($filters['usuario_id'])) {
            $query->where('usuario_id', (int)$filters['usuario_id']);
        }

        if (!empty($filters['excluir_usuario_id'])) {
            $query->where('usuario_id', '!=', (int)$filters['excluir_usuario_id']);
        }

        if (!empty($filters['estado_id'])) {
            $query->where('estado_id', (int)$filters['estado_id']);
        }

        if (!empty($filters['prioridad_id'])) {
            $query->where('prioridad_id', (int)$filters['prioridad_id']);
        }

        if (!empty($filters['atencion'])) {
            if ($filters['atencion'] === 'atendidos') {
                $query->where(function($q) {
                    $q->where(function($sq) {
                        $sq->whereNotNull('respuesta_admin')
                           ->whereRaw("TRIM(respuesta_admin) != ''");
                    })->orWhereHas('respuestas');
                });
            } elseif ($filters['atencion'] === 'por_atender') {
                $query->where(function($q) {
                    $q->where(function($sq) {
                        $sq->whereNull('respuesta_admin')
                           ->orWhereRaw("TRIM(respuesta_admin) = ''");
                    })->whereDoesntHave('respuestas');
                });
            }
        }

        if (!empty($filters['search'])) {
            $rawSearch = trim($filters['search']);
            $cleanId = preg_replace('/^[#\s]*(?:id\s*[:\s]*)?/i', '', $rawSearch);
            $cleanId = trim($cleanId);
            $isIdSearch = is_numeric($cleanId) && (int)$cleanId > 0;

            $search = '%' . $rawSearch . '%';
            $cleanSearch = '%' . $cleanId . '%';

            $query->where(function($q) use ($search, $cleanSearch, $cleanId, $isIdSearch) {
                if ($isIdSearch) {
                    $q->where('id', (int)$cleanId);
                } else {
                    $q->where('titulo', 'LIKE', $search)
                      ->orWhere('descripcion', 'LIKE', $search);
                }

                if ($isIdSearch) {
                    $q->orWhere('titulo', 'LIKE', $cleanSearch)
                      ->orWhere('descripcion', 'LIKE', $cleanSearch);
                }

                $q->orWhereHas('usuario', function($qu) use ($search) {
                    $qu->where('email', 'LIKE', $search)
                       ->orWhereHas('persona', function($qp) use ($search) {
                           $qp->where('nombre', 'LIKE', $search)
                              ->orWhere('apellido', 'LIKE', $search);
                       });
                });
            });
        }

        $tareas = $query->skip($offset)->take($limit)->get();

        $result = [];
        foreach ($tareas as $t) {
            $result[] = [
                'id'             => $t->id,
                'titulo'         => $t->titulo,
                'descripcion'    => $t->descripcion,
                'estado_id'      => $t->estado_id,
                'estado'         => $t->estado ? $t->estado->nombre : null,
                'prioridad_id'   => $t->prioridad_id,
                'prioridad'      => $t->prioridad ? $t->prioridad->nombre : null,
                'usuario_id'     => $t->usuario_id,
                'usuario_nombre' => $t->usuario && $t->usuario->persona ? $t->usuario->persona->nombre . ' ' . $t->usuario->persona->apellido : ($t->usuario ? $t->usuario->email : 'Usuario'),
                'usuario_email'  => $t->usuario ? $t->usuario->email : null,
                'usuario_rol'     => $t->usuario && $t->usuario->rol ? $t->usuario->rol->nombre : null,
                'respuesta_admin' => $t->respuesta_admin,
                'admin_id'        => $t->admin_id,
                'admin_nombre'    => $t->admin && $t->admin->persona ? $t->admin->persona->nombre . ' ' . $t->admin->persona->apellido : ($t->admin ? $t->admin->email : null),
                'fecha_respuesta' => $t->fecha_respuesta,
                'respuestas'      => self::formatRespuestas($t->respuestas),
                'total_respuestas'=> $t->respuestas ? $t->respuestas->count() : 0,
                'imagenes'        => self::formatImagenes($t->imagenes),
                'total_imagenes'  => $t->imagenes ? $t->imagenes->count() : 0,
                'created_at'      => $t->created_at,
                'updated_at'      => $t->updated_at,
            ];
        }

        return $result;
    }

    public function countAll(array $filters = [], ?int $usuarioId = null): int {
        $query = Tarea::query();

        if ($usuarioId !== null) {
            $query->where('usuario_id', $usuarioId);
        }

        if (!empty($filters['usuario_id'])) {
            $query->where('usuario_id', (int)$filters['usuario_id']);
        }

        if (!empty($filters['excluir_usuario_id'])) {
            $query->where('usuario_id', '!=', (int)$filters['excluir_usuario_id']);
        }

        if (!empty($filters['estado_id'])) {
            $query->where('estado_id', (int)$filters['estado_id']);
        }

        if (!empty($filters['prioridad_id'])) {
            $query->where('prioridad_id', (int)$filters['prioridad_id']);
        }

        if (!empty($filters['atencion'])) {
            if ($filters['atencion'] === 'atendidos') {
                $query->where(function($q) {
                    $q->where(function($sq) {
                        $sq->whereNotNull('respuesta_admin')
                           ->whereRaw("TRIM(respuesta_admin) != ''");
                    })->orWhereHas('respuestas');
                });
            } elseif ($filters['atencion'] === 'por_atender') {
                $query->where(function($q) {
                    $q->where(function($sq) {
                        $sq->whereNull('respuesta_admin')
                           ->orWhereRaw("TRIM(respuesta_admin) = ''");
                    })->whereDoesntHave('respuestas');
                });
            }
        }

        if (!empty($filters['search'])) {
            $rawSearch = trim($filters['search']);
            $cleanId = preg_replace('/^[#\s]*(?:id\s*[:\s]*)?/i', '', $rawSearch);
            $cleanId = trim($cleanId);
            $isIdSearch = is_numeric($cleanId) && (int)$cleanId > 0;

            $search = '%' . $rawSearch . '%';
            $cleanSearch = '%' . $cleanId . '%';

            $query->where(function($q) use ($search, $cleanSearch, $cleanId, $isIdSearch) {
                if ($isIdSearch) {
                    $q->where('id', (int)$cleanId);
                } else {
                    $q->where('titulo', 'LIKE', $search)
                      ->orWhere('descripcion', 'LIKE', $search);
                }

                if ($isIdSearch) {
                    $q->orWhere('titulo', 'LIKE', $cleanSearch)
                      ->orWhere('descripcion', 'LIKE', $cleanSearch);
                }

                $q->orWhereHas('usuario', function($qu) use ($search) {
                    $qu->where('email', 'LIKE', $search)
                       ->orWhereHas('persona', function($qp) use ($search) {
                           $qp->where('nombre', 'LIKE', $search)
                              ->orWhere('apellido', 'LIKE', $search);
                       });
                });
            });
        }

        return $query->count();
    }

    // ------------------------------------------------------------------
    public function findById(int $id): ?array {
        $t = Tarea::with(['estado', 'prioridad', 'usuario.persona', 'usuario.rol', 'imagenes', 'admin.persona', 'respuestas.usuario.persona'])->find($id);

        if (!$t) return null;

        return [
            'id'              => $t->id,
            'titulo'          => $t->titulo,
            'descripcion'     => $t->descripcion,
            'respuesta_admin' => $t->respuesta_admin,
            'admin_id'        => $t->admin_id,
            'admin_nombre'    => $t->admin && $t->admin->persona ? $t->admin->persona->nombre . ' ' . $t->admin->persona->apellido : ($t->admin ? $t->admin->email : null),
            'fecha_respuesta' => $t->fecha_respuesta,
            'respuestas'      => self::formatRespuestas($t->respuestas),
            'total_respuestas'=> $t->respuestas ? $t->respuestas->count() : 0,
            'estado_id'       => $t->estado_id,
            'estado'          => $t->estado ? $t->estado->nombre : null,
            'prioridad_id'    => $t->prioridad_id,
            'prioridad'       => $t->prioridad ? $t->prioridad->nombre : null,
            'usuario_id'      => $t->usuario_id,
            'usuario_nombre'  => $t->usuario && $t->usuario->persona ? $t->usuario->persona->nombre . ' ' . $t->usuario->persona->apellido : ($t->usuario ? $t->usuario->email : 'Usuario'),
            'usuario_email'   => $t->usuario ? $t->usuario->email : null,
            'usuario_rol'     => $t->usuario && $t->usuario->rol ? $t->usuario->rol->nombre : null,
            'imagenes'        => self::formatImagenes($t->imagenes),
            'total_imagenes'  => $t->imagenes ? $t->imagenes->count() : 0,
            'created_at'      => $t->created_at,
            'updated_at'      => $t->updated_at,
        ];
    }

    // ------------------------------------------------------------------
    public static function formatRespuestas($respuestas): array {
        if (!$respuestas) return [];
        $res = [];
        foreach ($respuestas as $r) {
            $res[] = [
                'id'           => (int)$r->id,
                'tarea_id'     => (int)$r->tarea_id,
                'admin_id'     => (int)$r->admin_id,
                'admin_nombre' => $r->usuario && $r->usuario->persona ? $r->usuario->persona->nombre . ' ' . $r->usuario->persona->apellido : ($r->usuario ? $r->usuario->email : 'Soporte Técnico'),
                'mensaje'      => $r->mensaje,
                'created_at'   => $r->created_at ? (string)$r->created_at : null,
            ];
        }
        return $res;
    }

    // ------------------------------------------------------------------
    public function create(array $data, int $creadorId): int {
        Capsule::statement("SET @usuario_id_app = ?", [$creadorId]);

        $tarea = Tarea::create([
            'titulo'       => $data['titulo'],
            'descripcion'  => $data['descripcion'] ?? null,
            'estado_id'    => $data['estado_id']   ?? 1,
            'prioridad_id' => (int)$data['prioridad_id'],
            'usuario_id'   => (int)$data['usuario_id'],
        ]);

        return $tarea->id;
    }

    // ------------------------------------------------------------------
    public function update(int $id, array $data, int $editorId): bool {
        Capsule::statement("SET @usuario_id_app = ?", [$editorId]);

        $tarea = Tarea::find($id);
        if (!$tarea) return false;

        $updateData = [];
        $allowed = ['titulo', 'descripcion', 'estado_id', 'prioridad_id', 'usuario_id', 'respuesta_admin', 'admin_id', 'fecha_respuesta'];
        
        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $updateData[$field] = $data[$field];
            }
        }

        if (empty($updateData)) return false;

        $ok = $tarea->update($updateData);

        // Si se envió una nueva respuesta, registrarla en el historial de intervenciones
        if (array_key_exists('respuesta_admin', $data) && trim((string)$data['respuesta_admin']) !== '') {
            $adminId = !empty($data['admin_id']) ? (int)$data['admin_id'] : $editorId;
            TareaRespuesta::create([
                'tarea_id'   => $id,
                'admin_id'   => $adminId,
                'mensaje'    => trim((string)$data['respuesta_admin']),
                'created_at' => date('Y-m-d H:i:s')
            ]);
        }

        return $ok;
    }

    // ------------------------------------------------------------------
    public function softDelete(int $id, int $editorId): bool {
        Capsule::statement("SET @usuario_id_app = ?", [$editorId]);

        $tarea = Tarea::find($id);
        if ($tarea) {
            return $tarea->delete();
        }
        return false;
    }

    // ------------------------------------------------------------------
    public function countImagenes(int $tareaId): int {
        return TareaImagen::where('tarea_id', $tareaId)->count();
    }

    // ------------------------------------------------------------------
    public static function buildImageUrl(string $ruta): string {
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        
        $scriptName = str_replace('\\', '/', $_SERVER['SCRIPT_NAME'] ?? '');
        if (preg_match('#(/[^/]+/backend)#', $scriptName, $m)) {
            $baseDir = $m[1];
        } else {
            $baseDir = '/tf-pendientes/backend';
        }
        $baseDir = rtrim($baseDir, '/');
        return $protocol . '://' . $host . $baseDir . '/' . ltrim($ruta, '/');
    }

    // ------------------------------------------------------------------
    public static function formatImagenes($imagenes): array {
        if (!$imagenes) return [];
        $res = [];
        foreach ($imagenes as $img) {
            $res[] = [
                'id'              => (int)$img->id,
                'tarea_id'        => (int)$img->tarea_id,
                'nombre_archivo'  => $img->nombre_archivo,
                'nombre_original' => $img->nombre_original,
                'ruta'            => $img->ruta,
                'url'             => self::buildImageUrl($img->ruta),
                'mime_type'       => $img->mime_type,
                'peso_bytes'      => (int)$img->peso_bytes,
                'created_at'      => $img->created_at ? (string)$img->created_at : null,
            ];
        }
        return $res;
    }

    // ------------------------------------------------------------------
    // Guardar imágenes para una tarea con control estricto de excepciones
    // Máximo 5 imágenes por ticket
    // ------------------------------------------------------------------
    public function guardarImagenes(int $tareaId, array $archivos): array {
        if (empty($archivos)) return [];

        $tarea = Tarea::find($tareaId);
        if (!$tarea) {
            throw new InvalidArgumentException("La tarea #{$tareaId} no existe.");
        }

        $currentCount = $this->countImagenes($tareaId);
        $incomingCount = count($archivos);

        if (($currentCount + $incomingCount) > 5) {
            $disponibles = max(0, 5 - $currentCount);
            throw new InvalidArgumentException("Límite excedido: Un ticket permite un máximo de 5 imágenes. Actualmente tiene {$currentCount} y solo puede subir {$disponibles} más.");
        }

        $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        $maxSizeBytes = 5 * 1024 * 1024; // 5MB

        $targetDir = dirname(__DIR__) . '/uploads/tickets/';
        if (!is_dir($targetDir)) {
            if (!mkdir($targetDir, 0755, true) && !is_dir($targetDir)) {
                throw new RuntimeException("No se pudo crear la carpeta de almacenamiento para imágenes.");
            }
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $savedModels = [];
        $uploadedFilesOnDisk = [];

        try {
            foreach ($archivos as $index => $file) {
                $origName = $file['name'] ?? "imagen_{$index}.jpg";
                $tmpName  = $file['tmp_name'] ?? '';
                $error    = $file['error'] ?? UPLOAD_ERR_OK;
                $size     = (int)($file['size'] ?? 0);

                if ($error !== UPLOAD_ERR_OK) {
                    $errorMsg = match ($error) {
                        UPLOAD_ERR_INI_SIZE   => "El archivo '{$origName}' excede el límite 'upload_max_filesize' del servidor.",
                        UPLOAD_ERR_FORM_SIZE  => "El archivo '{$origName}' excede el límite configurado en el formulario.",
                        UPLOAD_ERR_PARTIAL    => "El archivo '{$origName}' solo fue cargado parcialmente.",
                        UPLOAD_ERR_NO_FILE    => "No se detectó ningún archivo en la petición.",
                        default               => "Error al subir el archivo '{$origName}' (código {$error}).",
                    };
                    throw new InvalidArgumentException($errorMsg);
                }

                if (!is_uploaded_file($tmpName) && !file_exists($tmpName)) {
                    throw new InvalidArgumentException("El archivo '{$origName}' no es válido.");
                }

                if ($size > $maxSizeBytes) {
                    $sizeMB = round($size / (1024 * 1024), 2);
                    throw new InvalidArgumentException("El archivo '{$origName}' ({$sizeMB}MB) supera el peso máximo permitido de 5MB.");
                }

                $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
                if (!in_array($ext, $allowedExtensions, true)) {
                    throw new InvalidArgumentException("El archivo '{$origName}' tiene una extensión no permitida (.{$ext}). Solo se admiten: JPG, JPEG, PNG, WEBP, GIF.");
                }

                $detectedMime = finfo_file($finfo, $tmpName);
                if (!in_array($detectedMime, $allowedMimes, true)) {
                    throw new InvalidArgumentException("El archivo '{$origName}' no es una imagen real válida ({$detectedMime}).");
                }

                $uniqueName = 'ticket_' . $tareaId . '_' . bin2hex(random_bytes(8)) . '.' . $ext;
                $destPath = $targetDir . $uniqueName;
                $relativePath = 'uploads/tickets/' . $uniqueName;

                $moved = is_uploaded_file($tmpName)
                    ? move_uploaded_file($tmpName, $destPath)
                    : copy($tmpName, $destPath);

                if (!$moved) {
                    throw new RuntimeException("Error al guardar la imagen '{$origName}' en el disco del servidor.");
                }

                $uploadedFilesOnDisk[] = $destPath;

                $imagenModel = TareaImagen::create([
                    'tarea_id'        => $tareaId,
                    'nombre_archivo'  => $uniqueName,
                    'nombre_original' => $origName,
                    'ruta'            => $relativePath,
                    'mime_type'       => $detectedMime,
                    'peso_bytes'      => $size,
                ]);

                $savedModels[] = $imagenModel;
            }

            finfo_close($finfo);
            return self::formatImagenes($savedModels);
        } catch (Throwable $e) {
            if (isset($finfo) && is_resource($finfo)) {
                finfo_close($finfo);
            }
            // Limpieza de archivos físicos ante excepciones
            foreach ($uploadedFilesOnDisk as $path) {
                if (file_exists($path)) {
                    @unlink($path);
                }
            }
            // Revertir registros creados en esta tanda
            foreach ($savedModels as $model) {
                try {
                    $model->delete();
                } catch (Throwable) {}
            }
            throw $e;
        }
    }

    // ------------------------------------------------------------------
    // Eliminar imagen física y de BD
    // ------------------------------------------------------------------
    public function eliminarImagen(int $tareaId, int $imagenId): bool {
        $imagen = TareaImagen::where('id', $imagenId)->where('tarea_id', $tareaId)->first();
        if (!$imagen) {
            return false;
        }

        $fullPath = dirname(__DIR__) . '/' . ltrim($imagen->ruta, '/');
        if (file_exists($fullPath) && is_file($fullPath)) {
            @unlink($fullPath);
        }

        return (bool)$imagen->delete();
    }

    // ------------------------------------------------------------------
    // Restaurar tarea eliminada lógicamente
    // ------------------------------------------------------------------
    public function restore(int $id, int $restorerId): bool {
        Capsule::statement("SET @usuario_id_app = ?", [$restorerId]);

        $tarea = Tarea::withTrashed()->find($id);
        if ($tarea) {
            return (bool)$tarea->restore();
        }
        return false;
    }
}
