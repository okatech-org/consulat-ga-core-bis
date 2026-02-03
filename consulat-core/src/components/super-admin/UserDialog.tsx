import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ConsularRole } from "@/types/consular-roles";
import { DemoUser } from "@/types/roles";
import { UserFunction, BillingFeature } from "@/types/user-management";
import { serviceCatalog } from "@/services/serviceCatalog";
import { ConsularService } from "@/types/services";
import { Shield, Briefcase, CreditCard, Settings, User } from "lucide-react";

interface UserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: any | null;
    onSave: (data: any) => Promise<void>;
}

export function UserDialog({ open, onOpenChange, initialData, onSave }: UserDialogProps) {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("general");
    const [services, setServices] = useState<ConsularService[]>([]);
    const [formData, setFormData] = useState<any>({
        name: "",
        role: ConsularRole.CITIZEN,
        entityId: "",
        email: "",
        functions: [],
        billingFeatures: [],
        quotas: {
            maxDailyFiles: 10,
            maxStorageGB: 1,
            canExportData: false
        },
        accessibleServices: []
    });

    useEffect(() => {
        const loadServices = async () => {
            try {
                const data = await serviceCatalog.getAll();
                setServices(data);
            } catch (error) {
                console.error("Failed to load services", error);
            }
        };
        loadServices();
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                functions: initialData.functions || [],
                billingFeatures: initialData.billingFeatures || [],
                quotas: initialData.quotas || {
                    maxDailyFiles: 10,
                    maxStorageGB: 1,
                    canExportData: false
                },
                accessibleServices: initialData.accessibleServices || []
            });
        } else {
            setFormData({
                name: "",
                role: ConsularRole.CITIZEN,
                entityId: "",
                email: "",
                functions: [],
                billingFeatures: [],
                quotas: {
                    maxDailyFiles: 10,
                    maxStorageGB: 1,
                    canExportData: false
                },
                accessibleServices: []
            });
        }
    }, [initialData, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to save", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFunction = (func: UserFunction) => {
        setFormData((prev: any) => {
            const current = prev.functions || [];
            if (current.includes(func)) {
                return { ...prev, functions: current.filter((f: any) => f !== func) };
            } else {
                return { ...prev, functions: [...current, func] };
            }
        });
    };

    const toggleBillingFeature = (feat: BillingFeature) => {
        setFormData((prev: any) => {
            const current = prev.billingFeatures || [];
            if (current.includes(feat)) {
                return { ...prev, billingFeatures: current.filter((f: any) => f !== feat) };
            } else {
                return { ...prev, billingFeatures: [...current, feat] };
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        {initialData ? "Gestion de l'Utilisateur" : "Nouvel Utilisateur"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-1">
                            <TabsList className="grid w-full grid-cols-4 mb-4">
                                <TabsTrigger value="general" className="gap-2">
                                    <User className="w-4 h-4" /> Général
                                </TabsTrigger>
                                <TabsTrigger value="functions" className="gap-2">
                                    <Briefcase className="w-4 h-4" /> Fonctions
                                </TabsTrigger>
                                <TabsTrigger value="services" className="gap-2">
                                    <Settings className="w-4 h-4" /> Services
                                </TabsTrigger>
                                <TabsTrigger value="billing" className="gap-2">
                                    <CreditCard className="w-4 h-4" /> Facturation
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <ScrollArea className="flex-1 px-1 -mx-1">
                            <div className="px-2 py-2">
                                <TabsContent value="general" className="space-y-4 mt-0">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nom complet</Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData((p: any) => ({ ...p, name: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email || ""}
                                                onChange={(e) => setFormData((p: any) => ({ ...p, email: e.target.value }))}
                                                placeholder="exemple@consulat.ga"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="role">Rôle Principal</Label>
                                            <Select
                                                value={formData.role}
                                                onValueChange={(v) => setFormData((p: any) => ({ ...p, role: v as ConsularRole }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner un rôle" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ADMIN">Super Admin</SelectItem>
                                                    <SelectItem value={ConsularRole.CONSUL_GENERAL}>Consul Général</SelectItem>
                                                    <SelectItem value={ConsularRole.CONSUL}>Consul</SelectItem>
                                                    <SelectItem value={ConsularRole.VICE_CONSUL}>Vice-Consul</SelectItem>
                                                    <SelectItem value={ConsularRole.CHARGE_AFFAIRES_CONSULAIRES}>Chargé d'Affaires</SelectItem>
                                                    <SelectItem value={ConsularRole.AGENT_CONSULAIRE}>Agent Consulaire</SelectItem>
                                                    <SelectItem value={ConsularRole.STAGIAIRE}>Stagiaire</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="entityId">ID Entité</Label>
                                            <Input
                                                id="entityId"
                                                value={formData.entityId || ""}
                                                onChange={(e) => setFormData((p: any) => ({ ...p, entityId: e.target.value }))}
                                                placeholder="ex: consulat-paris"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-muted/30 p-4 rounded-lg border">
                                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-muted-foreground" />
                                            Résumé des accès
                                        </h4>
                                        <div className="text-xs text-muted-foreground space-y-1">
                                            <p>• Rôle: <span className="font-bold text-foreground">{formData.role}</span></p>
                                            <p>• Entité: <span className="font-bold text-foreground">{formData.entityId || "Global"}</span></p>
                                            <p>• Fonctions activées: <span className="font-bold text-foreground">{formData.functions?.length || 0}</span></p>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="functions" className="space-y-6 mt-0">
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-sm font-bold mb-3 uppercase text-muted-foreground">Gestion des Visas</h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {[UserFunction.VISA_VIEW, UserFunction.VISA_PROCESS, UserFunction.VISA_VALIDATE, UserFunction.VISA_PRINT].map(func => (
                                                    <div key={func} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-muted/50 transition-colors">
                                                        <Checkbox
                                                            id={func}
                                                            checked={formData.functions?.includes(func)}
                                                            onCheckedChange={() => toggleFunction(func)}
                                                        />
                                                        <Label htmlFor={func} className="text-sm font-medium cursor-pointer flex-1">
                                                            {func.replace('VISA_', '').replace('_', ' ')}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <Separator />

                                        <div>
                                            <h3 className="text-sm font-bold mb-3 uppercase text-muted-foreground">Passeports & Biométrie</h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {[UserFunction.PASSPORT_VIEW, UserFunction.PASSPORT_ENROLL, UserFunction.PASSPORT_VALIDATE, UserFunction.PASSPORT_DELIVER].map(func => (
                                                    <div key={func} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-muted/50 transition-colors">
                                                        <Checkbox
                                                            id={func}
                                                            checked={formData.functions?.includes(func)}
                                                            onCheckedChange={() => toggleFunction(func)}
                                                        />
                                                        <Label htmlFor={func} className="text-sm font-medium cursor-pointer flex-1">
                                                            {func.replace('PASSPORT_', '').replace('_', ' ')}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <Separator />

                                        <div>
                                            <h3 className="text-sm font-bold mb-3 uppercase text-muted-foreground">État Civil</h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {[UserFunction.CIVIL_REGISTRY_VIEW, UserFunction.CIVIL_REGISTRY_CREATE, UserFunction.CIVIL_REGISTRY_VALIDATE].map(func => (
                                                    <div key={func} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-muted/50 transition-colors">
                                                        <Checkbox
                                                            id={func}
                                                            checked={formData.functions?.includes(func)}
                                                            onCheckedChange={() => toggleFunction(func)}
                                                        />
                                                        <Label htmlFor={func} className="text-sm font-medium cursor-pointer flex-1">
                                                            {func.replace('CIVIL_REGISTRY_', '').replace('_', ' ')}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="services" className="mt-0 space-y-4">
                                    <div className="bg-muted/30 p-4 rounded-lg border mb-4">
                                        <p className="text-sm text-muted-foreground">
                                            Définissez les services auxquels cet utilisateur a accès et son niveau d'autorisation.
                                        </p>
                                    </div>
                                    <div className="space-y-3">
                                        {services.map(service => {
                                            const access = formData.accessibleServices?.find((s: any) => s.serviceId === service.id);
                                            const hasAccess = !!access;

                                            return (
                                                <div key={service.id} className="border rounded-lg p-3 hover:bg-muted/20 transition-colors">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <Switch
                                                                checked={hasAccess}
                                                                onCheckedChange={(checked) => {
                                                                    setFormData((prev: any) => {
                                                                        const current = prev.accessibleServices || [];
                                                                        if (checked) {
                                                                            return {
                                                                                ...prev,
                                                                                accessibleServices: [...current, {
                                                                                    serviceId: service.id,
                                                                                    canView: true,
                                                                                    canProcess: false,
                                                                                    canValidate: false
                                                                                }]
                                                                            };
                                                                        } else {
                                                                            return {
                                                                                ...prev,
                                                                                accessibleServices: current.filter((s: any) => s.serviceId !== service.id)
                                                                            };
                                                                        }
                                                                    });
                                                                }}
                                                            />
                                                            <div>
                                                                <div className="font-medium text-sm">{service.name}</div>
                                                                <div className="text-xs text-muted-foreground">{service.description}</div>
                                                            </div>
                                                        </div>
                                                        {/* <Badge variant="outline" className="text-[10px]">{service.type}</Badge> */}
                                                    </div>

                                                    {hasAccess && (
                                                        <div className="pl-12 grid grid-cols-3 gap-2 animate-fade-in">
                                                            <div className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`view-${service.id}`}
                                                                    checked={access?.canView}
                                                                    onCheckedChange={(c) => {
                                                                        setFormData((prev: any) => ({
                                                                            ...prev,
                                                                            accessibleServices: prev.accessibleServices?.map((s: any) =>
                                                                                s.serviceId === service.id ? { ...s, canView: !!c } : s
                                                                            )
                                                                        }));
                                                                    }}
                                                                />
                                                                <Label htmlFor={`view-${service.id}`} className="text-xs">Voir</Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`process-${service.id}`}
                                                                    checked={access?.canProcess}
                                                                    onCheckedChange={(c) => {
                                                                        setFormData((prev: any) => ({
                                                                            ...prev,
                                                                            accessibleServices: prev.accessibleServices?.map((s: any) =>
                                                                                s.serviceId === service.id ? { ...s, canProcess: !!c } : s
                                                                            )
                                                                        }));
                                                                    }}
                                                                />
                                                                <Label htmlFor={`process-${service.id}`} className="text-xs">Traiter</Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`validate-${service.id}`}
                                                                    checked={access?.canValidate}
                                                                    onCheckedChange={(c) => {
                                                                        setFormData((prev: any) => ({
                                                                            ...prev,
                                                                            accessibleServices: prev.accessibleServices?.map((s: any) =>
                                                                                s.serviceId === service.id ? { ...s, canValidate: !!c } : s
                                                                            )
                                                                        }));
                                                                    }}
                                                                />
                                                                <Label htmlFor={`validate-${service.id}`} className="text-xs">Valider</Label>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </TabsContent>

                                <TabsContent value="billing" className="space-y-6 mt-0">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-bold uppercase text-muted-foreground">Quotas & Limites</h3>
                                            <div className="space-y-4 border p-4 rounded-lg">
                                                <div className="space-y-2">
                                                    <Label>Quota journalier (Dossiers)</Label>
                                                    <Input
                                                        type="number"
                                                        value={formData.quotas?.maxDailyFiles}
                                                        onChange={(e) => setFormData((p: any) => ({ ...p, quotas: { ...p.quotas, maxDailyFiles: parseInt(e.target.value) } }))}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Stockage (GB)</Label>
                                                    <Input
                                                        type="number"
                                                        value={formData.quotas?.maxStorageGB}
                                                        onChange={(e) => setFormData((p: any) => ({ ...p, quotas: { ...p.quotas, maxStorageGB: parseFloat(e.target.value) } }))}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between pt-2">
                                                    <Label>Export de données</Label>
                                                    <Switch
                                                        checked={formData.quotas?.canExportData}
                                                        onCheckedChange={(c) => setFormData((p: any) => ({ ...p, quotas: { ...p.quotas, canExportData: c } }))}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-sm font-bold uppercase text-muted-foreground">Fonctionnalités Premium</h3>
                                            <div className="space-y-3">
                                                {Object.values(BillingFeature).map(feat => (
                                                    <div key={feat} className="flex items-center justify-between border p-3 rounded-md">
                                                        <Label className="text-xs font-medium">{feat.replace('_', ' ')}</Label>
                                                        <Switch
                                                            checked={formData.billingFeatures?.includes(feat)}
                                                            onCheckedChange={() => toggleBillingFeature(feat)}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                                        <div className="flex items-start gap-3">
                                            <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                                            <div>
                                                <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300">Impact Facturation</h4>
                                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                    L'activation de fonctionnalités premium et l'augmentation des quotas impacteront la facturation mensuelle de l'organisme <strong>{formData.entityId || "N/A"}</strong>.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                            </div>
                        </ScrollArea>
                    </Tabs>

                    <DialogFooter className="mt-4 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
                        <Button type="submit" disabled={loading} className="neu-raised">
                            {loading ? "Enregistrement..." : "Enregistrer les modifications"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
