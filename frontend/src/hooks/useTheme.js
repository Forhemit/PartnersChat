import { useState, useEffect } from 'react';
import { getInitialTheme, applyTheme } from '../utils/theme';

export const useTheme = () => {
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        applyTheme(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return { theme, toggleTheme, setTheme };
};
