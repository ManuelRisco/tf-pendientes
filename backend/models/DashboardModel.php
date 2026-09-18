<?php

class DashboardModel {

    /**
     * Estadísticas generales — para administradores ve todo o filtrado por scope,
     * para empleados solo sus propias tareas.
     */
    public function getStats(?int $usuarioId = null, ?int $excluirUsuarioId = null): array {
        $tareasQuery = Tarea::query();
        if ($usuarioId !== null) {
            $tareasQuery->where('usuario_id', $usuarioId);
        }
        if ($excluirUsuarioId !== null) {
            $tareasQuery->where('usuario_id', '!=', $excluirUsuarioId);
        }

        // Total de tareas activas
        $total = clone $tareasQuery;
        $total = $total->count();

        // Por estado
        $porEstado = Estado::select('estados.id', 'estados.nombre')
            ->selectRaw('COUNT(tareas.id) as cantidad')
            ->leftJoin('tareas', function ($join) use ($usuarioId, $excluirUsuarioId) {
                $join->on('tareas.estado_id', '=', 'estados.id')
                     ->whereNull('tareas.deleted_at');
                if ($usuarioId !== null) {
                    $join->where('tareas.usuario_id', '=', $usuarioId);
                }
                if ($excluirUsuarioId !== null) {
                    $join->where('tareas.usuario_id', '!=', $excluirUsuarioId);
                }
            })
            ->groupBy('estados.id', 'estados.nombre')
            ->orderBy('estados.id')
            ->get()
            ->toArray();

        // Por prioridad
        $porPrioridad = Prioridad::select('prioridades.id', 'prioridades.nombre')
            ->selectRaw('COUNT(tareas.id) as cantidad')
            ->leftJoin('tareas', function ($join) use ($usuarioId, $excluirUsuarioId) {
                $join->on('tareas.prioridad_id', '=', 'prioridades.id')
                     ->whereNull('tareas.deleted_at');
                if ($usuarioId !== null) {
                    $join->where('tareas.usuario_id', '=', $usuarioId);
                }
                if ($excluirUsuarioId !== null) {
                    $join->where('tareas.usuario_id', '!=', $excluirUsuarioId);
                }
            })
            ->groupBy('prioridades.id', 'prioridades.nombre')
            ->orderBy('prioridades.id')
            ->get()
            ->toArray();

        return [
            'total'        => $total,
            'porEstado'    => $porEstado,
            'porPrioridad' => $porPrioridad,
        ];
    }

    /**
     * Solo para admins: número de usuarios activos
     */
    public function getTotalUsuarios(): int {
        return Usuario::count();
    }

    /**
     * Aplica filtros a la consulta de Bitacora
     */
    private function applyMovimientosFilters($query, ?int $usuarioId = null, ?int $excluirUsuarioId = null, array $filters = []) {
        if ($usuarioId !== null) {
            $query->where('bitacora.usuario_id', $usuarioId);
        }
        if ($excluirUsuarioId !== null) {
            $query->where('bitacora.usuario_id', '!=', $excluirUsuarioId);
        }

        if (!empty($filters['modulo'])) {
            $query->where('bitacora.modulo', $filters['modulo']);
        }

        if (!empty($filters['accion'])) {
            $accion = $filters['accion'];
            $query->whereHas('tipoAccion', function($q) use ($accion) {
                $q->where('nombre', $accion);
            });
        }

        if (!empty($filters['search'])) {
            $search = trim((string)$filters['search']);
            $cleanId = preg_replace('/^[#\s]*(?:id\s*[:\s]*)?/i', '', $search);
            $isNumeric = ($cleanId !== '' && is_numeric($cleanId));

            $query->where(function($q) use ($search, $cleanId, $isNumeric) {
                if ($isNumeric) {
                    $numId = (int)$cleanId;
                    $q->where('bitacora.id', $numId)
                      ->orWhere('bitacora.registro_id', $numId);
                } else {
                    $term = '%' . $search . '%';
                    $q->where('bitacora.detalles', 'LIKE', $term)
                      ->orWhere('bitacora.modulo', 'LIKE', $term)
                      ->orWhereHas('usuario', function($uQ) use ($term) {
                          $uQ->where('email', 'LIKE', $term)
                             ->orWhereHas('persona', function($pQ) use ($term) {
                                 $pQ->where('nombre', 'LIKE', $term)
                                    ->orWhere('apellido', 'LIKE', $term);
                             });
                      })
                      ->orWhereHas('tipoAccion', function($aQ) use ($term) {
                          $aQ->where('nombre', 'LIKE', $term);
                      });
                }
            });
        }

        return $query;
    }

