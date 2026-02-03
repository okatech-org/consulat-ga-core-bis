import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConsularService } from "@/types/services";

interface ServiceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: ConsularService | null;
    onSave: (data: Partial<ConsularService>) => Promise<void>;
}

export function ServiceDialog({ open, onOpenChange, initialData, onSave }: ServiceDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<ConsularService>>({
        name: "",
        description: "",
        requirements: [],
        price: 0,
        currency: 'EUR'
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                name: "",
                description: "",
                requirements: [],
                price: 0,
                currency: 'EUR'
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? `Modifier le Service: ${initialData.name}` : "Nouveau Service"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nom du Service</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                            placeholder="Ex: Visa Court Séjour"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description || ''}
                            onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                            rows={3}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Prix</Label>
                            <Input
                                id="price"
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData(p => ({ ...p, price: parseFloat(e.target.value) }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="currency">Devise</Label>
                            <Input
                                id="currency"
                                value={formData.currency}
                                onChange={(e) => setFormData(p => ({ ...p, currency: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Documents Requis (séparés par des virgules)</Label>
                        <Textarea
                            value={formData.requirements?.join(", ")}
                            onChange={(e) => setFormData(p => ({ ...p, requirements: e.target.value.split(",").map(s => s.trim()) }))}
                            rows={3}
                            placeholder="Passeport, Photo, Formulaire..."
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
                        <Button type="submit" disabled={loading} className="neu-raised">
                            {loading ? "Enregistrement..." : "Enregistrer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
