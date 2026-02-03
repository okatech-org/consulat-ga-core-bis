import { useParams } from "react-router-dom";
import { ChildRegistrationForm } from "@/components/registration/ChildRegistrationForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ChildRegistrationPage() {
    const { childId } = useParams();
    const navigate = useNavigate();

    return (
        <div className="container py-8">
            <Button
                variant="ghost"
                className="mb-6"
                onClick={() => navigate("/dashboard/citizen")}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour au tableau de bord
            </Button>

            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Finalisation de l'inscription</h1>
                <p className="text-muted-foreground">
                    Complétez le dossier pour l'enfant (ID: {childId})
                </p>
            </div>

            <ChildRegistrationForm />
        </div>
    );
}
