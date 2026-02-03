import { useState, useEffect } from "react";
import { Save, AlertTriangle, Bell, Shield, Database, Mail, RefreshCw, XCircle, CheckCircle2 } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Types
interface SettingsState {
    maintenanceMode: boolean;
    systemNotifications: boolean;
    emailSender: string;
    adminEmail: string;
    backupFrequency: string;
    securityLevel: string;
    announcementMessage: string;
}

const INITIAL_SETTINGS: SettingsState = {
    maintenanceMode: false,
    systemNotifications: true,
    emailSender: "noreply@consulat.ga",
    adminEmail: "admin@consulat.ga",
    backupFrequency: "daily",
    securityLevel: "high",
    announcementMessage: ""
};

export default function SuperAdminSettings() {
    const { toast } = useToast();

    // State
    const [settings, setSettings] = useState<SettingsState>(INITIAL_SETTINGS);
    const [originalSettings, setOriginalSettings] = useState<SettingsState>(INITIAL_SETTINGS);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isDirty, setIsDirty] = useState(false);

    // Check for changes
    useEffect(() => {
        setIsDirty(JSON.stringify(settings) !== JSON.stringify(originalSettings));
    }, [settings, originalSettings]);

    // Validation
    const validateSettings = (data: SettingsState) => {
        const errors: string[] = [];

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.emailSender || !emailRegex.test(data.emailSender)) {
            errors.push("L'email de l'expéditeur est invalide.");
        }
        if (!data.adminEmail || !emailRegex.test(data.adminEmail)) {
            errors.push("L'email de l'administrateur est invalide.");
        }
        if (data.announcementMessage.length > 500) {
            errors.push("Le message d'annonce ne doit pas dépasser 500 caractères.");
        }

        return errors;
    };

    // Actions
    const handleSave = async () => {
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            // Validation
            const validationErrors = validateSettings(settings);
            if (validationErrors.length > 0) {
                throw new Error(validationErrors.join(" "));
            }

            // Simulate API Call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Success
            setOriginalSettings(settings);
            setSuccess("Les paramètres ont été mis à jour avec succès.");
            toast({
                title: "Succès",
                description: "Configuration système mise à jour.",
                variant: "default",
            });

            // Auto-hide success message
            setTimeout(() => setSuccess(null), 5000);

        } catch (err: any) {
            setError(err.message || "Une erreur est survenue lors de l'enregistrement.");
            toast({
                title: "Erreur",
                description: err.message || "Échec de l'enregistrement.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setSettings(originalSettings);
        setError(null);
        setSuccess(null);
        toast({
            title: "Annulé",
            description: "Les modifications non enregistrées ont été annulées.",
        });
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-4xl mx-auto pb-20">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Paramètres Système</h1>
                    <p className="text-muted-foreground">
                        Configuration globale de la plateforme consulaire
                    </p>
                </div>

                {/* ALERTS */}
                {error && (
                    <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Erreur</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className="border-green-500 text-green-700 bg-green-50">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertTitle>Succès</AlertTitle>
                        <AlertDescription>{success}</AlertDescription>
                    </Alert>
                )}

                {/* SYSTEM STATUS */}
                <div className="neu-raised p-6 rounded-xl space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="neu-inset p-2 rounded-full text-orange-600">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold">État du Système</h2>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50/50">
                        <div className="space-y-0.5">
                            <Label className="text-base font-bold">Mode Maintenance</Label>
                            <p className="text-sm text-muted-foreground">
                                Désactive l'accès public au portail pour maintenance.
                            </p>
                        </div>
                        <Switch
                            checked={settings.maintenanceMode}
                            onCheckedChange={(c) => setSettings(s => ({ ...s, maintenanceMode: c }))}
                            aria-label="Activer le mode maintenance"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Message d'annonce global</Label>
                        <Textarea
                            placeholder="Message affiché sur toutes les pages..."
                            value={settings.announcementMessage}
                            onChange={(e) => setSettings(s => ({ ...s, announcementMessage: e.target.value }))}
                            className="bg-transparent"
                            rows={3}
                        />
                        <p className="text-xs text-muted-foreground text-right">
                            {settings.announcementMessage.length}/500 caractères
                        </p>
                    </div>
                </div>

                {/* NOTIFICATIONS & EMAIL */}
                <div className="neu-raised p-6 rounded-xl space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="neu-inset p-2 rounded-full text-blue-600">
                            <Mail className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold">Email & Notifications</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Email Expéditeur</Label>
                            <Input
                                value={settings.emailSender}
                                onChange={(e) => setSettings(s => ({ ...s, emailSender: e.target.value }))}
                                placeholder="noreply@consulat.ga"
                                type="email"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email Administrateur</Label>
                            <Input
                                value={settings.adminEmail}
                                onChange={(e) => setSettings(s => ({ ...s, adminEmail: e.target.value }))}
                                placeholder="admin@consulat.ga"
                                type="email"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50/50">
                        <div className="space-y-0.5">
                            <Label className="text-base font-bold">Notifications Système</Label>
                            <p className="text-sm text-muted-foreground">
                                Recevoir des alertes pour les événements critiques.
                            </p>
                        </div>
                        <Switch
                            checked={settings.systemNotifications}
                            onCheckedChange={(c) => setSettings(s => ({ ...s, systemNotifications: c }))}
                            aria-label="Activer les notifications système"
                        />
                    </div>
                </div>

                {/* SECURITY & BACKUP */}
                <div className="neu-raised p-6 rounded-xl space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="neu-inset p-2 rounded-full text-green-600">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold">Sécurité & Sauvegardes</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Fréquence de Sauvegarde</Label>
                            <Select
                                value={settings.backupFrequency}
                                onValueChange={(v) => setSettings(s => ({ ...s, backupFrequency: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner la fréquence" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="hourly">Toutes les heures</SelectItem>
                                    <SelectItem value="daily">Quotidienne</SelectItem>
                                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Niveau de Sécurité</Label>
                            <Select
                                value={settings.securityLevel}
                                onValueChange={(v) => setSettings(s => ({ ...s, securityLevel: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner le niveau" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="standard">Standard</SelectItem>
                                    <SelectItem value="high">Élevé (2FA requis)</SelectItem>
                                    <SelectItem value="strict">Strict (IP Whitelist)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-4 sticky bottom-6 bg-background/90 backdrop-blur-md p-4 rounded-xl border border-gray-200 shadow-lg z-10">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={loading || !isDirty}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={loading || !isDirty}
                        className="min-w-[150px]"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                Enregistrement...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Save className="w-4 h-4" />
                                Enregistrer
                            </div>
                        )}
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
}
