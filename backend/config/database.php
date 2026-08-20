<?php

use Illuminate\Database\Capsule\Manager as Capsule;

class Database {
    private static ?Capsule $capsule = null;
    private static ?PDO $instance = null;

    private function __construct() {}
    private function __clone() {}

    public static function bootEloquent(): void {
        if (self::$capsule !== null) return;

        self::$capsule = new Capsule;

        self::$capsule->addConnection([
            'driver'    => 'mysql',
            'host'      => 'localhost',
            'port'      => '3306',
            'database'  => 'tf_pendientes',
            'username'  => 'root',
            'password'  => '',
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
