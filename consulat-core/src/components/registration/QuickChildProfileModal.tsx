import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const QuickChildProfileSchema = z.object({
    firstName: z.string().min(2, 'Prénom requis'),
    lastName: z.string().min(2, 'Nom requis'),
});

type QuickChildProfileFormData = z.infer<typeof QuickChildProfileSchema>;

type QuickChildProfileModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    residenceCountry: string;
    onSuccess?: (childId: string) => void;
};

import { useNavigate } from 'react-router-dom';

export function QuickChildProfileModal({
    open,
    onOpenChange,
    residenceCountry,
    onSuccess
}: QuickChildProfileModalProps) {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<QuickChildProfileFormData>({
        resolver: zodResolver(QuickChildProfileSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
        },
    });

    const handleSubmit = async (data: QuickChildProfileFormData) => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log("Creating child profile:", { ...data, residenceCountry });

            toast.success('Profil créé', {
                description: `Le profil de ${data.firstName} ${data.lastName} a été créé avec succès`,
            });

            onOpenChange(false);
            form.reset();

            if (onSuccess) {
                // Simulate returning a new ID
                const newId = `CHILD-${Date.now()}`;
                onSuccess(newId);
                navigate(`/dashboard/citizen/child/${newId}`);
            }

        } catch (error) {
            toast.error('Erreur lors de la création du profil');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Ajouter un enfant</DialogTitle>
                    <DialogDescription>
                        Créez rapidement le profil de votre enfant pour commencer ses démarches.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Prénom(s)</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Ex: Junior"
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom(s)</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e.target.value.toUpperCase());
                                            }}
                                            placeholder="Ex: MBA"
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                Annuler
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Créer et continuer
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
