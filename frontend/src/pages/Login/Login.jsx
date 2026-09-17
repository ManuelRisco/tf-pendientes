import { useLogin } from './useLogin';

function Login() {
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
        error,
        handleSubmit,
        handleSwitchMode
    } = useLogin();

    return (
        <div className="min-h-screen flex items-center justify-center py-6 sm:py-12 px-3 sm:px-6 lg:px-8 transition-colors duration-300" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div 
                className="max-w-md w-full space-y-6 sm:space-y-8 p-5 sm:p-8 rounded-2xl shadow-xl border transition-colors"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
            >
                <div className="flex border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <button
                        type="button"
                        className={`w-1/2 py-2.5 sm:py-3 font-semibold text-xs sm:text-sm text-center transition-colors ${!isRegistering ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 font-bold' : 'hover:opacity-80'}`}
                        style={{ color: !isRegistering ? '#2563eb' : 'var(--text-secondary)' }}
                        onClick={() => handleSwitchMode(false)}
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        type="button"
                        className={`w-1/2 py-2.5 sm:py-3 font-semibold text-xs sm:text-sm text-center transition-colors ${isRegistering ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 font-bold' : 'hover:opacity-80'}`}
                        style={{ color: isRegistering ? '#2563eb' : 'var(--text-secondary)' }}
                        onClick={() => handleSwitchMode(true)}
                    >
                        Crear Cuenta
                    </button>
                </div>

                <div>
                    <h2 className="mt-1 sm:mt-2 text-center text-xl sm:text-2xl md:text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                        {isRegistering ? "Crea tu cuenta" : "Bienvenido de nuevo"}
                    </h2>
                    <p className="mt-1 text-center text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {isRegistering ? "Ingresa tus datos para comenzar" : "Inicia sesión para continuar en el sistema"}
                    </p>
                </div>

                <form className="mt-4 sm:mt-6 space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-500/10 text-red-500 border border-red-500/20 p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm text-center font-medium">
                            {error}
                        </div>
                    )}
                    
                    <div className="space-y-3 sm:space-y-4">
                        {isRegistering && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                                        Nombre
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border focus:outline-none"
                                        style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                                        placeholder="Tu nombre"
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
                                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border focus:outline-none"
                                        style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                                        placeholder="Tu apellido"
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
                                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border focus:outline-none"
                                style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                                Contraseña
                            </label>
                            <input
                                type="password"
                                required
                                minLength="6"
                                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border focus:outline-none"
                                style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-1">
                        <button
                            type="submit"
                            className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 focus:outline-none transition-all active:scale-95 cursor-pointer"
                        >
                            {isRegistering ? "Registrarse" : "Ingresar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
