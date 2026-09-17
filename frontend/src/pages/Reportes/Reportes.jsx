import { useNavigate } from 'react-router-dom';
import { useReportes } from './useReportes';
import ReportesFilters from './components/ReportesFilters';
import ReportesMetrics from './components/ReportesMetrics';
import ReportesCharts from './components/ReportesCharts';
import ReportesCriticosTable from './components/ReportesCriticosTable';
import ReportesDemandaTable from './components/ReportesDemandaTable';

export default function Reportes() {
    const navigate = useNavigate();
    const repHook = useReportes();
    const { resumen, loading } = repHook;

    if (loading && !resumen) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="spinner-border text-blue-600" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            <ReportesFilters {...repHook} />
            <ReportesMetrics {...repHook} />
            <ReportesCharts {...repHook} />
            <ReportesCriticosTable
                {...repHook}
                onNavigateToTask={(id) => navigate(`/gestion-tareas?id=${id}`)}
            />
            <ReportesDemandaTable {...repHook} />
        </div>
    );
}
