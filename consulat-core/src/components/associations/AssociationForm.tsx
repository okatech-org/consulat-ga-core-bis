import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AssociationType, AssociationRole } from '@/types/association';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { associationService } from '@/services/association-service';
import { Users } from 'lucide-react';

const associationSchema = z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    legalName: z.string().optional(),
    associationType: z.nativeEnum(AssociationType),
    registrationNumber: z.string().optional(),
    email: z.string().email('Email invalide'),
    phone: z.string().min(10, 'Numéro de téléphone invalide'),
    website: z.string().url('URL invalide').optional().or(z.literal('')),
    description: z.string().min(20, 'La description doit contenir au moins 20 caractères'),
    shortDescription: z.string().max(200, 'La description courte ne peut dépasser 200 caractères').optional(),
    objectives: z.string().optional(),
    // memberCount is calculated automatically from accepted invitations
    foundingYear: z.coerce.number().min(1900).max(new Date().getFullYear()).optional(),
    ownerRole: z.nativeEnum(AssociationRole),
    address: z.object({
        street: z.string().min(5, 'Adresse invalide'),
        city: z.string().min(2, 'Ville invalide'),
        postalCode: z.string().min(3, 'Code postal invalide'),
        country: z.string().min(2, 'Pays invalide')
    })
});

type AssociationFormData = z.infer<typeof associationSchema>;

export function AssociationForm() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<AssociationFormData>({
        resolver: zodResolver(associationSchema),
        defaultValues: {
            name: '',
            associationType: AssociationType.CULTURAL,
            ownerRole: AssociationRole.PRESIDENT,
            address: {
                country: 'France'
            }
        }
    });

    const onSubmit = async (data: AssociationFormData) => {
        try {
            setIsLoading(true);

            const mockOwnerId = 'user-current';

            await associationService.create({
                name: data.name,
                legalName: data.legalName,
                associationType: data.associationType,
                registrationNumber: data.registrationNumber,
                email: data.email,
                phone: data.phone,
                website: data.website,
                description: data.description,
                shortDescription: data.shortDescription,
                objectives: data.objectives,
                // memberCount will be calculated from members who accept invitations
                foundingYear: data.foundingYear,
                ownerId: mockOwnerId,
                ownerRole: data.ownerRole,
                address: data.address
            });

            toast.success('Association créée avec succès', {
                description: 'Votre association est en attente de validation.'
            });

            navigate('/associations');
        } catch (error) {
            toast.error('Erreur', {
                description: 'Une erreur est survenue lors de la création.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto p-6 neu-raised rounded-xl">
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Créer une association</h2>
                    <p className="text-muted-foreground">Enregistrez votre association pour rejoindre le réseau.</p>
                </div>

                {/* Section: Informations de base */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Informations Générales</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom de l'association *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: ASEGAF" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="associationType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.values(AssociationType).map((type) => (
                                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Section: Contact */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email *</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="contact@asso.org" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Téléphone *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+33..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Section: Adresse */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Siège Social</h3>
                    <FormField
                        control={form.control}
                        name="address.street"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Rue *</FormLabel>
                                <FormControl>
                                    <Input placeholder="123 Rue de..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="address.postalCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Code Postal *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="75000" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address.city"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ville *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Paris" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address.country"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pays *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="France" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Section: Description */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Présentation</h3>
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description complète *</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Présentez votre association..." className="h-32" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <FormLabel>Nombre de membres</FormLabel>
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                                <Users className="w-4 h-4" />
                                <span>Automatique (selon les invitations acceptées)</span>
                            </div>
                        </div>
                        <FormField
                            control={form.control}
                            name="foundingYear"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Année de fondation</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="2000" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Section: Rôle */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Votre Rôle</h3>
                    <FormField
                        control={form.control}
                        name="ownerRole"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fonction dans l'association *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value={AssociationRole.PRESIDENT}>Président</SelectItem>
                                        <SelectItem value={AssociationRole.VICE_PRESIDENT}>Vice-Président</SelectItem>
                                        <SelectItem value={AssociationRole.SECRETARY}>Secrétaire</SelectItem>
                                        <SelectItem value={AssociationRole.TREASURER}>Trésorier</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/associations')}
                    >
                        Annuler
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Création...' : 'Créer l\'association'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
