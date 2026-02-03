import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CV, Experience, Education, Skill, Language } from '@/types/cv';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Save, X } from 'lucide-react';
import { cvService } from '@/services/cv-service';
import { useToast } from '@/hooks/use-toast';

const experienceSchema = z.object({
    title: z.string().min(2, 'Titre requis'),
    company: z.string().min(2, 'Entreprise requise'),
    location: z.string().min(2, 'Lieu requis'),
    startDate: z.string().min(4, 'Date requise'),
    endDate: z.string().optional(),
    current: z.boolean().default(false),
    description: z.string().min(10, 'Description requise')
});

const educationSchema = z.object({
    degree: z.string().min(2, 'Diplôme requis'),
    school: z.string().min(2, 'École requise'),
    location: z.string().min(2, 'Lieu requis'),
    startDate: z.string().min(4, 'Date requise'),
    endDate: z.string().optional(),
    current: z.boolean().default(false),
    description: z.string().optional()
});

const skillSchema = z.object({
    name: z.string().min(2, 'Compétence requise'),
    level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert'])
});

const languageSchema = z.object({
    name: z.string().min(2, 'Langue requise'),
    level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Native'])
});

const cvSchema = z.object({
    firstName: z.string().min(2, 'Prénom requis'),
    lastName: z.string().min(2, 'Nom requis'),
    email: z.string().email('Email invalide'),
    phone: z.string().min(8, 'Téléphone requis'),
    address: z.string().min(5, 'Adresse requise'),
    summary: z.string().min(50, 'Le résumé doit contenir au moins 50 caractères'),
    portfolioUrl: z.string().url().optional().or(z.literal('')),
    linkedinUrl: z.string().url().optional().or(z.literal('')),
    experiences: z.array(experienceSchema),
    education: z.array(educationSchema),
    skills: z.array(skillSchema),
    languages: z.array(languageSchema)
});

type CVFormData = z.infer<typeof cvSchema>;

interface CVFormProps {
    initialData: CV;
    onSave: (data: CV) => void;
    onCancel: () => void;
}

