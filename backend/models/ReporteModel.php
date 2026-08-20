<?php

use Illuminate\Database\Capsule\Manager as Capsule;

class ReporteModel {

    /**
     * Llama al SP sp_generar_reporte_tickets
     */
    public function getResumenTickets(string $fechaInicio, string $fechaFin): ?array {
        $pdo = Database::getConnection();
        
        $stmt = $pdo->prepare("CALL sp_generar_reporte_tickets(:inicio, :fin)");
        $stmt->bindParam(':inicio', $fechaInicio);
        $stmt->bindParam(':fin', $fechaFin);
        $stmt->execute();
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $stmt->closeCursor(); // Importante para liberar la conexión después de un SP

        if (!$result) {
            return null;
        }
        
        // Formatear numéricamente
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
     * Llama al SP sp_reporte_problemas_frecuentes
     */
    public function getProblemasFrecuentes(string $fechaInicio, string $fechaFin, int $limite = 10): array {
        $pdo = Database::getConnection();
        
        $stmt = $pdo->prepare("CALL sp_reporte_problemas_frecuentes(:inicio, :fin, :limite)");
        $stmt->bindParam(':inicio', $fechaInicio);
        $stmt->bindParam(':fin', $fechaFin);
        $stmt->bindParam(':limite', $limite, PDO::PARAM_INT);
        $stmt->execute();
        
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stmt->closeCursor();
        
        return $result ?: [];
    }
}
