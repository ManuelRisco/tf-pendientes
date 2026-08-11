<?php

use Illuminate\Database\Capsule\Manager as Capsule;

class Database {
    private static ?Capsule $capsule = null;
    private static ?PDO $instance = null;

    private function __construct() {}
    private function __clone() {}

    private static function getEnv(string $key, string $default = ''): string {
        $val = getenv($key);
        if ($val !== false && $val !== '') return $val;
        return $_ENV[$key] ?? $default;
    }

    public static function bootEloquent(): void {
        if (self::$capsule !== null) return;

        self::$capsule = new Capsule;

        $host     = self::getEnv('MYSQLHOST', 'localhost');
        $dbname   = self::getEnv('MYSQLDATABASE', '');
        $user     = self::getEnv('MYSQLUSER', 'root');
        $password = self::getEnv('MYSQLPASSWORD', '');
        $port     = self::getEnv('MYSQLPORT', '3306');

        self::$capsule->addConnection([
            'driver'    => 'mysql',
            'host'      => $host,
            'port'      => $port,
            'database'  => $dbname,
            'username'  => $user,
            'password'  => $password,
            'charset'   => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix'    => '',
        ]);

        // Evitar que el ORM intente usar created_at / updated_at automáticamente si no existen
        // pero sí lo dejaremos activado en cada modelo explícitamente

        self::$capsule->setAsGlobal();
        self::$capsule->bootEloquent();
    }

    public static function getConnection(): PDO {
        if (self::$capsule === null) {
            self::bootEloquent();
        }
        
        if (self::$instance === null) {
            self::$instance = self::$capsule->getConnection()->getPdo();
        }
        
        return self::$instance;
    }
}
