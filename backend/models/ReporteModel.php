<?php

class ReporteModel {

    /**
     * Resumen consolidado de tickets por estado, prioridad y métricas operativas.
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
                    COALESCE(SUM(CASE WHEN prioridad_id = 4 THEN 1 ELSE 0 END), 0) AS prioridad_critica,

                    COALESCE(SUM(CASE WHEN (prioridad_id IN (3, 4) AND estado_id IN (1, 2, 3)) THEN 1 ELSE 0 END), 0) AS criticos_abiertos,
                    COALESCE(SUM(CASE WHEN ((respuesta_admin IS NOT NULL AND TRIM(respuesta_admin) != '') OR EXISTS (SELECT 1 FROM tarea_respuestas tr WHERE tr.tarea_id = tareas.id)) THEN 1 ELSE 0 END), 0) AS con_respuesta,
                    COALESCE(SUM(CASE WHEN EXISTS (SELECT 1 FROM tarea_imagenes ti WHERE ti.tarea_id = tareas.id) THEN 1 ELSE 0 END), 0) AS con_imagenes,
                    ROUND(AVG(CASE WHEN estado_id = 4 THEN TIMESTAMPDIFF(HOUR, created_at, COALESCE(fecha_respuesta, updated_at)) ELSE NULL END), 1) AS tiempo_promedio_horas
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

        $totalTickets = (int)$result['total_tickets'];
        $conRespuesta = (int)$result['con_respuesta'];
        
        return [
            'total_tickets'          => $totalTickets,
            'resueltos'              => (int)$result['resueltos'],
            'pendientes'             => (int)$result['pendientes'],
            'en_curso'               => (int)$result['en_curso'],
            'en_revision'            => (int)$result['en_revision'],
            'prioridad_baja'         => (int)$result['prioridad_baja'],
            'prioridad_media'        => (int)$result['prioridad_media'],
            'prioridad_alta'         => (int)$result['prioridad_alta'],
            'prioridad_critica'      => (int)$result['prioridad_critica'],
            'criticos_abiertos'      => (int)$result['criticos_abiertos'],
            'con_respuesta'          => $conRespuesta,
            'sin_respuesta'          => max(0, $totalTickets - $conRespuesta),
            'cobertura_respuesta'    => $totalTickets > 0 ? round(($conRespuesta / $totalTickets) * 100, 1) : 0,
            'con_imagenes'           => (int)$result['con_imagenes'],
            'tiempo_promedio_horas'  => $result['tiempo_promedio_horas'] !== null ? (float)$result['tiempo_promedio_horas'] : null,
        ];
    }

    /**
     * Mapeo temporal día por día de tickets entrantes vs resueltos.
     */
    public function getTendenciaDiaria(string $fechaInicio, string $fechaFin): array {
        $pdo = Database::getConnection();

        $sql = "SELECT 
                    DATE(created_at) AS fecha,
                    COUNT(id) AS creados,
                    COALESCE(SUM(CASE WHEN estado_id = 4 THEN 1 ELSE 0 END), 0) AS resueltos,
                    COALESCE(SUM(CASE WHEN estado_id IN (1, 2, 3) THEN 1 ELSE 0 END), 0) AS pendientes
                FROM tareas
                WHERE DATE(created_at) >= :inicio 
                  AND DATE(created_at) <= :fin
                  AND deleted_at IS NULL
                GROUP BY DATE(created_at)
                ORDER BY fecha ASC";

        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':inicio', $fechaInicio);
        $stmt->bindParam(':fin', $fechaFin);
        $stmt->execute();

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
        $map = [];
        foreach ($rows as $r) {
            $map[$r['fecha']] = [
                'fecha'      => $r['fecha'],
                'creados'    => (int)$r['creados'],
                'resueltos'  => (int)$r['resueltos'],
                'pendientes' => (int)$r['pendientes'],
            ];
        }

        $diffDays = (strtotime($fechaFin) - strtotime($fechaInicio)) / 86400;
        $tendencia = [];

        // Rellenar días continuos si el rango es de 90 días o menos
        if ($diffDays >= 0 && $diffDays <= 90) {
            try {
                $periodo = new DatePeriod(
                    new DateTime($fechaInicio),
                    new DateInterval('P1D'),
                    (new DateTime($fechaFin))->modify('+1 day')
                );
                foreach ($periodo as $dt) {
                    $f = $dt->format('Y-m-d');
                    if (isset($map[$f])) {
                        $tendencia[] = $map[$f];
                    } else {
                        $tendencia[] = [
                            'fecha'      => $f,
                            'creados'    => 0,
                            'resueltos'  => 0,
                            'pendientes' => 0,
                        ];
                    }
                }
            } catch (Exception $e) {
                $tendencia = array_values($map);
            }
        } else {
            $tendencia = array_values($map);
        }

