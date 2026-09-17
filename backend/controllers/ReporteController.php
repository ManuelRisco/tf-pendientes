<?php

class ReporteController {
    
    private ReporteModel $model;

    public function __construct() {
        $this->model = new ReporteModel();
    }

    public function getResumen() {
        $auth = AuthMiddleware::requireAdmin();

        $fechaInicio = $_GET['fecha_inicio'] ?? date('Y-m-d', strtotime('-1 month'));
        $fechaFin = $_GET['fecha_fin'] ?? date('Y-m-d');

        try {
            $data = $this->model->getResumenTickets($fechaInicio, $fechaFin);
            $tendencia = $this->model->getTendenciaDiaria($fechaInicio, $fechaFin);
            $mapeoUsuarios = $this->model->getMapeoUsuarios($fechaInicio, $fechaFin, 30);
            $criticosAbiertos = $this->model->getTicketsCriticosAbiertos($fechaInicio, $fechaFin, 15);

            $payload = array_merge($data ?: [], [
                'tendencia_diaria'     => $tendencia,
                'mapeo_usuarios'       => $mapeoUsuarios,
                'criticos_pendientes'  => $criticosAbiertos,
            ]);

            echo json_encode([
                'success' => true,
                'data' => $payload,
                'fecha_inicio' => $fechaInicio,
                'fecha_fin' => $fechaFin
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al generar reporte: ' . $e->getMessage()]);
        }
    }
}
