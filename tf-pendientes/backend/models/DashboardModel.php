<?php

class DashboardModel {

    /**
     * Estadísticas generales — para administradores ve todo,
     * para empleados solo sus propias tareas.
     */
    public function getStats(?int $usuarioId = null): array {
        $tareasQuery = Tarea::query();
        if ($usuarioId !== null) {
            $tareasQuery->where('usuario_id', $usuarioId);
        }

        // Total de tareas activas
        $total = clone $tareasQuery;
        $total = $total->count();

        // Por estado
        $porEstado = Estado::select('estados.id', 'estados.nombre')
            ->selectRaw('COUNT(tareas.id) as cantidad')
            ->leftJoin('tareas', function ($join) use ($usuarioId) {
                $join->on('tareas.estado_id', '=', 'estados.id')
                     ->whereNull('tareas.deleted_at');
                if ($usuarioId !== null) {
                    $join->where('tareas.usuario_id', '=', $usuarioId);
                }
            })
            ->groupBy('estados.id', 'estados.nombre')
            ->orderBy('estados.id')
            ->get()
            ->toArray();

        // Por prioridad
        $porPrioridad = Prioridad::select('prioridades.id', 'prioridades.nombre')
            ->selectRaw('COUNT(tareas.id) as cantidad')
            ->leftJoin('tareas', function ($join) use ($usuarioId) {
                $join->on('tareas.prioridad_id', '=', 'prioridades.id')
                     ->whereNull('tareas.deleted_at');
                if ($usuarioId !== null) {
                    $join->where('tareas.usuario_id', '=', $usuarioId);
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
     * Solo para admins: obtener los últimos movimientos de la bitácora
     */
    public function getMovimientos(int $limite = 10, int $offset = 0): array {
        $bitacoras = Bitacora::with(['tipoAccion', 'usuario.persona'])
            ->orderBy('created_at', 'desc')
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

    public function countMovimientos(): int {
        return Bitacora::count();
    }
}
