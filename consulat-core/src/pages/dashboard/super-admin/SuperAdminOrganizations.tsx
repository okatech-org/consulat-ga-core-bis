import { Building2, Plus, Search, MapPin, Globe, Settings, LayoutDashboard } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { COUNTRY_FLAGS, Organization, OrganizationType } from "@/types/organization";
import { useState, useEffect } from "react";
import { OrganizationDialog } from "@/components/super-admin/OrganizationDialog";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { organizationService } from "@/services/organizationService";

export default function SuperAdminOrganizations() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedEntity, setSelectedEntity] = useState<Organization | null>(null);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrganizations();
    }, []);

    const loadOrganizations = async () => {
        try {
            const data = await organizationService.getAll();
            setOrganizations(data);
        } catch (error) {
            console.error("Failed to load organizations", error);
            toast({
                title: "Erreur",
                description: "Impossible de charger les organisations.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredEntities = organizations.filter(entity =>
        entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entity.metadata?.city && entity.metadata.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entity.metadata?.country && entity.metadata.country.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleAdd = () => {
        setSelectedEntity(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (entity: Organization) => {
        setSelectedEntity(entity);
        setIsDialogOpen(true);
    };

    const handleSave = async (data: Partial<Organization>) => {
        try {
            if (selectedEntity) {
                await organizationService.update(selectedEntity.id, data);
                toast({
                    title: "Organisation modifiée",
                    description: `L'organisation ${data.name} a été mise à jour.`,
                });
            } else {
                // For creation, we need to ensure type is set
                if (!data.type) data.type = OrganizationType.AMBASSADE;
                await organizationService.create(data as Omit<Organization, 'id' | 'created_at' | 'updated_at'>);
                toast({
                    title: "Organisation créée",
                    description: `L'organisation ${data.name} a été créée avec succès.`,
                });
            }
            loadOrganizations();
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Failed to save organization", error);
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
                        <h1 className="text-3xl font-bold text-gray-800">Organisations</h1>
                        <p className="text-muted-foreground">
                            Gestion du réseau diplomatique (Ambassades et Consulats)
                        </p>
                    </div>
                    <button
                        onClick={handleAdd}
                        className="neu-raised px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium text-primary hover:shadow-neo-md transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Nouvelle Organisation
                    </button>
                </div>

                {/* Filters */}
                <div className="neu-raised p-4 rounded-xl flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Rechercher une ambassade, un consulat ou une ville..."
                            className="w-full bg-transparent border-none focus:ring-0 pl-9 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="text-center py-10 text-muted-foreground">Chargement...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEntities.map((entity) => (
                            <div key={entity.id} className="neu-raised p-6 rounded-xl group hover:scale-[1.01] transition-transform flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="neu-inset w-12 h-12 rounded-full flex items-center justify-center text-2xl">
                                        {/* Display flag of the first jurisdiction or fallback */}
                                        {entity.metadata?.jurisdiction && entity.metadata.jurisdiction.length > 0
                                            ? COUNTRY_FLAGS[entity.metadata.jurisdiction[0]]
                                            : <Globe className="w-6 h-6 text-primary" />}
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${entity.type === OrganizationType.AMBASSADE ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                        }`}>
                                        {entity.type.replace(/_/g, ' ')}
                                    </span>
                                </div>

                                <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{entity.name}</h3>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                    <MapPin className="w-4 h-4" />
                                    {entity.metadata?.city || "Siège"}, {entity.metadata?.country || "International"}
                                </div>

                                <div className="space-y-2 pt-4 border-t border-gray-100 flex-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Juridiction</span>
                                        <div className="flex -space-x-2">
                                            {entity.metadata?.jurisdiction?.map(code => (
                                                <span key={code} className="w-6 h-6 rounded-full bg-gray-100 border border-white flex items-center justify-center text-xs" title={code}>
                                                    {COUNTRY_FLAGS[code]}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Personnel</span>
                                        <span className="font-bold">--</span>
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => navigate(`/dashboard/super-admin/organizations/${entity.id}?tab=activity`)}
                                        className="neu-raised py-2 rounded-lg text-sm font-medium hover:text-primary transition-colors flex items-center justify-center gap-2"
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        Gérer
                                    </button>
                                    <button
                                        onClick={() => navigate(`/dashboard/super-admin/organizations/${entity.id}?tab=general`)}
                                        className="neu-raised py-2 rounded-lg text-sm font-medium hover:text-primary transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Settings className="w-4 h-4" />
                                        Paramétrer
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <OrganizationDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    initialData={selectedEntity}
                    onSave={handleSave}
                />
            </div>
        </DashboardLayout>
    );
}
