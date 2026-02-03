import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { User, MapPin, Briefcase, Phone, FileText, Shield, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Gender, MaritalStatus, WorkStatus } from '@/lib/constants';

const personalInfoSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  birthDate: z.string().min(1, 'La date de naissance est requise'),
  birthPlace: z.string().min(2, 'Le lieu de naissance est requis'),
  birthCountry: z.string().min(2, 'Le pays de naissance est requis'),
  gender: z.string().min(1, 'Le genre est requis'),
  nationality: z.string().default('GA'),
});

const contactInfoSchema = z.object({
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Numéro de téléphone invalide'),
  street: z.string().min(5, 'Adresse requise'),
  city: z.string().min(2, 'Ville requise'),
  postalCode: z.string().min(4, 'Code postal requis'),
  country: z.string().min(2, 'Pays requis'),
});

const professionalInfoSchema = z.object({
  workStatus: z.string().min(1, 'Statut professionnel requis'),
  profession: z.string().optional(),
  employer: z.string().optional(),
  employerAddress: z.string().optional(),
});

const emergencyContactSchema = z.object({
  emergencyFirstName: z.string().min(2, 'Prénom requis'),
  emergencyLastName: z.string().min(2, 'Nom requis'),
  emergencyRelationship: z.string().min(1, 'Relation requise'),
  emergencyPhone: z.string().min(10, 'Téléphone requis'),
  emergencyEmail: z.string().email('Email invalide').optional(),
});

const STEPS = [
  { id: 'personal', label: 'Identité', icon: User, description: 'Informations personnelles' },
  { id: 'contact', label: 'Coordonnées', icon: MapPin, description: 'Adresse et contact' },
  { id: 'professional', label: 'Profession', icon: Briefcase, description: 'Situation professionnelle' },
  { id: 'emergency', label: 'Urgence', icon: Phone, description: 'Contact d\'urgence' },
  { id: 'documents', label: 'Documents', icon: FileText, description: 'Pièces justificatives' },
  { id: 'review', label: 'Validation', icon: Shield, description: 'Vérification finale' },
];

interface ConsularRegistrationFormProps {
  onSubmit?: (data: any) => void;
  initialData?: any;
}

