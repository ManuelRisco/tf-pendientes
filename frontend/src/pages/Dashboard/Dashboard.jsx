import { useDashboard } from "./useDashboard";
import ActividadReciente from "./components/ActividadReciente";
import DashboardMetrics from "./components/DashboardMetrics";
import DashboardCharts from "./components/DashboardCharts";
import DashboardHeader from "./components/DashboardHeader";

export default function Dashboard() {
    const dashHook = useDashboard();
    const {
        loading,
        isUpdating,
        total,
        estados,
        prioridades,
        estadoColors,
        prioridadColors,
        totalUsuarios,
        actividadReciente,
        filtroAlcance,
        filtroUsuarioId,
        getTimeAgo,
        refreshDashboard,
        user
    } = dashHook;

    const isAdmin = Number(user?.rol_id) === 1;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="spinner-border text-blue-600 mr-3" role="status"></div>
                <span className="font-medium text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>Cargando dashboard...</span>
            </div>
        );
    }

    const finalizadasCount = estados.find(e => e.nombre === 'Finalizado' || e.nombre === 'Completada')?.cantidad || 0;
    const enProgresoCount = Math.max(0, total - finalizadasCount);
    const completionRate = total > 0 ? Math.round((finalizadasCount / total) * 100) : 0;

    return (
        <div className="py-1 sm:py-4 px-0 sm:px-2 max-w-7xl mx-auto space-y-5 sm:space-y-6">
            <DashboardHeader {...dashHook} isAdmin={isAdmin} />

            <DashboardMetrics
                total={total}
                enProgresoCount={enProgresoCount}
                finalizadasCount={finalizadasCount}
                completionRate={completionRate}
                totalUsuarios={totalUsuarios}
                isAdmin={isAdmin}
                isUpdating={isUpdating}
                filtroAlcance={filtroAlcance}
                filtroUsuarioId={filtroUsuarioId}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
                <div className="lg:col-span-5 xl:col-span-5">
                    <DashboardCharts
                        estados={estados}
                        prioridades={prioridades}
                        total={total}
                        estadoColors={estadoColors}
                        prioridadColors={prioridadColors}
                    />
                </div>

                <div className="lg:col-span-7 xl:col-span-7">
                    <ActividadReciente
                        actividadReciente={actividadReciente}
                        isUpdating={isUpdating}
                        onRefresh={refreshDashboard}
                        getTimeAgo={getTimeAgo}
                        isAdmin={isAdmin}
                    />
                </div>
            </div>
        </div>
    );
}
