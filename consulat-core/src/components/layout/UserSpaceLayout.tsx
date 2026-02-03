import React, { useState } from 'react';
import { Sun, Moon, Settings, LogOut, LayoutDashboard, FileText, Users, Shield, Bell, Home, FolderOpen, ClipboardList, Building2, Mail, Briefcase, UserPlus, CreditCard } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useThemeStyle } from '@/context/ThemeStyleContext';

interface UserSpaceLayoutProps {
    children: React.ReactNode;
    showSidebar?: boolean;
    userType?: 'citizen' | 'foreigner' | 'admin';
}

export default function UserSpaceLayout({
    children,
    showSidebar = true,
    userType = 'citizen'
}: UserSpaceLayoutProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const { userSpaceTheme } = useThemeStyle();
    const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

    const toggleTheme = () => {
        document.documentElement.classList.toggle('dark');
        setIsDark(!isDark);
    };

    const isActive = (path: string) => location.pathname === path || (path !== '/dashboard/citizen' && location.pathname.startsWith(path));

    // Navigation items based on user type - Consistent menu for all themes
    const navItems = userType === 'citizen' ? [
        { path: '/dashboard/citizen', icon: LayoutDashboard, label: 'iProfil' },
        { path: '/dashboard/citizen/services', icon: FileText, label: 'Démarches' },
        { path: '/dashboard/citizen/timeline', icon: ClipboardList, label: 'Suivi Timeline' },
        { path: '/dashboard/citizen/documents', icon: FolderOpen, label: 'iDocuments' },
        { path: '/dashboard/citizen/boite', icon: Mail, label: 'iBoîte' },
        { path: '/dashboard/citizen/companies', icon: Building2, label: 'Entreprises' },
        { path: '/dashboard/citizen/associations', icon: UserPlus, label: 'Associations' },
        { path: '/dashboard/citizen/settings', icon: Settings, label: 'Paramètres' },
    ] : [
        { path: '/dashboard/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/dashboard/admin/requests', icon: ClipboardList, label: 'Demandes' },
        { path: '/dashboard/admin/users', icon: Users, label: 'Utilisateurs' },
        { path: '/dashboard/admin/settings', icon: Settings, label: 'Paramètres' },
    ];

    // Render based on theme
    if (userSpaceTheme === 'idn') {
        return (
            <div className="min-h-screen bg-background p-4 md:p-6 transition-colors duration-300">
                <div className="flex gap-6 max-w-[1600px] mx-auto relative">

                    {/* IDN STYLE SIDEBAR (Glassmorphism) */}
                    {showSidebar && (
                        <aside className="hidden md:flex flex-col w-64 glass-card h-[calc(100vh-3rem)] sticky top-6 overflow-hidden border border-white/20">
                            {/* Logo */}
                            <div className="flex items-center gap-4 p-6 cursor-pointer border-b border-white/10" onClick={() => navigate('/')}>
                                <div className="glass w-12 h-12 rounded-2xl flex items-center justify-center p-2 text-primary shadow-glow-primary/50">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="font-bold text-md tracking-wider">Consulat.ga</div>
                                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Espace Citoyen</div>
                                </div>
                            </div>

                            {/* Navigation */}
                            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                                {navItems.map((item) => (
                                    <button
                                        key={item.path}
                                        onClick={() => navigate(item.path)}
                                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 group
                                            ${isActive(item.path)
                                                ? 'bg-primary/20 text-primary shadow-glow-primary/30 translate-x-1'
                                                : 'hover:bg-white/5 hover:translate-x-1 text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'}`} />
                                        {item.label}
                                        {isActive(item.path) && (
                                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-glow-primary animate-pulse" />
                                        )}
                                    </button>
                                ))}
                            </nav>

                            {/* Footer Sidebar */}
                            <div className="p-4 border-t border-white/10 space-y-2 bg-black/5">
                                <button
                                    onClick={toggleTheme}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium hover:bg-white/5 transition-all"
                                >
                                    {isDark ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                                    {isDark ? 'Mode clair' : 'Mode sombre'}
                                </button>
                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium text-destructive hover:bg-destructive/10 transition-all"
                                >
                                    <LogOut className="w-4 h-4" /> Déconnexion
                                </button>
                            </div>
                        </aside>
                    )}

                    {/* MAIN CONTENT (Glassmorphic) */}
                    <main className="flex-1 min-w-0 mb-20 md:mb-0 relative">
                        <div className="glass-card p-6 md:p-10 min-h-[calc(100vh-3rem)] relative overflow-hidden backdrop-blur-xl border border-white/10">
                            {/* Decorative Glow */}
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 blur-[120px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2" />

                            <div className="relative z-10">
                                {children}
                            </div>
                        </div>
                    </main>

                    {/* MOBILE BOTTOM NAV */}
                    {showSidebar && (
                        <div className="fixed bottom-0 left-0 right-0 md:hidden z-40">
                            <div className="bg-background/95 backdrop-blur-md border-t border-white/20 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-safe">
                                <div className="flex justify-around items-center px-4 h-16">
                                    {navItems.slice(0, 5).map((item) => (
                                        <button
                                            key={item.path}
                                            onClick={() => navigate(item.path)}
                                            className={`flex flex-col items-center justify-center space-y-1 p-2 ${isActive(item.path) ? 'text-primary' : 'text-muted-foreground'}`}
                                        >
                                            <item.icon size={22} strokeWidth={isActive(item.path) ? 2.5 : 2} />
                                            {isActive(item.path) && <span className="w-1 h-1 bg-primary rounded-full" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Classic theme (default)
    return (
        <div className="min-h-screen bg-background">
            <div className="flex">
                {/* Classic Sidebar */}
                {showSidebar && (
                    <aside className="hidden md:flex flex-col w-64 bg-card border-r h-screen sticky top-0">
                        <div className="p-6 border-b">
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold">Consulat.ga</div>
                                    <div className="text-xs text-muted-foreground">Espace Citoyen</div>
                                </div>
                            </div>
                        </div>

                        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                            {navItems.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors
                                        ${isActive(item.path)
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </button>
                            ))}
                        </nav>

                        <div className="p-4 border-t space-y-1">
                            <button
                                onClick={toggleTheme}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm hover:bg-muted transition-colors"
                            >
                                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                {isDark ? 'Mode clair' : 'Mode sombre'}
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
                            >
                                <LogOut className="w-5 h-5" /> Déconnexion
                            </button>
                        </div>
                    </aside>
                )}

                {/* Main Content */}
                <main className="flex-1 p-6 md:p-8">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Nav */}
            {showSidebar && (
                <div className="fixed bottom-0 left-0 right-0 md:hidden bg-card border-t z-40">
                    <div className="flex justify-around items-center h-16">
                        {navItems.slice(0, 5).map((item) => (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`flex flex-col items-center justify-center p-2 ${isActive(item.path) ? 'text-primary' : 'text-muted-foreground'}`}
                            >
                                <item.icon size={22} />
                                <span className="text-[10px] mt-1">{item.label.split(' ')[0]}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
