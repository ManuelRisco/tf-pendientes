import { Link } from "react-router-dom";

function NotFound() {
    return (
        <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
            <div className="card-app p-8 text-center max-w-md w-full">
                <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-6 text-4xl">
                    <i className="bi bi-compass"></i>
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">Error 404</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                    La página que estás buscando no existe o ha sido movida a otra sección.
                </p>
                <Link 
                    to="/dashboard" 
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-500/20 transition-all no-underline"
                >
                    <i className="bi bi-house-door"></i>
                    <span>Volver al inicio</span>
                </Link>
            </div>
        </div>
    );
}

export default NotFound;