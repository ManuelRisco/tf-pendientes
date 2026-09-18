import { useState } from 'react';
import { useLogin } from './useLogin';
import { useTheme } from '../../context/ThemeContext';

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { isDarkMode, toggleTheme } = useTheme();
    const {
        isRegistering,
        nombre,
        setNombre,
        apellido,
        setApellido,
        email,
        setEmail,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        error,
        loading,
        handleSubmit,
        handleSwitchMode
    } = useLogin();

    return (
        <div className="min-h-screen flex items-center justify-center py-6 sm:py-12 px-3 sm:px-6 lg:px-8 transition-colors duration-300 relative" style={{ backgroundColor: 'var(--bg-primary)' }}>
            {/* Selector Flotante de Tema en Login */}
            <div className="absolute top-4 right-4 z-10">
                <button
                    type="button"
                    onClick={toggleTheme}
                    className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-500/10 transition-all active:scale-95 border cursor-pointer shadow-xs"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    title={isDarkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
                    aria-label="Alternar tema"
                >
                    {isDarkMode ? (
                        <i className="bi bi-sun text-amber-400 text-base"></i>
                    ) : (
                        <i className="bi bi-moon-stars text-slate-700 text-base"></i>
                    )}
                </button>
            </div>

            <div
                className="max-w-md w-full space-y-5 sm:space-y-6 p-5 sm:p-8 rounded-2xl shadow-xl border transition-colors"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
            >
                {/* Cabecera de Marca */}
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl border border-blue-200 dark:border-blue-900/50 shadow-xs mb-2.5">
                        <i className="bi bi-buildings" aria-hidden="true"></i>
                    </div>
                    <div className="text-xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                        Tecno<span className="text-blue-600">film</span>
                    </div>
                    <h2 className="mt-1.5 text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                        {isRegistering ? "Crea tu cuenta" : "Bienvenido de nuevo"}
                    </h2>
                    <p className="mt-0.5 text-xs sm:text-sm mb-0" style={{ color: 'var(--text-secondary)' }}>
                        {isRegistering ? "Ingresa tus datos para comenzar" : "Inicia sesión para continuar en el sistema"}
                    </p>
                </div>

                {/* Pestañas Modernas de Navegación */}
                <div className="flex p-1 rounded-xl border text-xs sm:text-sm font-semibold" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                    <button
                        type="button"
                        className={`w-1/2 py-2 rounded-lg font-semibold text-center transition-all cursor-pointer active:scale-98 ${
                            !isRegistering
                                ? 'bg-blue-600 text-white shadow-xs font-bold'
                                : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{ color: !isRegistering ? '#fff' : 'var(--text-secondary)' }}
                        onClick={() => handleSwitchMode(false)}
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        type="button"
                        className={`w-1/2 py-2 rounded-lg font-semibold text-center transition-all cursor-pointer active:scale-98 ${
                            isRegistering
                                ? 'bg-blue-600 text-white shadow-xs font-bold'
                                : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{ color: isRegistering ? '#fff' : 'var(--text-secondary)' }}
                        onClick={() => handleSwitchMode(true)}
                    >
                        Crear Cuenta
                    </button>
                </div>

                <form className="space-y-4 sm:space-y-4.5" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-500/10 text-red-500 border border-red-500/20 p-2.5 sm:p-3 rounded-xl text-xs sm:text-sm text-center font-medium flex items-center justify-center gap-2">
                            <i className="bi bi-exclamation-circle-fill shrink-0"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-3 sm:space-y-3.5">
                        {isRegistering && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                                        Nombre
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                                        style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                                        placeholder="Manuel Fabrizzio"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                                        Apellido
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                                        style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                                        placeholder="Risco Gil"
                                        value={apellido}
                                        onChange={(e) => setApellido(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                                Correo Electrónico
                            </label>
                            <input
                                type="email"
                                required
                                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                                style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                                placeholder="practicantesistemas@tecnofilm.pe"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                                Contraseña
                            </label>
                            <div className="relative flex items-center">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength="6"
                                    className="w-full pl-3 pr-10 py-2 text-xs sm:text-sm rounded-xl border focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                                    style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 text-sm opacity-60 hover:opacity-100 transition-opacity bg-transparent border-0 cursor-pointer p-0"
                                    style={{ color: 'var(--text-secondary)' }}
                                    title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                                    aria-label="Alternar visibilidad de contraseña"
                                >
                                    <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                                </button>
                            </div>
                        </div>

                        {isRegistering && (
                            <div className="animate-fade-in">
                                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                                    Confirmar Contraseña
                                </label>
                                <div className="relative flex items-center">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        minLength="6"
                                        className="w-full pl-3 pr-10 py-2 text-xs sm:text-sm rounded-xl border focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                                        style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                                        placeholder="•••••••• (repite tu contraseña)"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 text-sm opacity-60 hover:opacity-100 transition-opacity bg-transparent border-0 cursor-pointer p-0"
                                        style={{ color: 'var(--text-secondary)' }}
                                        title={showConfirmPassword ? "Ocultar confirmación" : "Ver confirmación"}
                                        aria-label="Alternar visibilidad de confirmación de contraseña"
                                    >
                                        <i className={`bi ${showConfirmPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 focus:outline-none transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading && (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            )}
                            <span>{loading ? "Procesando..." : (isRegistering ? "Registrarse" : "Ingresar")}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
