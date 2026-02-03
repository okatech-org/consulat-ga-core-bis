import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type LanguageCode = 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt' | 'ar' | 'zh' | 'ru';

export interface Language {
    code: LanguageCode;
    name: string;
    flag: string;
}

interface LanguageContextType {
    currentLanguage: Language;
    availableLanguages: Language[];
    setLanguage: (code: LanguageCode) => void;
    isLoading: boolean;
}

const LANGUAGES: Record<LanguageCode, Language> = {
    fr: { code: 'fr', name: 'Français', flag: '🇫🇷' },
    en: { code: 'en', name: 'English', flag: '🇬🇧' },
    es: { code: 'es', name: 'Español', flag: '🇪🇸' },
    de: { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    it: { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    pt: { code: 'pt', name: 'Português', flag: '🇵🇹' },
    ar: { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    zh: { code: 'zh', name: '中文', flag: '🇨🇳' },
    ru: { code: 'ru', name: 'Русский', flag: '🇷🇺' },
};

// Mapping country codes to languages
const COUNTRY_LANGUAGE_MAP: Record<string, LanguageCode> = {
    'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es', // Spanish
    'DE': 'de', 'AT': 'de', 'CH': 'de', // German
    'IT': 'it', // Italian
    'PT': 'pt', 'BR': 'pt', // Portuguese
    'SA': 'ar', 'AE': 'ar', 'EG': 'ar', // Arabic
    'CN': 'zh', // Chinese
    'RU': 'ru', // Russian
    'US': 'en', 'GB': 'en', 'AU': 'en', 'CA': 'en', // English
    'FR': 'fr', 'GA': 'fr', // French
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const { i18n } = useTranslation();
    const [currentLanguage, setCurrentLanguage] = useState<Language>(LANGUAGES.fr);
    const [availableLanguages, setAvailableLanguages] = useState<Language[]>([LANGUAGES.fr, LANGUAGES.en]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const detectPreferredLanguage = () => {
            try {
                // Use browser language only to avoid external IP-based services (CORS / rate limits)
                const browserLang = navigator.language.split('-')[0] as LanguageCode;

                let newAvailableLanguages: Language[] = [LANGUAGES.fr, LANGUAGES.en];

                if (LANGUAGES[browserLang] && browserLang !== 'fr' && browserLang !== 'en') {
                    newAvailableLanguages.push(LANGUAGES[browserLang]);
                }

                setAvailableLanguages(newAvailableLanguages);
            } catch (error) {
                console.error('Failed to detect browser language:', error);
            } finally {
                setIsLoading(false);
            }
        };

        detectPreferredLanguage();
    }, []);
    const setLanguage = (code: LanguageCode) => {
        if (LANGUAGES[code]) {
            setCurrentLanguage(LANGUAGES[code]);
            i18n.changeLanguage(code);
            document.documentElement.lang = code;
        }
    };

    return (
        <LanguageContext.Provider value={{ currentLanguage, availableLanguages, setLanguage, isLoading }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
