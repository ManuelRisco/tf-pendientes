<?php

class Database {
    private static ?PDO $instance = null;

    private static string $host     = 'localhost';
    private static string $dbname   = 'tf_pendientes'; // Cambia al nombre de tu BD
    private static string $user     = 'root';          // Cambia a tu usuario
    private static string $password = '';              // Cambia a tu contraseña
    private static string $charset  = 'utf8mb4';

    private function __construct() {}
    private function __clone() {}

    private static function getEnv(string $key, string $default = ''): string {
        $val = getenv($key);
        if ($val !== false && $val !== '') return $val;
        return $_ENV[$key] ?? $default;
    }

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            // Prioriza variables de entorno (Railway u otros) y usa valores por defecto para localhost
            $host     = self::getEnv('MYSQLHOST', 'localhost');
            $dbname   = self::getEnv('MYSQLDATABASE', 'tf_pendientes');
            $user     = self::getEnv('MYSQLUSER', 'root');
            $password = self::getEnv('MYSQLPASSWORD', '');
            $port     = self::getEnv('MYSQLPORT', '3306');
            $charset  = 'utf8mb4';

            $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset={$charset}";

            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            try {
                self::$instance = new PDO($dsn, $user, $password, $options);
            } catch (PDOException $e) {
                http_response_code(500);
                header('Content-Type: application/json');
                echo json_encode([
                    'success' => false,
                    'message' => 'Error de conexión a la base de datos.',
                    'error'   => $e->getMessage()
                ]);
                exit;
            }
        }
        return self::$instance;
    }
}
