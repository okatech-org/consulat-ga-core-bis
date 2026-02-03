import { ForeignerRegistrationForm } from "@/components/auth/ForeignerRegistrationForm";

export default function RegisterForeigner() {
    return (
        <div className="container py-12">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold mb-2">Inscription Usager Étranger</h1>
                <p className="text-muted-foreground">
                    Demandes de visa et services spécifiques
                </p>
            </div>
            <ForeignerRegistrationForm />
        </div>
    );
}
