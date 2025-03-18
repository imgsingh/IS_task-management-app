// src/contexts/ThemeContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        const storedTheme = localStorage.getItem('appTheme');
        if (storedTheme) {
            return storedTheme;
        }
        return 'system'; // Default to system
    });

    const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const toggleTheme = useCallback(() => {
        setTheme((prevTheme) => {
            const newTheme = prevTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('appTheme', newTheme);
            return newTheme;
        });
    }, []);

    const enableLightTheme = useCallback(() => {
        setTheme('light');
        localStorage.setItem('appTheme', 'light');
    }, []);

    const enableDarkTheme = useCallback(() => {
        setTheme('dark');
        localStorage.setItem('appTheme', 'dark');
    }, []);

    const enableSystemTheme = useCallback(() => {
        setTheme('system');
        localStorage.setItem('appTheme', 'system');
    }, []);

    useEffect(() => {
        localStorage.setItem('appTheme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider
            value={{
                theme,
                isDarkMode,
                toggleTheme,
                enableLightTheme,
                enableDarkTheme,
                enableSystemTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};