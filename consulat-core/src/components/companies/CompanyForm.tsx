import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CompanyType, ActivitySector, CompanyRole } from '@/types/company';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { companyService } from '@/services/company-service';

const companySchema = z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    legalName: z.string().optional(),
    companyType: z.nativeEnum(CompanyType),
    activitySector: z.nativeEnum(ActivitySector),
    siret: z.string().optional(),
    email: z.string().email('Email invalide'),
    phone: z.string().min(10, 'Numéro de téléphone invalide'),
    website: z.string().url('URL invalide').optional().or(z.literal('')),
    description: z.string().min(20, 'La description doit contenir au moins 20 caractères'),
    shortDescription: z.string().max(200, 'La description courte ne peut dépasser 200 caractères').optional(),
    ownerRole: z.nativeEnum(CompanyRole),
    address: z.object({
        street: z.string().min(5, 'Adresse invalide'),
        city: z.string().min(2, 'Ville invalide'),
        postalCode: z.string().min(3, 'Code postal invalide'),
        country: z.string().min(2, 'Pays invalide')
    })
});

type CompanyFormData = z.infer<typeof companySchema>;

export function CompanyForm() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<CompanyFormData>({
        resolver: zodResolver(companySchema),
        defaultValues: {
            name: '',
            companyType: CompanyType.SARL,
            activitySector: ActivitySector.SERVICES,
            ownerRole: CompanyRole.CEO,
            address: {
                country: 'France'
            }
        }
    });

    const onSubmit = async (data: CompanyFormData) => {
        try {
            setIsLoading(true);

            // In a real app, we would get the current user ID from context
            const mockOwnerId = 'user-current';

            await companyService.create({
                name: data.name,
                legalName: data.legalName,
                companyType: data.companyType,
                activitySector: data.activitySector,
                siret: data.siret,
                email: data.email,
                phone: data.phone,
                website: data.website,
                description: data.description,
                shortDescription: data.shortDescription,
                ownerId: mockOwnerId,
                ownerRole: data.ownerRole,
                address: data.address
            });

            toast.success('Entreprise créée avec succès', {
                description: 'Votre entreprise est en attente de validation.'
            });

            navigate('/companies');
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
                    <h2 className="text-2xl font-bold">Créer une entreprise</h2>
                    <p className="text-muted-foreground">Remplissez le formulaire ci-dessous pour référencer votre entreprise.</p>
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
                                    <FormLabel>Nom commercial *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Tech Solutions" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="legalName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Raison sociale</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Tech Solutions SARL" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="companyType"
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
                                            {Object.values(CompanyType).map((type) => (
                                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="activitySector"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Secteur *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.values(ActivitySector).map((sector) => (
                                                <SelectItem key={sector} value={sector}>{sector}</SelectItem>
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
                                        <Input type="email" placeholder="contact@entreprise.com" {...field} />
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
                    <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Site Web</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Section: Adresse */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Adresse</h3>
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
                        name="shortDescription"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description courte (pour les listes)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Une phrase d'accroche..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description complète *</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Présentez votre activité en détail..." className="h-32" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Section: Rôle */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Votre Rôle</h3>
                    <FormField
                        control={form.control}
                        name="ownerRole"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fonction dans l'entreprise *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value={CompanyRole.CEO}>PDG</SelectItem>
                                        <SelectItem value={CompanyRole.PRESIDENT}>Président</SelectItem>
                                        <SelectItem value={CompanyRole.DIRECTOR}>Directeur Général</SelectItem>
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
                        onClick={() => navigate('/companies')}
                    >
                        Annuler
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Création...' : 'Créer l\'entreprise'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
