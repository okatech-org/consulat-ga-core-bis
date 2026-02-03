import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserSpaceTheme = 'classic' | 'idn' | 'minimal';

interface ThemeStyleContextType {
    userSpaceTheme: UserSpaceTheme;
    setUserSpaceTheme: (theme: UserSpaceTheme) => void;
}

const ThemeStyleContext = createContext<ThemeStyleContextType | undefined>(undefined);

const STORAGE_KEY = 'user-space-theme';

export function ThemeStyleProvider({ children }: { children: ReactNode }) {
    const [userSpaceTheme, setUserSpaceThemeState] = useState<UserSpaceTheme>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored && ['classic', 'idn', 'minimal'].includes(stored)) {
                return stored as UserSpaceTheme;
            }
        }
        return 'classic';
    });

    const setUserSpaceTheme = (theme: UserSpaceTheme) => {
        setUserSpaceThemeState(theme);
        localStorage.setItem(STORAGE_KEY, theme);
        // Update body class for CSS targeting
        document.body.classList.remove('theme-classic', 'theme-idn', 'theme-minimal');
        document.body.classList.add(`theme-${theme}`);
    };

    useEffect(() => {
        // Apply initial theme class
        document.body.classList.add(`theme-${userSpaceTheme}`);
        return () => {
            document.body.classList.remove('theme-classic', 'theme-idn', 'theme-minimal');
        };
    }, []);

    return (
        <ThemeStyleContext.Provider value={{ userSpaceTheme, setUserSpaceTheme }}>
            {children}
        </ThemeStyleContext.Provider>
    );
}

export function useThemeStyle() {
    const context = useContext(ThemeStyleContext);
    if (!context) {
        throw new Error('useThemeStyle must be used within a ThemeStyleProvider');
    }
    return context;
}

// Theme metadata for UI display
export const THEME_OPTIONS: { id: UserSpaceTheme; name: string; description: string; preview: string }[] = [
    {
        id: 'classic',
        name: 'Classique',
        description: 'Design sobre et professionnel',
        preview: '🏛️',
    },
    {
        id: 'idn',
        name: 'IDN.ga',
        description: 'Glassmorphism moderne avec effets de glow',
        preview: '✨',
    },
    {
        id: 'minimal',
        name: 'Minimal',
        description: 'Interface épurée et légère',
        preview: '🪶',
    },
];
