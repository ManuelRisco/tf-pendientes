<?php

class AuthController {
    private UsuarioModel $model;

    public function __construct() {
        $this->model = new UsuarioModel();
    }

    // POST /api/auth/login
    public function login(): void {
        $body = $this->json();

        $email    = trim($body['email']    ?? '');
        $password = trim($body['password'] ?? '');
        $ip       = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

        if (!$email || !$password) {
            Response::error('Email y contraseña son requeridos.', 422);
        }

        $db   = Database::getConnection();
        $user = $this->model->findByEmail($email);

        if ($user && is_null($user['deleted_at']) && password_verify($password, $user['password'])) {
            // Registrar log de acceso exitoso
            $this->registrarLog($db, $user['id'], $email, $ip, 1);

            $token = JwtHelper::generate([
                'id'     => $user['id'],
                'email'  => $user['email'],
                'rol_id' => $user['rol_id'],
            ]);

            Response::success([
                'token' => $token,
                'user'  => [
                    'id'       => $user['id'],
                    'email'    => $user['email'],
                    'nombre'   => $user['nombre'],
                    'apellido' => $user['apellido'],
                    'rol_id'   => $user['rol_id'],
                ],
            ], 'Login exitoso');
        } else {
            // Log de acceso fallido
            $this->registrarLog($db, $user['id'] ?? null, $email, $ip, 0);
            Response::unauthorized('Credenciales incorrectas o cuenta inactiva.');
        }
    }

    // POST /api/auth/me — devuelve datos del usuario autenticado
    public function me(): void {
        $payload = AuthMiddleware::require();
        $user    = $this->model->findById((int)$payload['id']);

        if (!$user) {
            Response::notFound('Usuario no encontrado.');
        }

        Response::success($user);
    }

    // POST /api/auth/register
    public function register(): void {
        $body = $this->json();

        $nombre   = trim($body['nombre'] ?? '');
        $apellido = trim($body['apellido'] ?? '');
        $email    = trim($body['email'] ?? '');
        $password = trim($body['password'] ?? '');
        $rol_id   = (int)($body['rol_id'] ?? 2); // Default to role 2 (Empleado/Usuario)

        if (!$nombre || !$apellido || !$email || !$password) {
            Response::error('Todos los campos son requeridos.', 422);
        }
        
        if (strlen($password) < 6) {
            Response::error('La contraseña debe tener al menos 6 caracteres.', 422);
        }
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error('Email inválido.', 422);
        }

        $existingUser = $this->model->findByEmail($email);
        if ($existingUser) {
            Response::error('El email ya está registrado.', 409);
        }

        try {
            $data = [
                'nombre' => $nombre,
                'apellido' => $apellido,
                'email' => $email,
                'password' => $password,
                'rol_id' => $rol_id
            ];
            // Passing null as creator ID since it's a self-registration
            $id = $this->model->create($data, null); 
            
            // Auto login after register
            $user = $this->model->findById($id);
            $token = JwtHelper::generate([
                'id'     => $user['id'],
                'email'  => $user['email'],
                'rol_id' => $user['rol_id'],
            ]);

            Response::success([
                'token' => $token,
                'user'  => $user,
            ], 'Registro exitoso', 201);
            
        } catch (Throwable $e) {
            Response::error('Error al registrar usuario: ' . $e->getMessage(), 500);
        }
    }

    // -----------------------------------------------------------------------
    private function json(): array {
        $raw = file_get_contents('php://input');
        return json_decode($raw, true) ?? [];
    }

    private function registrarLog(PDO $db, ?int $userId, string $email, string $ip, int $exitoso): void {
        try {
            $stmt = $db->prepare("
                INSERT INTO logs_acceso (usuario_id, email_ingresado, direccion_ip, exitoso)
                VALUES (:uid, :email, :ip, :exitoso)
            ");
            $stmt->execute([
                'uid'     => $userId,
                'email'   => $email,
                'ip'      => $ip,
                'exitoso' => $exitoso,
            ]);
        } catch (Throwable) {
            // No romper el flujo principal si falla el log
        }
    }
}
