<?php
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/config/Database.php';

Database::bootEloquent();
$pdo = Database::getConnection();

$queries = [
    "SELECT * FROM estados;",
    "SELECT * FROM prioridades;"
];

foreach ($queries as $q) {
    echo "--- Query: $q ---\n";
    try {
        $stmt = $pdo->query($q);
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        print_r($result);
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
    echo "\n";
}