    /**
     * Obtener movimientos de la bitácora con soporte para filtros de módulo, acción, búsqueda y usuario
     */
    public function getMovimientos(int $limite = 10, int $offset = 0, ?int $usuarioId = null, ?int $excluirUsuarioId = null, array $filters = []): array {
        $query = Bitacora::with(['tipoAccion', 'usuario.persona']);
        $this->applyMovimientosFilters($query, $usuarioId, $excluirUsuarioId, $filters);

        $bitacoras = $query->orderBy('created_at', 'desc')
            ->skip($offset)
            ->take($limite)
            ->get();

        $movimientos = [];
        foreach ($bitacoras as $b) {
            $detalles = !empty($b->detalles) ? json_decode($b->detalles, true) : null;
            
            $movimientos[] = [
                'id'               => $b->id,
                'modulo'           => $b->modulo,
                'registro_id'      => $b->registro_id,
                'detalles'         => $detalles,
                'created_at'       => $b->created_at,
                'tipo_accion'      => $b->tipoAccion ? $b->tipoAccion->nombre : null,
                'persona_nombre'   => $b->usuario && $b->usuario->persona ? $b->usuario->persona->nombre : null,
                'persona_apellido' => $b->usuario && $b->usuario->persona ? $b->usuario->persona->apellido : null,
                'email'            => $b->usuario ? $b->usuario->email : null,
            ];
        }

        return $movimientos;
    }

    /**
     * Obtener movimientos de la bitácora filtrados por un usuario específico
     */
    public function getMovimientosPorUsuario(int $usuarioId, int $limite = 10, int $offset = 0, array $filters = []): array {
        return $this->getMovimientos($limite, $offset, $usuarioId, null, $filters);
    }

    public function countMovimientos(?int $usuarioId = null, ?int $excluirUsuarioId = null, array $filters = []): int {
        $query = Bitacora::query();
        $this->applyMovimientosFilters($query, $usuarioId, $excluirUsuarioId, $filters);
        return $query->count();
    }

    /**
     * Métricas globales de movimientos para los cards superiores
     */
    public function getMovimientosMetrics(?int $usuarioId = null, ?int $excluirUsuarioId = null): array {
        $baseQuery = Bitacora::query();
        if ($usuarioId !== null) {
            $baseQuery->where('bitacora.usuario_id', $usuarioId);
        }
        if ($excluirUsuarioId !== null) {
            $baseQuery->where('bitacora.usuario_id', '!=', $excluirUsuarioId);
        }

        $total = (clone $baseQuery)->count();
        $tareas = (clone $baseQuery)->where('modulo', 'tareas')->count();
        $usuarios = (clone $baseQuery)->where('modulo', 'usuarios')->count();
        $hoy = (clone $baseQuery)->whereDate('created_at', date('Y-m-d'))->count();

        return [
            'total'    => $total,
            'tareas'   => $tareas,
            'usuarios' => $usuarios,
            'hoy'      => $hoy,
        ];
    }

    /**
     * Obtener listado único de nombres de tipos de acciones disponibles
     */
    public function getTiposAcciones(): array {
        return TipoAccion::orderBy('id')->pluck('nombre')->toArray();
    }
}
