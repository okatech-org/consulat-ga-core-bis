import React from "react";
import { LayoutDashboard, Settings, LogOut, FileText, Building2, Users, ShieldCheck, Globe, Mail, ClipboardList, UserPlus, Bell, CreditCard } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { GlobalSettings } from "@/components/GlobalSettings";
import { useDemo } from "@/contexts/DemoContext";
import { SidebarAppearance } from "@/components/SidebarAppearance";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const { currentUser } = useDemo();

    // Determine context based on URL or Current User Role
    const isSuperAdmin = location.pathname.includes('/dashboard/super-admin') || (location.pathname === '/iboite' && currentUser?.role === 'ADMIN' && currentUser?.id === 'admin-system');
    const isConsulGeneral = location.pathname.includes('/admin') || (location.pathname === '/iboite' && (currentUser?.role === 'CONSUL_GENERAL' || (currentUser?.role === 'ADMIN' && currentUser?.id !== 'admin-system')));
    const isManager = location.pathname.includes('/admin') || (location.pathname === '/iboite' && ['CONSUL', 'VICE_CONSUL', 'CHARGE_AFFAIRES_CONSULAIRES'].includes(currentUser?.role as string));
    const isAgent = location.pathname.includes('/dashboard/agent') || (location.pathname === '/iboite' && currentUser?.role !== 'ADMIN' && !['CONSUL_GENERAL', 'CONSUL', 'VICE_CONSUL', 'CHARGE_AFFAIRES_CONSULAIRES', 'CITIZEN', 'FOREIGNER'].includes(currentUser?.role as string));
    const isCitizen = location.pathname.includes('/dashboard/citizen') || (location.pathname === '/iboite' && currentUser?.role === 'CITIZEN');
    const isForeigner = location.pathname.includes('/dashboard/foreigner') || (location.pathname === '/iboite' && currentUser?.role === 'FOREIGNER');

    // Define Navigation Items based on Context
    const getNavItems = () => {
        if (isSuperAdmin) {
            return [
                { label: "Tableau de Bord", icon: LayoutDashboard, path: "/dashboard/super-admin" },
                { label: "Organisations", icon: Building2, path: "/dashboard/super-admin/organizations" },
                { label: "Utilisateurs", icon: Users, path: "/dashboard/super-admin/users" },
                { label: "Services", icon: FileText, path: "/dashboard/super-admin/services" },
                { label: "iBoîte", icon: Mail, path: "/dashboard/citizen/boite" },
            ];
        }

        if (isConsulGeneral) {
            return [
                { label: "Cockpit", icon: LayoutDashboard, path: "/admin" },
                { label: "Demandes", icon: FileText, path: "/dashboard/agent/requests" },
                { label: "Profils", icon: Users, path: "/dashboard/profiles" },
                { label: "Rendez-vous", icon: Users, path: "/dashboard/agent/appointments" },
                { label: "Services", icon: FileText, path: "/dashboard/services" },
                { label: "Agents", icon: Users, path: "/dashboard/admin/agents" },
                { label: "Paramètres", icon: Settings, path: "/dashboard/admin/settings" },
                { label: "iBoîte", icon: Mail, path: "/dashboard/citizen/boite" },
            ];
        }

        if (isManager) {
            return [
                { label: "Cockpit", icon: LayoutDashboard, path: "/admin" },
                { label: "Demandes Équipe", icon: FileText, path: "/dashboard/agent/requests" },
                { label: "Mon Équipe", icon: Users, path: "/dashboard/admin/agents" }, // Restricted view in component
                { label: "Rendez-vous", icon: Users, path: "/dashboard/agent/appointments" },
                { label: "iBoîte", icon: Mail, path: "/dashboard/citizen/boite" },
            ];
        }

        if (isAgent) {
            return [
                { label: "Tableau de Bord", icon: LayoutDashboard, path: "/dashboard/agent" },
                { label: "Dossiers en cours", icon: FileText, path: "/dashboard/agent/requests" },
                { label: "Rendez-vous", icon: Users, path: "/dashboard/agent/appointments" },
                { label: "iBoîte", icon: Mail, path: "/dashboard/citizen/boite" },
            ];
        }

        if (isForeigner) {
            return [
                { label: "Tableau de Bord", icon: LayoutDashboard, path: "/dashboard/foreigner" },
                { label: "Mes Demandes", icon: FileText, path: "/dashboard/foreigner/requests" },
                { label: "iBoîte", icon: Mail, path: "/dashboard/citizen/boite" },
            ];
        }

        // Default to Citizen - Consistent menu structure
        return [
            { label: "iProfil", icon: LayoutDashboard, path: "/dashboard/citizen" },
            { label: "Démarches", icon: FileText, path: "/dashboard/citizen/services" },
            { label: "Suivi Timeline", icon: ClipboardList, path: "/dashboard/citizen/timeline" },
            { label: "iDocuments", icon: ShieldCheck, path: "/dashboard/citizen/documents" },
            { label: "iBoîte", icon: Mail, path: "/dashboard/citizen/boite" },
            { label: "Entreprises", icon: Building2, path: "/dashboard/citizen/companies" },
            { label: "Associations", icon: Users, path: "/dashboard/citizen/associations" },
            { label: "Paramètres", icon: Settings, path: "/dashboard/citizen/settings" },
        ];
    };

    const navItems = getNavItems();

    return (
        <div className="min-h-screen bg-background p-4 md:p-6 font-sans theme-neumorphic">
            <div className="flex gap-6 max-w-[1600px] mx-auto">

                {/* Sidebar Détachée */}
                <aside className="neu-card w-64 flex-shrink-0 p-6 flex flex-col min-h-[calc(100vh-3rem)] sticky top-6 h-[calc(100vh-3rem)]">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="neu-raised w-12 h-12 rounded-full flex items-center justify-center text-primary">
                            <span className="font-bold text-xl">C</span>
                        </div>
                        <div>
                            <div className="font-bold">CONSULAT</div>
                            <div className="text-xs text-muted-foreground">Espace Numérique</div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-3 flex-1 overflow-y-auto pr-2">
                        {navItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${isActive(item.path) ? 'neu-inset text-primary font-bold' : 'neu-raised hover:shadow-neo-md'
                                    }`}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </button>
                        ))}

                        {/* Only show separate settings button for non-citizen contexts without settings in navItems */}
                        {!isCitizen && (
                            <>
                                <div className="my-4 border-t border-gray-200/50"></div>
                                <button
                                    onClick={() => {
                                        if (isSuperAdmin) navigate('/dashboard/super-admin/settings');
                                        else navigate('/settings');
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all ${(isSuperAdmin && isActive('/dashboard/super-admin/settings'))
                                        ? 'neu-inset text-primary font-bold'
                                        : 'neu-raised hover:shadow-neo-md'
                                        }`}
                                >
                                    <Settings className="w-4 h-4" />
                                    Paramètres
                                </button>
                            </>
                        )}
                    </nav>

                    {/* Footer Sidebar */}
                    <div className="pt-4 border-t border-border mt-auto space-y-4">
                        <SidebarAppearance />
                        <button
                            onClick={() => navigate('/')}
                            className="neu-raised w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-destructive hover:shadow-neo-md transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            Déconnexion
                        </button>
                    </div>
                </aside>

                {/* Contenu Principal */}
                <main className="flex-1 min-w-0">
                    <div className="p-2 md:p-4 min-h-[calc(100vh-3rem)] animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
