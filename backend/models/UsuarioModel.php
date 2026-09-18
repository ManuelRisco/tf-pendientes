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
    // Listar usuarios con filtros y orden: Activos primero, más recientes primero
    // ------------------------------------------------------------------
    public function getAll(array $filters = [], int $limit = 10, int $offset = 0): array {
        $query = Usuario::withTrashed()->with(['persona', 'rol']);

        // Filtro por Estado
        if (!empty($filters['estado']) && $filters['estado'] !== 'todos') {
            if ($filters['estado'] === 'activo' || $filters['estado'] === '1') {
                $query->whereNull('deleted_at');
            } elseif ($filters['estado'] === 'inactivo' || $filters['estado'] === '0') {
                $query->whereNotNull('deleted_at');
            }
        }

        // Filtro por Rol
        if (!empty($filters['rol_id'])) {
            $query->where('rol_id', (int)$filters['rol_id']);
        }

        // Filtro por Búsqueda (nombre, apellido, email, o #ID)
        if (!empty($filters['search'])) {
            $rawSearch = trim($filters['search']);
            $cleanId = preg_replace('/^[#\s]*(?:id\s*[:\s]*)?/i', '', $rawSearch);
            $cleanId = trim($cleanId);
            $isIdSearch = is_numeric($cleanId) && (int)$cleanId > 0;
            $search = '%' . $rawSearch . '%';

            $query->where(function($q) use ($search, $cleanId, $isIdSearch) {
                if ($isIdSearch) {
                    $q->where('id', (int)$cleanId);
                } else {
                    $q->where('email', 'LIKE', $search);
                }
                $q->orWhereHas('persona', function($pq) use ($search) {
                    $pq->where('nombre', 'LIKE', $search)
                       ->orWhere('apellido', 'LIKE', $search)
                       ->orWhereRaw("CONCAT(nombre, ' ', apellido) LIKE ?", [$search]);
                });
            });
        }

        // Orden: Primero activos (deleted_at IS NULL), luego creados más recientemente (created_at DESC, id DESC)
        $query->orderByRaw('CASE WHEN deleted_at IS NULL THEN 0 ELSE 1 END ASC')
              ->orderBy('created_at', 'desc')
              ->orderBy('id', 'desc');

        $usuarios = $query->skip($offset)->take($limit)->get();

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
    // Contar total de usuarios con filtros para paginación
    // ------------------------------------------------------------------
    public function countAll(array $filters = []): int {
        $query = Usuario::withTrashed();

        if (!empty($filters['estado']) && $filters['estado'] !== 'todos') {
            if ($filters['estado'] === 'activo' || $filters['estado'] === '1') {
                $query->whereNull('deleted_at');
            } elseif ($filters['estado'] === 'inactivo' || $filters['estado'] === '0') {
                $query->whereNotNull('deleted_at');
            }
        }

        if (!empty($filters['rol_id'])) {
            $query->where('rol_id', (int)$filters['rol_id']);
        }

        if (!empty($filters['search'])) {
            $rawSearch = trim($filters['search']);
            $cleanId = preg_replace('/^[#\s]*(?:id\s*[:\s]*)?/i', '', $rawSearch);
            $cleanId = trim($cleanId);
            $isIdSearch = is_numeric($cleanId) && (int)$cleanId > 0;
            $search = '%' . $rawSearch . '%';

            $query->where(function($q) use ($search, $cleanId, $isIdSearch) {
                if ($isIdSearch) {
                    $q->where('id', (int)$cleanId);
                } else {
                    $q->where('email', 'LIKE', $search);
                }
                $q->orWhereHas('persona', function($pq) use ($search) {
                    $pq->where('nombre', 'LIKE', $search)
                       ->orWhere('apellido', 'LIKE', $search)
                       ->orWhereRaw("CONCAT(nombre, ' ', apellido) LIKE ?", [$search]);
                });
            });
        }

        return $query->count();
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
    public function create(array $data, ?int $creatorId = null): int {
        // Disparar la variable de sesión para el trigger de bitácora
        Capsule::statement("SET @usuario_id_app = ?", [$creatorId]);
        
        return Capsule::transaction(function () use ($data) {
            // 1. Insertar persona
            $persona = Persona::create([
                'nombre'   => $data['nombre'],
                'apellido' => $data['apellido']
            ]);

            // 2. Cifrar contraseña con Bcrypt si no está cifrada
            $password = $data['password'] ?? '';
            if (!empty($password)) {
                $info = password_get_info($password);
                if ($info['algo'] === null || $info['algo'] === 0) {
                    $password = password_hash($password, PASSWORD_BCRYPT);
                }
            }

            // 3. Insertar usuario
            $usuario = Usuario::create([
                'persona_id' => $persona->id,
                'rol_id'     => $data['rol_id'],
                'email'      => $data['email'],
                'password'   => $password
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

            if ($usuario->persona && (isset($data['nombre']) || isset($data['apellido']))) {
                $personaData = [];
                if (isset($data['nombre']))   $personaData['nombre']   = $data['nombre'];
                if (isset($data['apellido'])) $personaData['apellido'] = $data['apellido'];
                $usuario->persona->update($personaData);
            }

            $updateData = [];
            if (isset($data['rol_id'])) $updateData['rol_id'] = $data['rol_id'];
            if (isset($data['email']))  $updateData['email']  = $data['email'];

            // Si se envió una nueva contraseña, cifrarla con Bcrypt
            if (!empty($data['password'])) {
                $password = $data['password'];
                $info = password_get_info($password);
                if ($info['algo'] === null || $info['algo'] === 0) {
                    $password = password_hash($password, PASSWORD_BCRYPT);
                }
                $updateData['password'] = $password;
            }

            if (empty($updateData) && empty($personaData)) {
                return true;
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
}
