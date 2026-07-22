<?php

use Illuminate\Database\Capsule\Manager as Capsule;

class UsuarioModel {

    // ------------------------------------------------------------------
    // Búsqueda por email (para login)
    // ------------------------------------------------------------------
    public function findByEmail(string $email): ?array {
        $usuario = Usuario::with('persona')
            ->where('email', $email)
            ->first();

        if (!$usuario) return null;

        return [
            'id'         => $usuario->id,
            'email'      => $usuario->email,
            'password'   => $usuario->makeVisible('password')->password, 
            'rol_id'     => $usuario->rol_id,
            'deleted_at' => $usuario->deleted_at,
            'nombre'     => $usuario->persona ? $usuario->persona->nombre : null,
            'apellido'   => $usuario->persona ? $usuario->persona->apellido : null,
            'persona_id' => $usuario->persona_id,
        ];
    }

    // ------------------------------------------------------------------
    // Listar usuarios activos (con datos de persona y rol) con paginación
    // ------------------------------------------------------------------
    public function getAll(int $limit = 10, int $offset = 0): array {
        $usuarios = Usuario::withTrashed() // Trae todos para coincidir con la query original
            ->with(['persona', 'rol'])
            ->orderBy('id', 'desc')
            ->skip($offset)
            ->take($limit)
            ->get();

        $result = [];
        foreach ($usuarios as $u) {
            $result[] = [
                'id'         => $u->id,
                'email'      => $u->email,
                'rol_id'     => $u->rol_id,
                'rol'        => $u->rol ? $u->rol->nombre : null,
                'persona_id' => $u->persona_id,
                'nombre'     => $u->persona ? $u->persona->nombre : null,
                'apellido'   => $u->persona ? $u->persona->apellido : null,
                'created_at' => $u->created_at,
                'updated_at' => $u->updated_at,
                'deleted_at' => $u->deleted_at,
            ];
        }
        return $result;
    }

    // ------------------------------------------------------------------
    // Contar total de usuarios para paginación
    // ------------------------------------------------------------------
    public function countAll(): int {
        return Usuario::withTrashed()->count();
    }

    // ------------------------------------------------------------------
    // Obtener uno por id
    // ------------------------------------------------------------------
    public function findById(int $id): ?array {
        $usuario = Usuario::with(['persona', 'rol'])->find($id);

        if (!$usuario) return null;

        return [
            'id'         => $usuario->id,
            'email'      => $usuario->email,
            'rol_id'     => $usuario->rol_id,
            'rol'        => $usuario->rol ? $usuario->rol->nombre : null,
            'persona_id' => $usuario->persona_id,
            'nombre'     => $usuario->persona ? $usuario->persona->nombre : null,
            'apellido'   => $usuario->persona ? $usuario->persona->apellido : null,
            'created_at' => $usuario->created_at,
            'updated_at' => $usuario->updated_at,
        ];
    }

    // ------------------------------------------------------------------
    // Crear persona + usuario en una transacción
    // ------------------------------------------------------------------
    public function create(array $data, int $creatorId): int {
        // Disparar la variable de sesión para el trigger de bitácora
        Capsule::statement("SET @usuario_id_app = ?", [$creatorId]);
        
        return Capsule::transaction(function () use ($data) {
            // 1. Insertar persona
            $persona = Persona::create([
                'nombre'   => $data['nombre'],
                'apellido' => $data['apellido']
            ]);

            // 2. Insertar usuario
            $usuario = Usuario::create([
                'persona_id' => $persona->id,
                'rol_id'     => $data['rol_id'],
                'email'      => $data['email'],
                'password'   => $data['password']
            ]);

            return $usuario->id;
        });
    }

    // ------------------------------------------------------------------
    // Actualizar persona + usuario en transacción
    // ------------------------------------------------------------------
    public function update(int $id, array $data, int $editorId): bool {
        Capsule::statement("SET @usuario_id_app = ?", [$editorId]);

        return Capsule::transaction(function () use ($id, $data) {
            $usuario = Usuario::find($id);
            if (!$usuario) return false;

            if ($usuario->persona) {
                $usuario->persona->update([
                    'nombre'   => $data['nombre'],
                    'apellido' => $data['apellido']
                ]);
            }

            $updateData = [
                'rol_id' => $data['rol_id'],
                'email'  => $data['email']
            ];

            if (!empty($data['password'])) {
                $updateData['password'] = $data['password'];
            }

            return $usuario->update($updateData);
        });
    }

    // ------------------------------------------------------------------
    // Eliminación lógica
    // ------------------------------------------------------------------
    public function delete(int $id, int $deleterId): bool {
        Capsule::statement("SET @usuario_id_app = ?", [$deleterId]);

        $usuario = Usuario::find($id);
        if ($usuario) {
            return $usuario->delete();
        }
        return false;
    }

    // ------------------------------------------------------------------
    // Restaurar usuario
    // ------------------------------------------------------------------
    public function restore(int $id, int $restorerId): bool {
        Capsule::statement("SET @usuario_id_app = ?", [$restorerId]);

        $usuario = Usuario::withTrashed()->find($id);
        if ($usuario) {
            return $usuario->restore();
        }
        return false;
    }

    // ------------------------------------------------------------------
    // Validar si un email ya existe (ignorando un id)
    // ------------------------------------------------------------------
    public function emailExists(string $email, ?int $excludeId = null): bool {
        $query = Usuario::withTrashed()->where('email', $email);
        if ($excludeId !== null) {
            $query->where('id', '!=', $excludeId);
        }
        return $query->exists();
    }
}
