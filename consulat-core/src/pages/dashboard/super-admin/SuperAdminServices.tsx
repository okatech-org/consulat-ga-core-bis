import { FileText, Settings, CheckCircle2, AlertCircle, Plus, RefreshCcw } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { ConsularService } from "@/types/services";
import { useState, useEffect } from "react";
import { ServiceDialog } from "@/components/super-admin/ServiceDialog";
import { useToast } from "@/components/ui/use-toast";
import { serviceCatalog } from "@/services/serviceCatalog";
import { DEFAULT_SERVICES } from "@/data/defaultServices";

export default function SuperAdminServices() {
    const { toast } = useToast();
    const [services, setServices] = useState<ConsularService[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<ConsularService | null>(null);
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            const data = await serviceCatalog.getAll();
            setServices(data);
        } catch (error) {
            console.error("Failed to load services", error);
            toast({
                title: "Erreur",
                description: "Impossible de charger les services.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSeedServices = async () => {
        setSeeding(true);
        try {
            // Check if services already exist to avoid duplicates (simple check by name)
            const existingNames = new Set(services.map(s => s.name));
            let addedCount = 0;

            for (const service of DEFAULT_SERVICES) {
                if (!existingNames.has(service.name)) {
                    await serviceCatalog.create(service);
                    addedCount++;
                }
            }

            if (addedCount > 0) {
                toast({
                    title: "Services initialisés",
                    description: `${addedCount} services ont été ajoutés au catalogue.`,
                });
                loadServices();
            } else {
                toast({
                    title: "Déjà à jour",
                    description: "Tous les services par défaut sont déjà présents.",
                });
            }
        } catch (error) {
            console.error("Failed to seed services", error);
            toast({
                title: "Erreur",
                description: "Erreur lors de l'initialisation des services.",
                variant: "destructive"
            });
        } finally {
            setSeeding(false);
        }
    };

    const handleAdd = () => {
        setSelectedService(null);
        setIsDialogOpen(true);
    };

    const handleConfigure = (service: ConsularService) => {
        setSelectedService(service);
        setIsDialogOpen(true);
    };

    const handleSave = async (data: Partial<ConsularService>) => {
        try {
            if (selectedService) {
                await serviceCatalog.update(selectedService.id, data);
                toast({
                    title: "Service mis à jour",
                    description: `La configuration de ${data.name} a été enregistrée.`,
                });
            } else {
                await serviceCatalog.create({ ...data, is_active: true } as any);
                toast({
                    title: "Service créé",
                    description: `Le service ${data.name} a été créé avec succès.`,
                });
            }
            loadServices();
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Failed to save service", error);
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de l'enregistrement.",
                variant: "destructive"
            });
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Services Consulaires</h1>
                        <p className="text-muted-foreground">
                            Configuration des types de demandes et des procédures
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSeedServices}
                            disabled={seeding}
                            className="neu-raised px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary hover:shadow-neo-md transition-all disabled:opacity-50"
                        >
                            <RefreshCcw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
                            {seeding ? 'Initialisation...' : 'Initialiser les services'}
                        </button>
                        <button
                            onClick={handleAdd}
                            className="neu-raised px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium text-primary hover:shadow-neo-md transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Nouveau Service
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-muted-foreground">Chargement...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service) => (
                            <div key={service.id} className="neu-raised p-6 rounded-xl flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="neu-inset w-12 h-12 rounded-full flex items-center justify-center text-primary">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${service.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {service.is_active ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                        {service.is_active ? 'Actif' : 'Inactif'}
                                    </span>
                                </div>

                                <h3 className="font-bold text-lg mb-2">{service.name}</h3>
                                <p className="text-sm text-muted-foreground mb-6 flex-1 line-clamp-3" title={service.description}>
                                    {service.description}
                                </p>

                                <div className="space-y-3 pt-4 border-t border-gray-100">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Prix</span>
                                        <span className="font-bold">{service.price} {service.currency}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Documents requis</span>
                                        <span className="font-bold">{service.requirements?.length || 0}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleConfigure(service)}
                                    className="mt-6 w-full neu-raised py-2 rounded-lg text-sm font-medium hover:text-primary transition-colors flex items-center justify-center gap-2"
                                >
                                    <Settings className="w-4 h-4" />
                                    Configurer
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <ServiceDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    initialData={selectedService}
                    onSave={handleSave}
                />
            </div>
        </DashboardLayout>
    );
}
