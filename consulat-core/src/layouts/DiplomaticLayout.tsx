/**
 * Diplomatic Layout for entity-based routes
 * Shared layout for /ambassade/:id, /consulat/:id, /representation/:id
 */

import React from 'react';
import { Outlet, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth, EntityType } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    LayoutDashboard,
    FileText,
    Users,
    Calendar,
    BarChart3,
    Settings,
    LogOut,
    Sun,
    Moon,
    Bell,
    ChevronRight,
    Building2,
    Globe,
    Mail,
} from 'lucide-react';

// Entity type labels
const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
    ambassade: 'Ambassade',
    consulat_general: 'Consulat Général',
    consulat: 'Consulat',
    consulat_honoraire: 'Consulat Honoraire',
    delegation_permanente: 'Représentation Permanente',
};

// Entity type colors
const ENTITY_TYPE_COLORS: Record<EntityType, string> = {
    ambassade: 'bg-amber-500',
    consulat_general: 'bg-emerald-500',
    consulat: 'bg-blue-500',
    consulat_honoraire: 'bg-slate-500',
    delegation_permanente: 'bg-purple-500',
};

// Navigation items generator based on entity type
function getNavItems(entityType: EntityType, entityId: string) {
    const basePath = getEntityPath(entityType, entityId);

    const commonItems = [
        { path: basePath, icon: LayoutDashboard, label: 'Cockpit' },
        { path: `${basePath}/demandes`, icon: FileText, label: 'Demandes' },
        { path: `${basePath}/equipe`, icon: Users, label: 'Équipe' },
    ];

    // Add entity-specific items
    if (entityType === 'ambassade') {
        commonItems.push({ path: `${basePath}/consulats`, icon: Building2, label: 'Consulats rattachés' });
    }

    if (['consulat_general', 'consulat'].includes(entityType)) {
        commonItems.push({ path: `${basePath}/rendez-vous`, icon: Calendar, label: 'Rendez-vous' });
    }

    commonItems.push(
        { path: `${basePath}/stats`, icon: BarChart3, label: 'Statistiques' },
        { path: `${basePath}/boite`, icon: Mail, label: 'iBoîte' },
        { path: `${basePath}/parametres`, icon: Settings, label: 'Paramètres' }
    );

    return commonItems;
}

function getEntityPath(entityType: EntityType, entityId: string): string {
    const prefixes: Record<EntityType, string> = {
        ambassade: '/ambassade',
        consulat_general: '/consulat',
        consulat: '/consulat',
        consulat_honoraire: '/consulat',
        delegation_permanente: '/representation',
    };
    return `${prefixes[entityType]}/${entityId}`;
}

export default function DiplomaticLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { entityId } = useParams<{ entityId: string }>();
    const { user, logout } = useAuth();
    const [isDark, setIsDark] = React.useState(document.documentElement.classList.contains('dark'));

    const entityType = user?.entityType || 'consulat';
    const entityName = user?.entityName || 'Représentation Diplomatique';
    const navItems = getNavItems(entityType, entityId || '');

    const toggleTheme = () => {
        document.documentElement.classList.toggle('dark');
        setIsDark(!isDark);
    };

    const isActive = (path: string) => {
        const basePath = getEntityPath(entityType, entityId || '');
        if (path === basePath) {
            return location.pathname === basePath;
        }
        return location.pathname.startsWith(path);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
            {/* Sidebar */}
            <aside className="w-64 p-4 flex flex-col fixed h-screen bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
                {/* Entity Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 px-2 mb-3">
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center text-white",
                            ENTITY_TYPE_COLORS[entityType]
                        )}>
                            <Globe className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="font-bold text-sm truncate">{entityName}</h1>
                            <Badge variant="secondary" className="text-[10px] mt-1">
                                {ENTITY_TYPE_LABELS[entityType]}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);

                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                                    active
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{item.label}</span>
                                {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="pt-4 border-t border-border/50 space-y-3">
                    {/* User Info */}
                    <div className="flex items-center gap-3 px-2 py-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
                        </div>
                    </div>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                    >
                        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        <span>{isDark ? 'Mode clair' : 'Mode sombre'}</span>
                    </button>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64">
                {/* Top Bar */}
                <header className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <div>
                        <h2 className="text-lg font-semibold">
                            {navItems.find(item => isActive(item.path))?.label || 'Dashboard'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                                5
                            </span>
                        </Button>
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