        return $tendencia;
    }

    /**
     * Ranking de usuarios solicitantes y demanda en el período.
     */
    public function getMapeoUsuarios(string $fechaInicio, string $fechaFin, int $limite = 25): array {
        $pdo = Database::getConnection();

        $sql = "SELECT 
                    u.id AS usuario_id,
                    u.email,
                    p.nombre,
                    p.apellido,
                    COUNT(t.id) AS total_tickets,
                    COALESCE(SUM(CASE WHEN t.estado_id = 4 THEN 1 ELSE 0 END), 0) AS resueltos,
                    COALESCE(SUM(CASE WHEN t.estado_id IN (1, 2, 3) THEN 1 ELSE 0 END), 0) AS pendientes,
                    MAX(t.created_at) AS ultimo_ticket
                FROM tareas t
                INNER JOIN usuarios u ON t.usuario_id = u.id
                LEFT JOIN personas p ON u.persona_id = p.id
                WHERE DATE(t.created_at) >= :inicio 
                  AND DATE(t.created_at) <= :fin
                  AND t.deleted_at IS NULL
                GROUP BY u.id, u.email, p.nombre, p.apellido
                ORDER BY total_tickets DESC, resueltos DESC
                LIMIT :limite";

        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':inicio', $fechaInicio);
        $stmt->bindParam(':fin', $fechaFin);
        $stmt->bindValue(':limite', (int)$limite, PDO::PARAM_INT);
        $stmt->execute();

        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(function($row) {
            $total = (int)$row['total_tickets'];
            $resueltos = (int)$row['resueltos'];
            $nombreCompleto = trim(($row['nombre'] ?? '') . ' ' . ($row['apellido'] ?? ''));
            if (empty($nombreCompleto)) {
                $nombreCompleto = $row['email'];
            }
            return [
                'usuario_id'       => (int)$row['usuario_id'],
                'email'            => $row['email'],
                'nombre_completo'  => $nombreCompleto,
                'total_tickets'    => $total,
                'resueltos'        => $resueltos,
                'pendientes'       => (int)$row['pendientes'],
                'porcentaje_exito' => $total > 0 ? round(($resueltos / $total) * 100, 1) : 0,
                'ultimo_ticket'    => $row['ultimo_ticket'],
            ];
        }, $result ?: []);
    }

    /**
     * Obtiene incidentes de alta prioridad o críticos que continúan abiertos.
     */
    public function getTicketsCriticosAbiertos(string $fechaInicio, string $fechaFin, int $limite = 15): array {
        $pdo = Database::getConnection();

        $sql = "SELECT 
                    t.id,
                    t.titulo,
                    t.created_at,
                    p.nombre AS prioridad_nombre,
                    t.prioridad_id,
                    e.nombre AS estado_nombre,
                    t.estado_id,
                    per.nombre,
                    per.apellido,
                    u.email,
                    TIMESTAMPDIFF(DAY, t.created_at, NOW()) AS dias_abierto
                FROM tareas t
                INNER JOIN prioridades p ON t.prioridad_id = p.id
                INNER JOIN estados e ON t.estado_id = e.id
                INNER JOIN usuarios u ON t.usuario_id = u.id
                LEFT JOIN personas per ON u.persona_id = per.id
                WHERE DATE(t.created_at) >= :inicio 
                  AND DATE(t.created_at) <= :fin
                  AND t.deleted_at IS NULL
                  AND t.prioridad_id IN (3, 4)
                  AND t.estado_id IN (1, 2, 3)
                ORDER BY t.prioridad_id DESC, t.created_at ASC
                LIMIT :limite";

        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':inicio', $fechaInicio);
        $stmt->bindParam(':fin', $fechaFin);
        $stmt->bindValue(':limite', (int)$limite, PDO::PARAM_INT);
        $stmt->execute();

        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(function($row) {
            $nombreCompleto = trim(($row['nombre'] ?? '') . ' ' . ($row['apellido'] ?? ''));
            if (empty($nombreCompleto)) {
                $nombreCompleto = $row['email'];
            }
            return [
                'id'               => (int)$row['id'],
                'titulo'           => $row['titulo'],
                'created_at'       => $row['created_at'],
                'prioridad_id'     => (int)$row['prioridad_id'],
                'prioridad_nombre' => $row['prioridad_nombre'],
                'estado_id'        => (int)$row['estado_id'],
                'estado_nombre'    => $row['estado_nombre'],
                'solicitante'      => $nombreCompleto,
                'email'            => $row['email'],
                'dias_abierto'     => (int)$row['dias_abierto'],
            ];
        }, $result ?: []);
    }

    /**
     * Obtiene los problemas / títulos más frecuentes en un rango de fechas.
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
