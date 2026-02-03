import { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useDemo } from "@/contexts/DemoContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    User, Shield, Bell, Palette, Save, Key,
    Smartphone, Globe, Moon, Sun, Mail, Phone,
    Camera, Lock, CheckCircle2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function SettingsPage() {
    const { currentUser } = useDemo();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");

    // Form state
    const [formData, setFormData] = useState({
        firstName: currentUser?.name.split(' ')[0] || '',
        lastName: currentUser?.name.split(' ').slice(1).join(' ') || '',
        email: currentUser?.email || '',
        phone: '+33 6 12 34 56 78',
        language: 'fr',
        theme: 'light',
        emailNotifications: true,
        smsNotifications: false,
        newsletterSubscription: true,
        twoFactorEnabled: false
    });

    const handleSave = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        toast({
            title: "Paramètres enregistrés",
            description: "Vos modifications ont été sauvegardées avec succès.",
        });

        setIsLoading(false);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="neu-raised p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="neu-inset w-16 h-16 rounded-full flex items-center justify-center text-3xl">
                                {currentUser?.badge || '👤'}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">Paramètres</h1>
                                <p className="text-muted-foreground">Gérez votre compte et vos préférences</p>
                            </div>
                        </div>
                        <Button
                            className="neu-raised gap-2"
                            onClick={handleSave}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    Enregistrement...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Enregistrer
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="neu-inset w-full justify-start p-1 mb-6 overflow-x-auto">
                        <TabsTrigger value="profile" className="gap-2">
                            <User className="w-4 h-4" /> Profil
                        </TabsTrigger>
                        <TabsTrigger value="security" className="gap-2">
                            <Shield className="w-4 h-4" /> Sécurité
                        </TabsTrigger>
                        <TabsTrigger value="preferences" className="gap-2">
                            <Palette className="w-4 h-4" /> Préférences
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="gap-2">
                            <Bell className="w-4 h-4" /> Notifications
                        </TabsTrigger>
                        <TabsTrigger value="account" className="gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Compte
                        </TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="space-y-6">
                        <Card className="neu-raised">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary" />
                                    Informations Personnelles
                                </CardTitle>
                                <CardDescription>Mettez à jour vos informations de profil</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-6">
                                    <div className="neu-inset w-24 h-24 rounded-full flex items-center justify-center text-4xl">
                                        {currentUser?.badge || '👤'}
                                    </div>
                                    <div>
                                        <Button variant="outline" className="neu-raised gap-2">
                                            <Camera className="w-4 h-4" />
                                            Changer la photo
                                        </Button>
                                        <p className="text-xs text-muted-foreground mt-2">JPG, PNG ou GIF. Max 2MB.</p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">Prénom</Label>
                                        <Input
                                            id="firstName"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData(p => ({ ...p, firstName: e.target.value }))}
                                            className="neu-inset"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Nom</Label>
                                        <Input
                                            id="lastName"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData(p => ({ ...p, lastName: e.target.value }))}
                                            className="neu-inset"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-muted-foreground" />
                                            Email
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                                            className="neu-inset"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-muted-foreground" />
                                            Téléphone
                                        </Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                                            className="neu-inset"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security" className="space-y-6">
                        <Card className="neu-raised">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-primary" />
                                    Mot de Passe
                                </CardTitle>
                                <CardDescription>Modifiez votre mot de passe</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                                    <Input id="currentPassword" type="password" className="neu-inset" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                                        <Input id="newPassword" type="password" className="neu-inset" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                                        <Input id="confirmPassword" type="password" className="neu-inset" />
                                    </div>
                                </div>
                                <Button variant="outline" className="neu-raised gap-2">
                                    <Key className="w-4 h-4" />
                                    Changer le mot de passe
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="neu-raised">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Smartphone className="w-5 h-5 text-primary" />
                                    Authentification à Deux Facteurs (2FA)
                                </CardTitle>
                                <CardDescription>Ajoutez une couche de sécurité supplémentaire</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between p-4 border rounded-lg neu-inset">
                                    <div>
                                        <p className="font-medium">Activer 2FA</p>
                                        <p className="text-sm text-muted-foreground">Protégez votre compte avec un code de vérification</p>
                                    </div>
                                    <Switch
                                        checked={formData.twoFactorEnabled}
                                        onCheckedChange={(checked) => setFormData(p => ({ ...p, twoFactorEnabled: checked }))}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Preferences Tab */}
                    <TabsContent value="preferences" className="space-y-6">
                        <Card className="neu-raised">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-primary" />
                                    Langue et Région
                                </CardTitle>
                                <CardDescription>Définissez vos préférences de langue</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="language">Langue</Label>
                                    <Select value={formData.language} onValueChange={(v) => setFormData(p => ({ ...p, language: v }))}>
                                        <SelectTrigger className="neu-inset">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="fr">Français</SelectItem>
                                            <SelectItem value="en">English</SelectItem>
                                            <SelectItem value="es">Español</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="neu-raised">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Palette className="w-5 h-5 text-primary" />
                                    Apparence
                                </CardTitle>
                                <CardDescription>Personnalisez l'interface</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label>Thème</Label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { value: 'light', label: 'Clair', icon: Sun },
                                            { value: 'dark', label: 'Sombre', icon: Moon },
                                            { value: 'auto', label: 'Auto', icon: Palette }
                                        ].map(({ value, label, icon: Icon }) => (
                                            <button
                                                key={value}
                                                onClick={() => setFormData(p => ({ ...p, theme: value }))}
                                                className={`neu-inset p-4 rounded-lg flex flex-col items-center gap-2 transition-all ${formData.theme === value ? 'ring-2 ring-primary' : ''
                                                    }`}
                                            >
                                                <Icon className="w-6 h-6" />
                                                <span className="text-sm font-medium">{label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Notifications Tab */}
                    <TabsContent value="notifications" className="space-y-6">
                        <Card className="neu-raised">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-primary" />
                                    Préférences de Notification
                                </CardTitle>
                                <CardDescription>Gérez comment vous recevez les notifications</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border rounded-lg neu-inset">
                                        <div>
                                            <p className="font-medium">Notifications par Email</p>
                                            <p className="text-sm text-muted-foreground">Recevoir des mises à jour par email</p>
                                        </div>
                                        <Switch
                                            checked={formData.emailNotifications}
                                            onCheckedChange={(c) => setFormData(p => ({ ...p, emailNotifications: c }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 border rounded-lg neu-inset">
                                        <div>
                                            <p className="font-medium">Notifications SMS</p>
                                            <p className="text-sm text-muted-foreground">Recevoir des alertes par SMS</p>
                                        </div>
                                        <Switch
                                            checked={formData.smsNotifications}
                                            onCheckedChange={(c) => setFormData(p => ({ ...p, smsNotifications: c }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 border rounded-lg neu-inset">
                                        <div>
                                            <p className="font-medium">Newsletter</p>
                                            <p className="text-sm text-muted-foreground">Actualités et événements du consulat</p>
                                        </div>
                                        <Switch
                                            checked={formData.newsletterSubscription}
                                            onCheckedChange={(c) => setFormData(p => ({ ...p, newsletterSubscription: c }))}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Account Tab */}
                    <TabsContent value="account" className="space-y-6">
                        <Card className="neu-raised">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-primary" />
                                    Informations du Compte
                                </CardTitle>
                                <CardDescription>Détails de votre compte (lecture seule)</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Rôle</Label>
                                        <div className="neu-inset p-3 rounded-lg">
                                            <Badge className="gap-1">
                                                {currentUser?.badge}
                                                <span>{currentUser?.role}</span>
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Type de compte</Label>
                                        <div className="neu-inset p-3 rounded-lg">
                                            <span className="font-medium">{currentUser?.description}</span>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <Label>Permissions</Label>
                                    <div className="neu-inset p-4 rounded-lg max-h-48 overflow-y-auto">
                                        <div className="space-y-2">
                                            {currentUser?.permissions.map((permission, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-sm">
                                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                    <span>{permission}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
