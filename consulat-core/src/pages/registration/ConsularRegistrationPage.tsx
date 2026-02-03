import DashboardLayout from '@/layouts/DashboardLayout';
import { ConsularRegistrationForm } from '@/components/registration/ConsularRegistrationForm';
import { toast } from 'sonner';

export default function ConsularRegistrationPage() {
  const handleSubmit = async (data: any) => {
    console.log('Registration data:', data);
    toast.success('Votre demande d\'inscription consulaire a été soumise avec succès!');
    // TODO: Integrate with profileService.create() and requestService.create()
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inscription Consulaire</h1>
          <p className="text-muted-foreground mt-1">
            Complétez le formulaire pour vous inscrire auprès du consulat du Gabon.
          </p>
        </div>

        <ConsularRegistrationForm onSubmit={handleSubmit} />
      </div>
    </DashboardLayout>
  );
}
