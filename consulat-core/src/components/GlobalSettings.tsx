import { Moon, Sun, Globe } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "react-i18next";

export function GlobalSettings() {
    const { t } = useTranslation();
    const { setTheme, theme } = useTheme();
    const { currentLanguage, availableLanguages, setLanguage } = useLanguage();

    return (
        <div className="flex items-center gap-2">
            {/* Language Selector */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full w-9 h-9">
                        <span className="sr-only">{t('settings.language')}</span>
                        <span className="text-lg leading-none">{currentLanguage.flag}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {availableLanguages.map((lang) => (
                        <DropdownMenuItem key={lang.code} onClick={() => setLanguage(lang.code)}>
                            <span className="mr-2 text-lg">{lang.flag}</span>
                            {lang.name}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-9 h-9"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">{t('settings.theme')}</span>
            </Button>
        </div>
    );
}
