import { HubHero } from "@/components/hub/HubHero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayCircle, FileText, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import academieHero from "@/assets/academie-hero.jpg";


export default function Tutorials() {
    const featuredTutorials = [
        {
            title: "Comment renouveler son passeport ?",
            duration: "5 min",
            type: "video",
            category: "Administratif"
        },
        {
            title: "Créer son entreprise au Gabon depuis l'étranger",
            duration: "10 min read",
            type: "article",
            category: "Entrepreneuriat"
        },
        {
            title: "Demander un e-Visa : Guide étape par étape",
            duration: "3 min",
            type: "video",
            category: "Voyage"
        }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-background">
            <main className="flex-grow">
                <HubHero
                    title="Académie Numérique"
                    subtitle="Apprenez à réaliser vos démarches en toute autonomie grâce à nos tutoriels interactifs et guides pratiques."
                    backgroundImage={academieHero}
                    align="center"
                />

                {/* Search Section */}
                <section className="py-12 bg-white border-b dark:bg-card dark:border-border">
                    <div className="container mx-auto px-4 max-w-2xl">
                        <div className="relative">
                            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                            <Input
                                placeholder="Que souhaitez-vous apprendre aujourd'hui ?"
                                className="pl-12 py-6 text-lg rounded-full shadow-sm dark:bg-muted dark:text-foreground dark:border-border"
                            />
                        </div>
                    </div>
                </section>

                {/* Featured Tutorials */}
                <section className="py-20 container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-10 text-center">À la une</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {featuredTutorials.map((tutorial, index) => (
                            <Card key={index} className="group cursor-pointer hover:shadow-xl transition-all duration-300 dark:bg-card dark:border-border">
                                <div className="relative h-48 bg-gray-200 dark:bg-muted rounded-t-xl overflow-hidden">
                                    <div className="absolute inset-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                                        {tutorial.type === 'video' ? (
                                            <PlayCircle className="w-16 h-16 text-white opacity-80" />
                                        ) : (
                                            <FileText className="w-16 h-16 text-gray-400 opacity-80" />
                                        )}
                                    </div>
                                    <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                        {tutorial.duration}
                                    </div>
                                </div>
                                <CardHeader>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
                                            {tutorial.category}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{tutorial.duration}</span>
                                    </div>
                                    <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors text-foreground">
                                        {tutorial.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Button variant="link" className="p-0 text-gray-600 group-hover:text-primary">
                                        Commencer <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
