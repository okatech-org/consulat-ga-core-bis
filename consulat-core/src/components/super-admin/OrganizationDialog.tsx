import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Organization, OrganizationType, COUNTRY_FLAGS } from "@/types/organization";

interface OrganizationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Organization | null;
    onSave: (data: Partial<Organization>) => Promise<void>;
}

export function OrganizationDialog({ open, onOpenChange, initialData, onSave }: OrganizationDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Organization>>({
        name: "",
        type: OrganizationType.AMBASSADE,
        city: null,
        country: null,
        country_code: null,
        jurisdiction: [],
        enabled_services: [],
        settings: {}
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                name: "",
                type: OrganizationType.AMBASSADE,
                city: null,
                country: null,
                country_code: null,
                jurisdiction: [],
                enabled_services: [],
                settings: {}
            });
        }
    }, [initialData, open]);

    const toggleCountry = (code: string) => {
        setFormData(prev => {
            const current = prev.jurisdiction || [];
            const newJurisdiction = current.includes(code)
                ? current.filter(c => c !== code)
                : [...current, code];

            return {
                ...prev,
                jurisdiction: newJurisdiction
            };
        });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await onSave(formData);
            onOpenChange(false);
        } catch (error) {
            console.error('Error saving organization:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Modifier l'Organisation" : "Nouvelle Organisation"}</DialogTitle>
                    <DialogDescription>
                        Remplissez les informations ci-dessous pour {initialData ? "modifier" : "créer"} une entité diplomatique.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="space-y-4">
                        {/* Basic Info */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Nom</Label>
                            <Input
                                id="name"
                                value={formData.name || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Ambassade du Gabon en France"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value: OrganizationType) =>
                                        setFormData(prev => ({ ...prev, type: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.values(OrganizationType).map(type => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Jurisdiction */}
                        <div className="space-y-2">
                            <Label>Juridiction (Pays)</Label>
                            <div className="grid grid-cols-4 gap-2 mt-2">
                                {Object.entries(COUNTRY_FLAGS).map(([code, flag]) => (
                                    <div key={code} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`country-${code}`}
                                            checked={formData.jurisdiction?.includes(code)}
                                            onCheckedChange={() => toggleCountry(code)}
                                        />
                                        <label
                                            htmlFor={`country-${code}`}
                                            className="text-sm cursor-pointer"
                                        >
                                            {flag} {code}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Annuler
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
