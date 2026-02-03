import { HubHero } from "@/components/hub/HubHero";
import { ServiceGrid } from "@/components/hub/ServiceGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Home, GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import informationHero from "@/assets/information-hero.jpg";

export default function Information() {
    const navigate = useNavigate();
    const categories = [
        {
            title: "Administratif",
            icon: FileText,
            description: "Passeports, Visas, Cartes Consulaires et État Civil.",
            items: ["Renouvellement de passeport", "Demande de visa", "Carte consulaire"],
            path: "/services/administratif",
            color: "bg-blue-500"
        },
        {
            title: "Vie Pratique",
            icon: Home,
            description: "Logement, Santé, Transport et Installation.",
            items: ["Trouver un logement", "Assurance maladie", "Permis de conduire"],
            path: "/services/vie-pratique",
            color: "bg-green-500"
        },
        {
            title: "Scolarité & Études",
            icon: GraduationCap,
            description: "Universités, Bourses, Stages et Orientation.",
            items: ["Bourses d'études", "Inscription universitaire", "Offres de stage"],
            path: "/services/etudes",
            color: "bg-yellow-500"
        }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-background">
            <main className="flex-grow">
                <HubHero
                    title="Centre d'Information"
                    subtitle="La base de connaissances officielle pour les Gabonais de l'étranger. Trouvez toutes les réponses à vos questions."
                    backgroundImage={informationHero}
                    align="center"
                />

                <section className="py-16 container mx-auto px-4">
                    <ServiceGrid>
                        {categories.map((category, index) => (
                            <Card key={index} className="group hover:shadow-lg transition-shadow cursor-pointer dark:bg-card dark:border-border" onClick={() => navigate(category.path)}>
                                <CardHeader>
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${category.color} bg-opacity-10 dark:bg-opacity-20`}>
                                        <category.icon className={`w-6 h-6 ${category.color.replace('bg-', 'text-')}`} />
                                    </div>
                                    <CardTitle className="text-xl mb-2 text-foreground">{category.title}</CardTitle>
                                    <p className="text-muted-foreground text-sm mb-4">{category.description}</p>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3 mb-6">
                                        {category.items.map((item, i) => (
                                            <li key={i} className="flex items-center text-gray-700 dark:text-muted-foreground">
                                                <div className={`w-1.5 h-1.5 rounded-full mr-2 ${category.color}`} />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <Button variant="outline" className="w-full group dark:bg-transparent dark:border-border dark:text-foreground dark:hover:bg-accent">
                                        Explorer la rubrique
                                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </ServiceGrid>
                </section>
            </main>
        </div >
    );
}
