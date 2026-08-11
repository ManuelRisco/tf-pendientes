function Equipos() {
    return (
        <div className="py-6 px-2 sm:px-4">
            <div className="card-app p-8 text-center max-w-xl mx-auto my-12">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 text-3xl">
                    <i className="bi bi-tools"></i>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    Módulo de Equipos
                </h2>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 mb-4">
                    Próximamente
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
                    Aquí se mostrarán los equipos asignados a los usuarios, control de inventario y estado técnico de los dispositivos.
                </p>
            </div>
        </div>
    );
}

export default Equipos;