export function CVForm({ initialData, onSave, onCancel }: CVFormProps) {
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();


    const form = useForm<CVFormData>({
        resolver: zodResolver(cvSchema),
        defaultValues: {
            firstName: initialData.firstName || '',
            lastName: initialData.lastName || '',
            email: initialData.email || '',
            phone: initialData.phone || '',
            address: initialData.address || '',
            summary: initialData.summary,
            portfolioUrl: initialData.portfolioUrl || '',
            linkedinUrl: initialData.linkedinUrl || '',
            experiences: initialData.experiences.map(e => ({ ...e, endDate: e.endDate || '' })),
            education: initialData.education.map(e => ({ ...e, endDate: e.endDate || '', description: e.description || '' })),
            skills: initialData.skills,
            languages: initialData.languages
        }
    });

    const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({
        control: form.control,
        name: "experiences"
    });

    const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({
        control: form.control,
        name: "education"
    });

    const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
        control: form.control,
        name: "skills"
    });

    const { fields: langFields, append: appendLang, remove: removeLang } = useFieldArray({
        control: form.control,
        name: "languages"
    });

    const onSubmit = async (data: CVFormData) => {
        try {
            setIsSaving(true);
            // Merge form data with initial data to keep IDs and other fields
            const updatedCV = await cvService.updateCV({
                ...initialData,
                ...data,
                experiences: data.experiences.map((e, i) => ({
                    ...e,
                    id: initialData.experiences[i]?.id || `new-exp-${Date.now()}-${i}`,
                    title: e.title,
                    company: e.company,
                    location: e.location,
                    startDate: e.startDate,
                    current: e.current,
                    description: e.description
                })),
                education: data.education.map((e, i) => ({
                    ...e,
                    id: initialData.education[i]?.id || `new-edu-${Date.now()}-${i}`,
                    degree: e.degree,
                    school: e.school,
                    location: e.location,
                    startDate: e.startDate,
                    current: e.current
                })),
                skills: data.skills.map((s, i) => ({
                    ...s,
                    id: initialData.skills[i]?.id || `new-skill-${Date.now()}-${i}`,
                    name: s.name,
                    level: s.level
                })),
                languages: data.languages.map((l, i) => ({
                    ...l,
                    id: initialData.languages[i]?.id || `new-lang-${Date.now()}-${i}`,
                    name: l.name,
                    level: l.level
                }))
            });

            toast({ title: "✅ CV mis à jour", description: "Vos modifications ont été sauvegardées." });
            onSave(updatedCV);
        } catch (error) {
            toast({ title: "❌ Erreur", description: "Erreur lors de la sauvegarde", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Actions Header */}
                <div className="flex justify-end gap-4 sticky top-4 z-10 bg-background/80 backdrop-blur-sm p-4 rounded-xl border shadow-sm">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        <X className="w-4 h-4 mr-2" /> Annuler
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
                    </Button>
                </div>

                {/* Personal Details */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl space-y-4">
                    <h3 className="text-xl font-bold border-b pb-2">Informations Personnelles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Prénom</FormLabel>
                                    <FormControl><Input placeholder="Jean" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom</FormLabel>
                                    <FormControl><Input placeholder="Dupont" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl><Input placeholder="jean.dupont@example.com" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Téléphone</FormLabel>
                                    <FormControl><Input placeholder="+241 ..." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Adresse</FormLabel>
                                <FormControl><Input placeholder="Libreville, Gabon" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Summary */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl space-y-4">
                    <h3 className="text-xl font-bold border-b pb-2">Profil & Liens</h3>
                    <FormField
                        control={form.control}
                        name="summary"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Résumé Professionnel</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Décrivez votre parcours..." className="h-32" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="linkedinUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL LinkedIn</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://linkedin.com/in/..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="portfolioUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL Portfolio / Site Web</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://mon-site.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Experience */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h3 className="text-xl font-bold">Expérience Professionnelle</h3>
                        <Button type="button" variant="ghost" size="sm" onClick={() => appendExp({ title: '', company: '', location: '', startDate: '', current: false, description: '' })}>
                            <Plus className="w-4 h-4 mr-2" /> Ajouter
                        </Button>
                    </div>
                    <div className="space-y-6">
                        {expFields.map((field, index) => (
                            <div key={field.id} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-lg space-y-4 relative">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 text-destructive hover:text-destructive/90"
                                    onClick={() => removeExp(index)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                                    <FormField
                                        control={form.control}
                                        name={`experiences.${index}.title`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Titre du poste</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`experiences.${index}.company`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Entreprise</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name={`experiences.${index}.location`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Lieu</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`experiences.${index}.startDate`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Date de début</FormLabel>
                                                <FormControl><Input type="month" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`experiences.${index}.endDate`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Date de fin</FormLabel>
                                                <FormControl><Input type="month" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name={`experiences.${index}.description`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl><Textarea className="h-24" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Education */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h3 className="text-xl font-bold">Formation</h3>
                        <Button type="button" variant="ghost" size="sm" onClick={() => appendEdu({ degree: '', school: '', location: '', startDate: '', current: false, description: '' })}>
                            <Plus className="w-4 h-4 mr-2" /> Ajouter
                        </Button>
                    </div>
                    <div className="space-y-6">
                        {eduFields.map((field, index) => (
                            <div key={field.id} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-lg space-y-4 relative">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 text-destructive hover:text-destructive/90"
                                    onClick={() => removeEdu(index)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                                    <FormField
                                        control={form.control}
                                        name={`education.${index}.degree`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Diplôme</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`education.${index}.school`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>École / Université</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name={`education.${index}.location`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Lieu</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`education.${index}.startDate`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Date de début</FormLabel>
                                                <FormControl><Input type="month" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`education.${index}.endDate`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Date de fin</FormLabel>
                                                <FormControl><Input type="month" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Skills & Languages */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Skills */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h3 className="text-xl font-bold">Compétences</h3>
                            <Button type="button" variant="ghost" size="sm" onClick={() => appendSkill({ name: '', level: 'Intermediate' })}>
                                <Plus className="w-4 h-4 mr-2" /> Ajouter
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {skillFields.map((field, index) => (
                                <div key={field.id} className="flex gap-2 items-start">
                                    <FormField
                                        control={form.control}
                                        name={`skills.${index}.name`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormControl><Input placeholder="Ex: React" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`skills.${index}.level`}
                                        render={({ field }) => (
                                            <FormItem className="w-32">
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Beginner">Débutant</SelectItem>
                                                        <SelectItem value="Intermediate">Intermédiaire</SelectItem>
                                                        <SelectItem value="Advanced">Avancé</SelectItem>
                                                        <SelectItem value="Expert">Expert</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeSkill(index)}>
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Languages */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h3 className="text-xl font-bold">Langues</h3>
                            <Button type="button" variant="ghost" size="sm" onClick={() => appendLang({ name: '', level: 'B2' })}>
                                <Plus className="w-4 h-4 mr-2" /> Ajouter
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {langFields.map((field, index) => (
                                <div key={field.id} className="flex gap-2 items-start">
                                    <FormField
                                        control={form.control}
                                        name={`languages.${index}.name`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormControl><Input placeholder="Ex: Anglais" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`languages.${index}.level`}
                                        render={({ field }) => (
                                            <FormItem className="w-32">
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="A1">A1</SelectItem>
                                                        <SelectItem value="A2">A2</SelectItem>
                                                        <SelectItem value="B1">B1</SelectItem>
                                                        <SelectItem value="B2">B2</SelectItem>
                                                        <SelectItem value="C1">C1</SelectItem>
                                                        <SelectItem value="C2">C2</SelectItem>
                                                        <SelectItem value="Native">Langue Mat.</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeLang(index)}>
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    );
}