export function ConsularRegistrationForm({ onSubmit, initialData }: ConsularRegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>(initialData || {});

  const personalForm = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: formData.personal || {},
  });

  const contactForm = useForm({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: formData.contact || {},
  });

  const professionalForm = useForm({
    resolver: zodResolver(professionalInfoSchema),
    defaultValues: formData.professional || {},
  });

  const emergencyForm = useForm({
    resolver: zodResolver(emergencyContactSchema),
    defaultValues: formData.emergency || {},
  });

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleNext = async () => {
    let isValid = false;
    
    switch (currentStep) {
      case 0:
        isValid = await personalForm.trigger();
        if (isValid) setFormData(prev => ({ ...prev, personal: personalForm.getValues() }));
        break;
      case 1:
        isValid = await contactForm.trigger();
        if (isValid) setFormData(prev => ({ ...prev, contact: contactForm.getValues() }));
        break;
      case 2:
        isValid = await professionalForm.trigger();
        if (isValid) setFormData(prev => ({ ...prev, professional: professionalForm.getValues() }));
        break;
      case 3:
        isValid = await emergencyForm.trigger();
        if (isValid) setFormData(prev => ({ ...prev, emergency: emergencyForm.getValues() }));
        break;
      case 4:
        isValid = true; // Documents step - validation handled separately
        break;
      default:
        isValid = true;
    }

    if (isValid && currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    toast.success('Inscription consulaire soumise avec succès!');
    onSubmit?.(formData);
  };

  const CurrentStepIcon = STEPS[currentStep].icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card className="neu-raised">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <CurrentStepIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{STEPS[currentStep].label}</CardTitle>
                <CardDescription>{STEPS[currentStep].description}</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              Étape {currentStep + 1} / {STEPS.length}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {STEPS.map((step, index) => (
              <button
                key={step.id}
                onClick={() => index < currentStep && setCurrentStep(index)}
                disabled={index > currentStep}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                  index === currentStep
                    ? 'bg-primary text-primary-foreground'
                    : index < currentStep
                    ? 'bg-muted hover:bg-muted/80 cursor-pointer'
                    : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                }`}
              >
                {index < currentStep ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <step.icon className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{step.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card className="neu-raised">
        <CardContent className="pt-6">
          {/* Step 0: Personal Information */}
          {currentStep === 0 && (
            <Form {...personalForm}>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={personalForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom *</FormLabel>
                        <FormControl>
                          <Input placeholder="Jean" {...field} className="neu-inset" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={personalForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom *</FormLabel>
                        <FormControl>
                          <Input placeholder="Dupont" {...field} className="neu-inset" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={personalForm.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de naissance *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="neu-inset" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={personalForm.control}
                    name="birthPlace"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lieu de naissance *</FormLabel>
                        <FormControl>
                          <Input placeholder="Libreville" {...field} className="neu-inset" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={personalForm.control}
                    name="birthCountry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pays de naissance *</FormLabel>
                        <FormControl>
                          <Input placeholder="Gabon" {...field} className="neu-inset" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={personalForm.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Genre *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="neu-inset">
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={Gender.Male}>Masculin</SelectItem>
                            <SelectItem value={Gender.Female}>Féminin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          )}

          {/* Step 1: Contact Information */}
          {currentStep === 1 && (
            <Form {...contactForm}>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={contactForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="jean.dupont@email.com" {...field} className="neu-inset" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={contactForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone *</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+33 6 12 34 56 78" {...field} className="neu-inset" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={contactForm.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Adresse *</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Rue de la Paix" {...field} className="neu-inset" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={contactForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ville *</FormLabel>
                        <FormControl>
                          <Input placeholder="Paris" {...field} className="neu-inset" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={contactForm.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code postal *</FormLabel>
                        <FormControl>
                          <Input placeholder="75001" {...field} className="neu-inset" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={contactForm.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pays de résidence *</FormLabel>
                        <FormControl>
                          <Input placeholder="France" {...field} className="neu-inset" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          )}

          {/* Step 2: Professional Information */}
          {currentStep === 2 && (
            <Form {...professionalForm}>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={professionalForm.control}
                    name="workStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Statut professionnel *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="neu-inset">
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={WorkStatus.Employee}>Salarié</SelectItem>
                            <SelectItem value={WorkStatus.SelfEmployed}>Indépendant</SelectItem>
                            <SelectItem value={WorkStatus.Entrepreneur}>Entrepreneur</SelectItem>
                            <SelectItem value={WorkStatus.Student}>Étudiant</SelectItem>
                            <SelectItem value={WorkStatus.Retired}>Retraité</SelectItem>
                            <SelectItem value={WorkStatus.Unemployed}>Sans emploi</SelectItem>
                            <SelectItem value={WorkStatus.Other}>Autre</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={professionalForm.control}
                    name="profession"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profession</FormLabel>
                        <FormControl>
                          <Input placeholder="Ingénieur" {...field} className="neu-inset" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={professionalForm.control}
                    name="employer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employeur</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom de l'entreprise" {...field} className="neu-inset" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={professionalForm.control}
                    name="employerAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse de l'employeur</FormLabel>
                        <FormControl>
                          <Input placeholder="Adresse de l'entreprise" {...field} className="neu-inset" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          )}

          {/* Step 3: Emergency Contact */}
          {currentStep === 3 && (
            <Form {...emergencyForm}>
              <form className="space-y-6">
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 mb-6">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Cette personne sera contactée en cas d'urgence. Elle doit résider au Gabon ou dans le pays de résidence.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={emergencyForm.control}
                    name="emergencyFirstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom *</FormLabel>
                        <FormControl>
                          <Input placeholder="Marie" {...field} className="neu-inset" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={emergencyForm.control}
                    name="emergencyLastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom *</FormLabel>
                        <FormControl>
                          <Input placeholder="Dupont" {...field} className="neu-inset" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={emergencyForm.control}
                    name="emergencyRelationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lien de parenté *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="neu-inset">
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="spouse">Conjoint(e)</SelectItem>
                            <SelectItem value="parent">Parent</SelectItem>
                            <SelectItem value="sibling">Frère/Sœur</SelectItem>
                            <SelectItem value="child">Enfant</SelectItem>
                            <SelectItem value="friend">Ami(e)</SelectItem>
                            <SelectItem value="other">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={emergencyForm.control}
                    name="emergencyPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone *</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+241 07 12 34 56" {...field} className="neu-inset" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={emergencyForm.control}
                    name="emergencyEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="marie.dupont@email.com" {...field} className="neu-inset" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          )}

          {/* Step 4: Documents */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Veuillez télécharger les documents requis pour votre inscription consulaire.
                </p>
              </div>
              <div className="grid gap-4">
                {[
                  { label: 'Passeport (pages d\'identité)', required: true },
                  { label: 'Acte de naissance', required: true },
                  { label: 'Justificatif de domicile', required: true },
                  { label: 'Photo d\'identité', required: true },
                  { label: 'Certificat de nationalité (si applicable)', required: false },
                ].map((doc) => (
                  <div key={doc.label} className="flex items-center justify-between p-4 border rounded-lg neu-inset">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.required ? 'Requis' : 'Optionnel'}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Télécharger
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200">
                  Veuillez vérifier les informations saisies avant de soumettre votre demande.
                </p>
              </div>
              
              {/* Summary sections */}
              {formData.personal && (
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" /> Informations personnelles
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm p-4 bg-muted/50 rounded-lg">
                    <p><span className="text-muted-foreground">Nom:</span> {formData.personal.firstName} {formData.personal.lastName}</p>
                    <p><span className="text-muted-foreground">Né(e) le:</span> {formData.personal.birthDate}</p>
                    <p><span className="text-muted-foreground">Lieu:</span> {formData.personal.birthPlace}, {formData.personal.birthCountry}</p>
                  </div>
                </div>
              )}

              {formData.contact && (
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Coordonnées
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm p-4 bg-muted/50 rounded-lg">
                    <p><span className="text-muted-foreground">Email:</span> {formData.contact.email}</p>
                    <p><span className="text-muted-foreground">Tél:</span> {formData.contact.phone}</p>
                    <p className="col-span-2"><span className="text-muted-foreground">Adresse:</span> {formData.contact.street}, {formData.contact.postalCode} {formData.contact.city}, {formData.contact.country}</p>
                  </div>
                </div>
              )}

              {formData.professional && (
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Briefcase className="h-4 w-4" /> Situation professionnelle
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm p-4 bg-muted/50 rounded-lg">
                    <p><span className="text-muted-foreground">Statut:</span> {formData.professional.workStatus}</p>
                    <p><span className="text-muted-foreground">Profession:</span> {formData.professional.profession || 'N/A'}</p>
                  </div>
                </div>
              )}

              {formData.emergency && (
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Contact d'urgence
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm p-4 bg-muted/50 rounded-lg">
                    <p><span className="text-muted-foreground">Nom:</span> {formData.emergency.emergencyFirstName} {formData.emergency.emergencyLastName}</p>
                    <p><span className="text-muted-foreground">Tél:</span> {formData.emergency.emergencyPhone}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
          className="neu-raised"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Précédent
        </Button>
        
        {currentStep < STEPS.length - 1 ? (
          <Button onClick={handleNext} className="neu-raised">
            Suivant
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
            <Check className="h-4 w-4 mr-2" />
            Soumettre l'inscription
          </Button>
        )}
      </div>
    </div>
  );
}
