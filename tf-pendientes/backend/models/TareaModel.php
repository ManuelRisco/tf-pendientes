<?php

use Illuminate\Database\Capsule\Manager as Capsule;

class TareaModel {

    // ------------------------------------------------------------------
    // Listar tareas con filtros opcionales
    // Admins ven todas; Empleados solo las suyas
    // ------------------------------------------------------------------
    public function getAll(array $filters = [], ?int $usuarioId = null, int $limit = 10, int $offset = 0): array {
        $query = Tarea::with(['estado', 'prioridad', 'usuario.persona'])
            ->orderBy('created_at', 'desc');

        if ($usuarioId !== null) {
            $query->where('usuario_id', $usuarioId);
        }

        if (!empty($filters['estado_id'])) {
            $query->where('estado_id', (int)$filters['estado_id']);
        }

        if (!empty($filters['prioridad_id'])) {
            $query->where('prioridad_id', (int)$filters['prioridad_id']);
        }

        if (!empty($filters['search'])) {
            $search = '%' . $filters['search'] . '%';
            $query->where(function($q) use ($search) {
                $q->where('titulo', 'LIKE', $search)
                  ->orWhere('descripcion', 'LIKE', $search);
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
                'usuario_nombre' => $t->usuario && $t->usuario->persona ? $t->usuario->persona->nombre . ' ' . $t->usuario->persona->apellido : null,
                'created_at'     => $t->created_at,
                'updated_at'     => $t->updated_at,
            ];
        }

        return $result;
    }

    public function countAll(array $filters = [], ?int $usuarioId = null): int {
        $query = Tarea::query();

        if ($usuarioId !== null) {
            $query->where('usuario_id', $usuarioId);
        }

        if (!empty($filters['estado_id'])) {
            $query->where('estado_id', (int)$filters['estado_id']);
        }

        if (!empty($filters['prioridad_id'])) {
            $query->where('prioridad_id', (int)$filters['prioridad_id']);
        }

        if (!empty($filters['search'])) {
            $search = '%' . $filters['search'] . '%';
            $query->where(function($q) use ($search) {
                $q->where('titulo', 'LIKE', $search)
                  ->orWhere('descripcion', 'LIKE', $search);
            });
        }

        return $query->count();
    }

    // ------------------------------------------------------------------
    public function findById(int $id): ?array {
        $t = Tarea::with(['estado', 'prioridad', 'usuario.persona'])->find($id);

        if (!$t) return null;

        return [
            'id'             => $t->id,
            'titulo'         => $t->titulo,
            'descripcion'    => $t->descripcion,
            'estado_id'      => $t->estado_id,
            'estado'         => $t->estado ? $t->estado->nombre : null,
            'prioridad_id'   => $t->prioridad_id,
            'prioridad'      => $t->prioridad ? $t->prioridad->nombre : null,
            'usuario_id'     => $t->usuario_id,
            'usuario_nombre' => $t->usuario && $t->usuario->persona ? $t->usuario->persona->nombre . ' ' . $t->usuario->persona->apellido : null,
            'created_at'     => $t->created_at,
            'updated_at'     => $t->updated_at,
        ];
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
        $allowed = ['titulo', 'descripcion', 'estado_id', 'prioridad_id', 'usuario_id'];
        
        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $updateData[$field] = $data[$field];
            }
        }

        if (empty($updateData)) return false;

        return $tarea->update($updateData);
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
    public function restore(int $id, int $editorId): bool {
        Capsule::statement("SET @usuario_id_app = ?", [$editorId]);

        $tarea = Tarea::withTrashed()->find($id);
        if ($tarea) {
            return $tarea->restore();
        }
        return false;
    }
}
