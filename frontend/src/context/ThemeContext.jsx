import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem("darkMode");
        return saved !== null ? saved === "true" : true;
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add("dark", "dark-mode");
            document.body.classList.add("dark", "dark-mode");
            document.documentElement.setAttribute("data-bs-theme", "dark");
        } else {
            document.documentElement.classList.remove("dark", "dark-mode");
            document.body.classList.remove("dark", "dark-mode");
            document.documentElement.setAttribute("data-bs-theme", "light");
        }
        localStorage.setItem("darkMode", isDarkMode);
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(prev => !prev);

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
