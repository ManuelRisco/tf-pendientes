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
     * Obtener movimientos de la bitácora con soporte para filtros de usuario
     */
    public function getMovimientos(int $limite = 10, int $offset = 0, ?int $usuarioId = null, ?int $excluirUsuarioId = null): array {
        $query = Bitacora::with(['tipoAccion', 'usuario.persona']);

        if ($usuarioId !== null) {
            $query->where('usuario_id', $usuarioId);
        }
        if ($excluirUsuarioId !== null) {
            $query->where('usuario_id', '!=', $excluirUsuarioId);
        }

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
    public function getMovimientosPorUsuario(int $usuarioId, int $limite = 10, int $offset = 0): array {
        return $this->getMovimientos($limite, $offset, $usuarioId);
    }

    public function countMovimientos(?int $usuarioId = null, ?int $excluirUsuarioId = null): int {
        $query = Bitacora::query();
        if ($usuarioId !== null) {
            $query->where('usuario_id', $usuarioId);
        }
        if ($excluirUsuarioId !== null) {
            $query->where('usuario_id', '!=', $excluirUsuarioId);
        }
        return $query->count();
    }
}
