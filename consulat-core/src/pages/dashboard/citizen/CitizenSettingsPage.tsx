import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { User, Bell, Shield, Save, Palette, Check } from 'lucide-react';
import { useThemeStyle, THEME_OPTIONS, UserSpaceTheme } from '@/context/ThemeStyleContext';
import { cn } from '@/lib/utils';

export default function CitizenSettingsPage() {
    const { userSpaceTheme, setUserSpaceTheme } = useThemeStyle();

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold">Paramètres</h1>
                <p className="text-muted-foreground">Gérez vos préférences et informations personnelles.</p>
            </div>

            <div className="grid gap-8">
                {/* Preferences - Theme Selector */}
                <div className="glass-card p-6 rounded-xl space-y-6">
                    <div className="flex items-center gap-3 border-b pb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Palette className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Préférences</h2>
                            <p className="text-sm text-muted-foreground">Personnalisez l'apparence de votre espace</p>
                        </div>
                    </div>

                    <div>
                        <Label className="text-base mb-4 block">Thème de l'interface</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {THEME_OPTIONS.map((theme) => (
                                <ThemeCard
                                    key={theme.id}
                                    theme={theme}
                                    isSelected={userSpaceTheme === theme.id}
                                    onSelect={() => setUserSpaceTheme(theme.id)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Profile Settings */}
                <div className="glass-card p-6 rounded-xl space-y-6">
                    <div className="flex items-center gap-3 border-b pb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <User className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold">Profil</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Prénom</Label>
                            <Input defaultValue="Jean" />
                        </div>
                        <div className="space-y-2">
                            <Label>Nom</Label>
                            <Input defaultValue="Dupont" />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input defaultValue="jean.dupont@example.com" />
                        </div>
                        <div className="space-y-2">
                            <Label>Téléphone</Label>
                            <Input defaultValue="+33 6 12 34 56 78" />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button>
                            <Save className="w-4 h-4 mr-2" /> Enregistrer
                        </Button>
                    </div>
                </div>

                {/* Notifications */}
                <div className="glass-card p-6 rounded-xl space-y-6">
                    <div className="flex items-center gap-3 border-b pb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Bell className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold">Notifications</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Emails de mise à jour</Label>
                                <p className="text-sm text-muted-foreground">Recevoir des emails sur l'état de mes demandes.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Newsletter</Label>
                                <p className="text-sm text-muted-foreground">Recevoir les actualités du consulat.</p>
                            </div>
                            <Switch />
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="glass-card p-6 rounded-xl space-y-6">
                    <div className="flex items-center gap-3 border-b pb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Shield className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold">Sécurité</h2>
                    </div>

                    <div className="space-y-4">
                        <Button variant="outline" className="w-full justify-start">
                            Changer le mot de passe
                        </Button>
                        <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                            Supprimer mon compte
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Theme Card Component
function ThemeCard({
    theme,
    isSelected,
    onSelect
}: {
    theme: typeof THEME_OPTIONS[0];
    isSelected: boolean;
    onSelect: () => void;
}) {
    const previewStyles: Record<UserSpaceTheme, string> = {
        classic: 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900',
        idn: 'bg-gradient-to-br from-primary/20 via-transparent to-accent/20 backdrop-blur',
        minimal: 'bg-white dark:bg-gray-950',
    };

    return (
        <Card
            className={cn(
                "cursor-pointer transition-all duration-300 hover:shadow-lg overflow-hidden",
                isSelected ? "ring-2 ring-primary ring-offset-2" : "hover:scale-[1.02]"
            )}
            onClick={onSelect}
        >
            <CardContent className="p-0">
                {/* Preview Area */}
                <div className={cn("h-24 relative", previewStyles[theme.id])}>
                    <div className="absolute inset-2 flex items-center justify-center">
                        <span className="text-4xl">{theme.preview}</span>
                    </div>
                    {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <Check className="w-4 h-4" />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="p-4">
                    <h3 className="font-semibold">{theme.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{theme.description}</p>
                </div>
            </CardContent>
        </Card>
    );
}

