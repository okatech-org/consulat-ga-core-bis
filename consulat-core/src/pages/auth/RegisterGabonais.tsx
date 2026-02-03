import { GabonaisRegistrationForm } from "@/components/auth/GabonaisRegistrationForm";

export default function RegisterGabonais() {
    return (
        <div className="container py-12">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold mb-2">Inscription Citoyen Gabonais</h1>
                <p className="text-muted-foreground">
                    Accédez à l'ensemble des services consulaires
                </p>
            </div>
            <GabonaisRegistrationForm />
        </div>
    );
}
