import { useNavigate } from "react-router-dom";
import { CitizenTypeSelector } from "@/components/auth/CitizenTypeSelector";
import { CitizenType } from "@/types/citizen";

export default function RegistrationChoice() {
    const navigate = useNavigate();

    const handleSelect = (type: CitizenType) => {
        if (type === CitizenType.GABONAIS) {
            navigate("/register/gabonais");
        } else {
            navigate("/register/etranger");
        }
    };

    return (
        <div className="container py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Bienvenue sur le Portail Consulaire</h1>
                <p className="text-xl text-muted-foreground">
                    Veuillez sélectionner votre profil pour commencer l'inscription
                </p>
            </div>
            <CitizenTypeSelector onSelect={handleSelect} />
        </div>
    );
}
