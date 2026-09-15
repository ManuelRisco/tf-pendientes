<?php

class ReporteModel {

    /**
     * Genera el resumen consolidado de tickets por estado y prioridad en un rango de fechas.
     * Ejecutado nativamente en backend para portabilidad total sin depender de SPs en MySQL.
     */
    public function getResumenTickets(string $fechaInicio, string $fechaFin): ?array {
        $pdo = Database::getConnection();
        
        $sql = "SELECT 
                    COUNT(id) AS total_tickets,
                    COALESCE(SUM(CASE WHEN estado_id = 4 THEN 1 ELSE 0 END), 0) AS resueltos,
                    COALESCE(SUM(CASE WHEN estado_id = 1 THEN 1 ELSE 0 END), 0) AS pendientes,
                    COALESCE(SUM(CASE WHEN estado_id = 2 THEN 1 ELSE 0 END), 0) AS en_curso,
                    COALESCE(SUM(CASE WHEN estado_id = 3 THEN 1 ELSE 0 END), 0) AS en_revision,
                    
                    COALESCE(SUM(CASE WHEN prioridad_id = 1 THEN 1 ELSE 0 END), 0) AS prioridad_baja,
                    COALESCE(SUM(CASE WHEN prioridad_id = 2 THEN 1 ELSE 0 END), 0) AS prioridad_media,
                    COALESCE(SUM(CASE WHEN prioridad_id = 3 THEN 1 ELSE 0 END), 0) AS prioridad_alta,
                    COALESCE(SUM(CASE WHEN prioridad_id = 4 THEN 1 ELSE 0 END), 0) AS prioridad_critica
                FROM tareas
                WHERE DATE(created_at) >= :inicio 
                  AND DATE(created_at) <= :fin
                  AND deleted_at IS NULL";

        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':inicio', $fechaInicio);
        $stmt->bindParam(':fin', $fechaFin);
        $stmt->execute();
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$result) {
            return null;
        }
        
        return [
            'total_tickets'     => (int)$result['total_tickets'],
            'resueltos'         => (int)$result['resueltos'],
            'pendientes'        => (int)$result['pendientes'],
            'en_curso'          => (int)$result['en_curso'],
            'en_revision'       => (int)$result['en_revision'],
            'prioridad_baja'    => (int)$result['prioridad_baja'],
            'prioridad_media'   => (int)$result['prioridad_media'],
            'prioridad_alta'    => (int)$result['prioridad_alta'],
            'prioridad_critica' => (int)$result['prioridad_critica'],
        ];
    }

    /**
     * Obtiene los problemas / títulos más frecuentes en un rango de fechas.
     * Ejecutado nativamente en backend para portabilidad total.
     */
    public function getProblemasFrecuentes(string $fechaInicio, string $fechaFin, int $limite = 10): array {
        $pdo = Database::getConnection();
        
        if ($limite <= 0) {
            $limite = 10;
        }

        $sql = "SELECT 
                    titulo,
                    COUNT(id) AS frecuencia,
                    COALESCE(SUM(CASE WHEN estado_id = 4 THEN 1 ELSE 0 END), 0) AS resueltos,
                    COALESCE(SUM(CASE WHEN estado_id IN (1, 2, 3) THEN 1 ELSE 0 END), 0) AS pendientes,
                    MIN(created_at) AS primera_ocurrencia,
                    MAX(created_at) AS ultima_ocurrencia
                FROM tareas
                WHERE DATE(created_at) >= :inicio 
                  AND DATE(created_at) <= :fin
                  AND deleted_at IS NULL
                GROUP BY titulo
                ORDER BY frecuencia DESC, ultima_ocurrencia DESC
                LIMIT :limite";

        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':inicio', $fechaInicio);
        $stmt->bindParam(':fin', $fechaFin);
        $stmt->bindValue(':limite', (int)$limite, PDO::PARAM_INT);
        $stmt->execute();
        
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return array_map(function($row) {
            return [
                'titulo'             => $row['titulo'],
                'frecuencia'         => (int)$row['frecuencia'],
                'resueltos'          => (int)$row['resueltos'],
                'pendientes'         => (int)$row['pendientes'],
                'primera_ocurrencia' => $row['primera_ocurrencia'],
                'ultima_ocurrencia'  => $row['ultima_ocurrencia'],
            ];
        }, $result ?: []);
    }
}
