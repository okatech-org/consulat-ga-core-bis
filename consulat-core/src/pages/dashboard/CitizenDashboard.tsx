import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MOCK_GABONAIS_CITIZENS } from "@/data/mock-citizens";
import { MOCK_CHILDREN } from "@/data/mock-children";
import { FileText, Plane, UserCheck, Stamp, Plus, TrendingUp, Building2, MapPin, QrCode, Bell, User, Briefcase, History, Search, ArrowRight } from "lucide-react";
import { QuickChildProfileModal } from "@/components/registration/QuickChildProfileModal";
import { useState, useEffect } from "react";
import { PublicServiceCard } from "@/components/services/PublicServiceCard";
import { MOCK_SERVICES } from "@/data/mock-services";
import { useThemeStyle } from "@/context/ThemeStyleContext";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { ConsularCard } from "@/components/consular/ConsularCard";
import { defaultCards } from "@/components/dashboard/DigitalWallet";

export default function CitizenDashboard() {
    const user = MOCK_GABONAIS_CITIZENS[0];
    const [isChildModalOpen, setIsChildModalOpen] = useState(false);
    const { userSpaceTheme } = useThemeStyle();
    const navigate = useNavigate();
    const isIDN = userSpaceTheme === 'idn';
    const [serviceSearch, setServiceSearch] = useState('');

    // QR Timer for IDN theme
    const [qrTimer, setQrTimer] = useState(300);

    useEffect(() => {
        if (!isIDN) return;
        const interval = setInterval(() => {
            setQrTimer((prev) => prev <= 1 ? 300 : prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [isIDN]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // IDN Theme Dashboard
    if (isIDN) {
        // Mock notifications
        const notifications = [
            { id: 1, title: "Demande approuvée", message: "Votre carte consulaire est prête", time: "Il y a 2h", read: false },
            { id: 2, title: "Rappel RDV", message: "Rendez-vous demain à 10h00", time: "Il y a 5h", read: false },
            { id: 3, title: "Document disponible", message: "Acte de naissance téléchargeable", time: "Hier", read: true },
        ];

        return (
            <div className="space-y-6">
                {/* TOP ROW: User Profile + Consular Card SIDE BY SIDE on desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* BLOCK 1: User Profile Header with Notifications */}
                    <div className="glass-card overflow-hidden h-fit">
                        {/* Gradient Header */}
                        <div className="bg-gradient-to-r from-primary via-primary/90 to-accent p-6 text-white">
                            <div className="flex items-start justify-between">
                                {/* User Info */}
                                <div className="flex items-center gap-4">
                                    <Avatar className="w-16 h-16 border-2 border-white/50 shadow-lg">
                                        <AvatarImage src="/placeholder.svg" />
                                        <AvatarFallback className="bg-white/20 text-white font-bold text-xl">
                                            {user.firstName[0]}{user.lastName[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm opacity-90">Bonjour,</p>
                                        <h2 className="text-2xl font-bold">{user.firstName} {user.lastName}</h2>
                                        <div className="flex gap-2 mt-2">
                                            <Badge className="bg-white/20 text-white border-white/30 text-xs">
                                                Citoyen Gabonais
                                            </Badge>
                                            <Badge className="bg-white/20 text-white border-white/30 text-xs">
                                                <Building2 className="w-3 h-3 mr-1" />
                                                {user.currentAddress.country}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Notifications Bell + Panel */}
                                <div className="relative">
                                    <button
                                        className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                        onClick={() => navigate('/dashboard/citizen/notifications')}
                                    >
                                        <Bell className="w-6 h-6" />
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center text-xs font-bold">
                                            {notifications.filter(n => !n.read).length}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* User Quick Info Bar */}
                        <div className="px-6 py-4 bg-white/50 dark:bg-black/20 flex flex-wrap items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Dossier:</span>
                                <span className="font-mono font-medium text-primary">{user.consulateFile}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Statut:</span>
                                <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                                    <UserCheck className="w-3 h-3 mr-1" /> Vérifié
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Né(e) le:</span>
                                <span className="font-medium">{user.dateOfBirth?.toLocaleDateString()}</span>
                            </div>
                            <div className="ml-auto">
                                <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10" onClick={() => navigate('/dashboard/citizen/settings')}>
                                    Modifier mon profil
                                </Button>
                            </div>
                        </div>

                        {/* Recent Notifications Preview */}
                        <div className="px-6 py-3 border-t border-white/10 bg-white/30 dark:bg-black/10">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notifications récentes</span>
                                <button className="text-xs text-primary hover:underline" onClick={() => navigate('/dashboard/citizen/notifications')}>
                                    Voir tout
                                </button>
                            </div>
                            <div className="space-y-2">
                                {notifications.slice(0, 2).map((notif) => (
                                    <div key={notif.id} className={cn(
                                        "flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer",
                                        notif.read ? "hover:bg-white/50" : "bg-primary/5 hover:bg-primary/10"
                                    )}>
                                        <div className={cn(
                                            "w-2 h-2 rounded-full flex-shrink-0",
                                            notif.read ? "bg-muted-foreground/30" : "bg-primary"
                                        )} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{notif.title}</p>
                                            <p className="text-xs text-muted-foreground truncate">{notif.message}</p>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{notif.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* BLOCK 2: Porte-Cartes - Full Consular Card + Stacked Others */}
                    <Card className="glass-card overflow-hidden border-none h-fit p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">Mon Porte-Cartes</h2>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate('/dashboard/citizen/cartes')}
                                className="glass-button"
                            >
                                <ArrowRight className="mr-2 h-4 w-4" /> Gérer mes cartes
                            </Button>
                        </div>

                        {/* Full Consular Card */}
                        <div className="mb-4">
                            <ConsularCard
                                variant="mini"
                                profile={{
                                    first_name: user.firstName,
                                    last_name: user.lastName,
                                    consular_number: user.consulateFile,
                                    expires_date: "31/12/2026"
                                }}
                                onClick={() => navigate('/dashboard/citizen/cartes')}
                            />
                        </div>

                        {/* Stacked Mini Cards (Association/Enterprise) */}
                        {defaultCards.length > 1 && (
                            <div className="relative h-16 mt-2">
                                {defaultCards.slice(1, 3).map((card, index) => (
                                    <div
                                        key={card.id}
                                        className={cn(
                                            "absolute left-0 right-0 h-12 rounded-lg shadow-md cursor-pointer",
                                            "transition-all hover:translate-y-[-4px]",
                                            `bg-gradient-to-r ${card.gradient}`
                                        )}
                                        style={{
                                            top: `${index * 20}px`,
                                            zIndex: 10 - index,
                                        }}
                                        onClick={() => navigate('/dashboard/citizen/cartes')}
                                    >
                                        <div className="flex items-center h-full px-4 text-white">
                                            <card.icon className="w-5 h-5 mr-3 opacity-80" />
                                            <div>
                                                <p className="text-sm font-medium">{card.name}</p>
                                                <p className="text-xs opacity-70">{card.subtitle}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div> {/* End of side-by-side grid */}

                {/* Stats Cards - Glass style */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="glass-card p-4 text-center">
                        <div className="w-10 h-10 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-2">
                            <UserCheck className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-xs text-muted-foreground">Statut</p>
                        <p className="font-bold text-primary">Vérifié</p>
                    </div>
                    <div className="glass-card p-4 text-center">
                        <div className="w-10 h-10 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                            <FileText className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="text-xs text-muted-foreground">En cours</p>
                        <p className="font-bold">1</p>
                    </div>
                    <div className="glass-card p-4 text-center">
                        <div className="w-10 h-10 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center mb-2">
                            <Stamp className="w-5 h-5 text-purple-500" />
                        </div>
                        <p className="text-xs text-muted-foreground">Documents</p>
                        <p className="font-bold">3</p>
                    </div>
                </div>

                {/* Quick Access Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="glass-card p-4 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all" onClick={() => navigate('/dashboard/citizen/documents')}>
                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold">Mes Documents</p>
                                <Badge variant="secondary" className="mt-1">12</Badge>
                            </div>
                        </div>
                    </Card>

                    <Card className="glass-card p-4 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all" onClick={() => navigate('/dashboard/citizen/cv')}>
                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                                <Briefcase className="w-6 h-6 text-accent" />
                            </div>
                            <div>
                                <p className="font-semibold">Mon iCV</p>
                                <Badge variant="secondary" className="mt-1">78%</Badge>
                            </div>
                        </div>
                    </Card>

                    <Card className="glass-card p-4 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all" onClick={() => navigate('/dashboard/citizen/requests')}>
                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                                <History className="w-6 h-6 text-secondary" />
                            </div>
                            <div>
                                <p className="font-semibold">Mes Demandes</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="glass-card p-4 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all" onClick={() => navigate('/dashboard/citizen/children')}>
                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center">
                                <User className="w-6 h-6 text-pink-500" />
                            </div>
                            <div>
                                <p className="font-semibold">Famille</p>
                                <Badge variant="secondary" className="mt-1">{MOCK_CHILDREN.length}</Badge>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Services Section with Smart Search */}
                <div className="glass-card p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h2 className="text-lg font-bold">Services les plus demandés</h2>
                            <p className="text-sm text-muted-foreground">Recherchez et accédez rapidement aux services consulaires</p>
                        </div>
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => navigate('/dashboard/citizen/services')}
                        >
                            Voir tous les services
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Smart Search Bar */}
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Rechercher un service: passeport, visa, acte de naissance..."
                            value={serviceSearch}
                            onChange={(e) => setServiceSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 dark:bg-black/20 border border-white/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm placeholder:text-muted-foreground/70"
                        />
                    </div>

                    {/* Filtered Services Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {MOCK_SERVICES
                            .filter(s =>
                                serviceSearch
                                    ? s.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
                                    s.description.toLowerCase().includes(serviceSearch.toLowerCase()) ||
                                    s.category.toLowerCase().includes(serviceSearch.toLowerCase())
                                    : ['consular-card', 'passport-ordinary', 'civil-birth', 'laissez-passer', 'visa-tourist'].includes(s.id)
                            )
                            .slice(0, serviceSearch ? 9 : 6)
                            .map((service) => (
                                <PublicServiceCard
                                    key={service.id}
                                    service={service}
                                    onRegisterClick={() => navigate(`/services/${service.id}`)}
                                />
                            ))}
                    </div>

                    {/* No results message */}
                    {serviceSearch && MOCK_SERVICES.filter(s =>
                        s.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
                        s.description.toLowerCase().includes(serviceSearch.toLowerCase())
                    ).length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>Aucun service trouvé pour "{serviceSearch}"</p>
                                <Button variant="link" onClick={() => setServiceSearch('')}>Effacer la recherche</Button>
                            </div>
                        )}

                    {/* Link to all services */}
                    <div className="mt-6 pt-4 border-t border-white/10 text-center">
                        <Button
                            variant="ghost"
                            className="text-primary hover:bg-primary/10"
                            onClick={() => navigate('/dashboard/citizen/requests')}
                        >
                            Voir mes demandes en cours
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>

                <QuickChildProfileModal
                    open={isChildModalOpen}
                    onOpenChange={setIsChildModalOpen}
                    residenceCountry={user.currentAddress.country}
                    onSuccess={(childId) => console.log("Child created:", childId)}
                />
            </div>
        );
    }

    // Classic/Minimal Theme Dashboard (original)
    return (
        <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Bienvenue, {user.firstName}</h1>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                        <p className="text-muted-foreground">
                            Dossier Consulaire : <span className="font-mono font-medium text-primary">{user.consulateFile}</span>
                        </p>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
                                <Building2 className="w-3 h-3" />
                                Géré par: Consulat France
                            </Badge>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="neu-raised gap-2">
                        <MapPin className="w-4 h-4" />
                        Signaler mon déplacement
                    </Button>
                    <Button className="neu-raised bg-primary text-primary-foreground hover:shadow-neo-md transition-all border-none">
                        <Plus className="mr-2 h-4 w-4" /> Nouvelle Demande
                    </Button>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="neu-raised p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary">
                            <UserCheck size={20} />
                        </div>
                        <div className="flex items-center gap-1 text-success text-sm font-medium">
                            <TrendingUp size={14} />
                            Actif
                        </div>
                    </div>
                    <p className="text-muted-foreground text-sm font-medium mb-1">Statut du Dossier</p>
                    <h3 className="text-2xl font-bold text-foreground">Vérifié</h3>
                    <p className="text-xs text-muted-foreground mt-2">Mis à jour le {user.updatedAt.toLocaleDateString()}</p>
                </div>

                <div className="neu-raised p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600">
                            <FileText size={20} />
                        </div>
                    </div>
                    <p className="text-muted-foreground text-sm font-medium mb-1">Demandes en cours</p>
                    <h3 className="text-2xl font-bold text-foreground">1</h3>
                    <p className="text-xs text-muted-foreground mt-2">Renouvellement Passeport</p>
                </div>

                <div className="neu-raised p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600">
                            <Stamp size={20} />
                        </div>
                    </div>
                    <p className="text-muted-foreground text-sm font-medium mb-1">Documents Disponibles</p>
                    <h3 className="text-2xl font-bold text-foreground">3</h3>
                    <p className="text-xs text-muted-foreground mt-2">Carte Consulaire, Actes...</p>
                </div>
            </div>

            <div className="neu-inset p-6 rounded-2xl mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Mes Enfants</h2>
                    <Button variant="outline" size="sm" onClick={() => setIsChildModalOpen(true)} className="neu-raised border-none hover:shadow-neo-md">
                        <Plus className="mr-2 h-4 w-4" /> Ajouter un enfant
                    </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {MOCK_CHILDREN.map((child) => (
                        <div key={child.id} className="neu-raised p-5 rounded-xl hover:shadow-neo-lg transition-all cursor-pointer bg-card">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-lg font-bold">{child.personal.firstName} {child.personal.lastName}</h3>
                                <Badge variant={child.status === 'ACTIVE' ? 'default' : 'secondary'} className="rounded-full">
                                    {child.status}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">Né(e) le {child.personal.birthDate?.toLocaleDateString()}</p>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                <UserCheck className="h-4 w-4" />
                                {child.parents.length} Parent(s) lié(s)
                            </div>
                            <Button className="w-full neu-inset bg-transparent hover:bg-muted text-primary border-none shadow-none" size="sm">
                                Gérer le profil
                            </Button>
                        </div>
                    ))}

                    {MOCK_CHILDREN.length === 0 && (
                        <div className="col-span-3 text-center py-8 border-2 border-dashed border-border rounded-lg text-muted-foreground">
                            Aucun enfant enregistré pour le moment.
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-2 mb-6">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Services les plus demandés</h2>
                <p className="text-muted-foreground text-sm">
                    Accédez rapidement à vos démarches consulaires les plus courantes.
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {MOCK_SERVICES
                    .filter(s => [
                        'consular-card',
                        'civil-birth',
                        'passport-ordinary',
                        'laissez-passer',
                        'tenant-lieu-passeport',
                        'consular-protection'
                    ].includes(s.id))
                    .map((service) => (
                        <PublicServiceCard
                            key={service.id}
                            service={service}
                            onRegisterClick={() => {
                                console.log("Register for service:", service.id);
                            }}
                        />
                    ))}
            </div>

            <QuickChildProfileModal
                open={isChildModalOpen}
                onOpenChange={setIsChildModalOpen}
                residenceCountry={user.currentAddress.country}
                onSuccess={(childId) => {
                    console.log("Child created:", childId);
                }}
            />
        </>
    );
}

