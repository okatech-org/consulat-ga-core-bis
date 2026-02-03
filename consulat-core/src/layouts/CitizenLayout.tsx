/**
 * Citizen Layout for /me/* routes
 * Themed layout for citizen user space
 */

import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useThemeStyle } from '@/context/ThemeStyleContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    LayoutDashboard,
    FileText,
    ClipboardList,
    FolderOpen,
    Mail,
    Briefcase,
    Users,
    Building2,
    UserPlus,
    Settings,
    LogOut,
    Sun,
    Moon,
    Bell,
    ChevronRight,
} from 'lucide-react';

// Navigation items for citizen
const NAV_ITEMS = [
    { path: '/me', icon: LayoutDashboard, label: 'iProfil' },
    { path: '/me/demarches', icon: FileText, label: 'Démarches' },
    { path: '/me/timeline', icon: ClipboardList, label: 'Suivi Timeline' },
    { path: '/me/documents', icon: FolderOpen, label: 'iDocuments' },
    { path: '/me/boite', icon: Mail, label: 'iBoîte' },
    { path: '/me/cv', icon: Briefcase, label: 'iCV' },
    { path: '/me/enfants', icon: Users, label: 'Enfants' },
    { path: '/me/entreprises', icon: Building2, label: 'Entreprises' },
    { path: '/me/associations', icon: UserPlus, label: 'Associations' },
    { path: '/me/parametres', icon: Settings, label: 'Paramètres' },
];

export default function CitizenLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { userSpaceTheme } = useThemeStyle();
    const { user, logout } = useAuth();
    const [isDark, setIsDark] = React.useState(document.documentElement.classList.contains('dark'));

    const isIDN = userSpaceTheme === 'idn';

    const toggleTheme = () => {
        document.documentElement.classList.toggle('dark');
        setIsDark(!isDark);
    };

    const isActive = (path: string) => {
        if (path === '/me') {
            return location.pathname === '/me';
        }
        return location.pathname.startsWith(path);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className={cn(
            "min-h-screen flex",
            isIDN
                ? "bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
                : "bg-background"
        )}>
            {/* Sidebar */}
            <aside className={cn(
                "w-64 p-4 flex flex-col fixed h-screen",
                isIDN
                    ? "bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-r border-white/20"
                    : "bg-card border-r"
            )}>
                {/* Logo */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold">
                            C
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">Consulat.ga</h1>
                            <p className="text-xs text-muted-foreground">Mon Espace</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);

                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                                    active
                                        ? isIDN
                                            ? "bg-primary/10 text-primary font-semibold"
                                            : "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{item.label}</span>
                                {active && (
                                    <ChevronRight className="w-4 h-4 ml-auto" />
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="pt-4 border-t border-border/50 space-y-3">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                    >
                        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        <span>{isDark ? 'Mode clair' : 'Mode sombre'}</span>
                    </button>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64">
                {/* Top Bar */}
                <header className={cn(
                    "sticky top-0 z-10 px-6 py-4 flex items-center justify-between",
                    isIDN
                        ? "bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-b border-white/20"
                        : "bg-background border-b"
                )}>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Bienvenue, <span className="font-semibold text-foreground">{user?.firstName || 'Utilisateur'}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                                3
                            </span>
                        </Button>

                        {/* User Avatar */}
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={user?.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                                {user?.firstName?.charAt(0) || 'U'}{user?.lastName?.charAt(0) || ''}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
