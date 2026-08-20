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
            echo json_encode([
                'success' => true,
                'data' => $data,
                'fecha_inicio' => $fechaInicio,
                'fecha_fin' => $fechaFin
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al generar reporte: ' . $e->getMessage()]);
        }
    }

    public function getFrecuentes() {
        $auth = AuthMiddleware::requireAdmin();

        $limite = isset($_GET['limite']) ? (int)$_GET['limite'] : 500;
        $fechaInicio = $_GET['fecha_inicio'] ?? date('Y-m-d', strtotime('-1 month'));
        $fechaFin = $_GET['fecha_fin'] ?? date('Y-m-d');

        try {
            $data = $this->model->getProblemasFrecuentes($fechaInicio, $fechaFin, $limite);
            echo json_encode([
                'success' => true,
                'data' => $data,
                'fecha_inicio' => $fechaInicio,
                'fecha_fin' => $fechaFin
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al generar reporte de frecuentes: ' . $e->getMessage()]);
        }
    }
}
