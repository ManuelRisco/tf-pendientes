<?php
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/config/Database.php';

Database::bootEloquent();
$pdo = Database::getConnection();

$sp1 = "
DROP PROCEDURE IF EXISTS sp_generar_reporte_tickets;
";

$sp1_create = "
CREATE PROCEDURE sp_generar_reporte_tickets(IN p_fecha_inicio DATE, IN p_fecha_fin DATE)
BEGIN
    SELECT 
        COUNT(id) AS total_tickets,
        SUM(CASE WHEN estado_id = 4 THEN 1 ELSE 0 END) AS resueltos,
        SUM(CASE WHEN estado_id = 1 THEN 1 ELSE 0 END) AS pendientes,
        SUM(CASE WHEN estado_id = 2 THEN 1 ELSE 0 END) AS en_curso,
        SUM(CASE WHEN estado_id = 3 THEN 1 ELSE 0 END) AS en_revision,
        
        SUM(CASE WHEN prioridad_id = 1 THEN 1 ELSE 0 END) AS prioridad_baja,
        SUM(CASE WHEN prioridad_id = 2 THEN 1 ELSE 0 END) AS prioridad_media,
        SUM(CASE WHEN prioridad_id = 3 THEN 1 ELSE 0 END) AS prioridad_alta,
        SUM(CASE WHEN prioridad_id = 4 THEN 1 ELSE 0 END) AS prioridad_critica
    FROM tareas
    WHERE DATE(created_at) >= p_fecha_inicio AND DATE(created_at) <= p_fecha_fin
      AND deleted_at IS NULL;
END;
";

$sp2 = "
DROP PROCEDURE IF EXISTS sp_reporte_problemas_frecuentes;
";

$sp2_create = "
CREATE PROCEDURE sp_reporte_problemas_frecuentes(IN p_fecha_inicio DATE, IN p_fecha_fin DATE, IN p_limite INT)
BEGIN
    SELECT 
        titulo,
        COUNT(id) AS frecuencia
    FROM tareas
    WHERE DATE(created_at) >= p_fecha_inicio AND DATE(created_at) <= p_fecha_fin
      AND deleted_at IS NULL
    GROUP BY titulo
    ORDER BY frecuencia DESC
    LIMIT p_limite;
END;
";

try {
    $pdo->exec($sp1);
    $pdo->exec($sp1_create);
    echo "sp_generar_reporte_tickets created successfully.\n";

    $pdo->exec($sp2);
    $pdo->exec($sp2_create);
    echo "sp_reporte_problemas_frecuentes created successfully.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
