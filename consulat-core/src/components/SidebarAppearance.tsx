import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export function SidebarAppearance() {
    const { t } = useTranslation();
    const { setTheme, theme } = useTheme();
    const { currentLanguage, availableLanguages, setLanguage } = useLanguage();

    return (
        <div className="flex items-center justify-between w-full bg-muted/30 p-1.5 rounded-lg border border-border/50">
            {/* Language Selector */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-2 gap-2 hover:bg-background/80">
                        <span className="text-lg leading-none">{currentLanguage.flag}</span>
                        <span className="text-xs font-medium text-muted-foreground">{currentLanguage.code.toUpperCase()}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[150px]">
                    {availableLanguages.map((lang) => (
                        <DropdownMenuItem
                            key={lang.code}
                            onClick={() => setLanguage(lang.code)}
                            className="gap-2"
                        >
                            <span className="text-lg">{lang.flag}</span>
                            <span className="flex-1">{lang.name}</span>
                            {currentLanguage.code === lang.code && (
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            )}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle Segmented Control */}
            <div className="flex items-center bg-background/50 rounded-md border border-border/50 p-0.5">
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-7 w-7 rounded-sm transition-all",
                        theme === "light"
                            ? "bg-background shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setTheme("light")}
                >
                    <Sun className="h-3.5 w-3.5" />
                    <span className="sr-only">{t('settings.light')}</span>
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-7 w-7 rounded-sm transition-all",
                        theme === "dark"
                            ? "bg-background shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setTheme("dark")}
                >
                    <Moon className="h-3.5 w-3.5" />
                    <span className="sr-only">{t('settings.dark')}</span>
                </Button>
            </div>
        </div>
    );
}
