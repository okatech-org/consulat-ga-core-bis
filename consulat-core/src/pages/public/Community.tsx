import { HubHero } from "@/components/hub/HubHero";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Store, Vote, Calendar, ArrowRight, MapPin, Users, Building2, Globe, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import communityHero from "@/assets/community-hero.jpg";
import { EventGallery } from "@/components/community/EventGallery";

export default function Community() {
    const navigate = useNavigate();

    const businesses = [
        {
            name: "Gabon Saveurs",
            type: "Restaurant",
            location: "Paris, France",
            description: "Cuisine authentique gabonaise.",
            image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=60"
        },
        {
            name: "TechGabon Consulting",
            type: "Services IT",
            location: "Montréal, Canada",
            description: "Solutions numériques pour entreprises.",
            image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=60"
        },
        {
            name: "Boutique Okoumé",
            type: "Artisanat",
            location: "Dakar, Sénégal",
            description: "Produits artisanaux et culturels.",
            image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=60"
        }
    ];

    const associations = [
        {
            name: "Union des Étudiants Gabonais",
            type: "Étudiants",
            location: "Bordeaux, France",
            members: "500+",
            description: "Soutien et intégration des étudiants."
        },
        {
            name: "Femmes Solidaires",
            type: "Social",
            location: "Bruxelles, Belgique",
            members: "200+",
            description: "Entraide et promotion de la femme gabonaise."
        },
        {
            name: "Gabon Culture & Arts",
            type: "Culture",
            location: "Lyon, France",
            members: "150+",
            description: "Promotion de la culture gabonaise."
        }
    ];

    const events = [
        {
            title: "Fête de l'Indépendance",
            date: "17 Août 2024",
            location: "Ambassade du Gabon, Paris",
            type: "Célébration"
        },
        {
            title: "Forum Économique Diaspora",
            date: "15 Septembre 2024",
            location: "En ligne",
            type: "Business"
        }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-background">
            <main className="flex-grow">
                <HubHero
                    title="Réseau & Communauté"
                    subtitle="Connectez-vous avec la diaspora gabonaise : économie, entraide et culture."
                    backgroundImage={communityHero}
                    ctaText="Rejoindre le réseau"
                    onCtaClick={() => navigate('/register')}
                />

                {/* Economic Network Section (Orange Theme) */}
                <section className="py-20 container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                        <div>
                            <h2 className="text-3xl font-bold mb-2 flex items-center text-foreground">
                                <span className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center mr-3">
                                    <Store className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                </span>
                                Réseau Économique
                            </h2>
                            <p className="text-gray-600 dark:text-muted-foreground max-w-2xl">
                                Découvrez et soutenez les entrepreneurs gabonais à travers le monde.
                                Un réseau dynamique pour le business et l'innovation.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            className="text-orange-600 border-orange-200 hover:bg-orange-50 dark:border-orange-900/30 dark:hover:bg-orange-900/20"
                            onClick={() => navigate('/companies')}
                        >
                            Voir toutes les entreprises <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {businesses.map((biz, index) => (
                            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-orange-100 dark:border-orange-900/20 overflow-hidden">
                                <div className="h-48 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                                    <img
                                        src={biz.image}
                                        alt={biz.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <span className="absolute bottom-4 left-4 z-20 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                        {biz.type}
                                    </span>
                                </div>
                                <CardContent className="pt-6">
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-orange-600 transition-colors">{biz.name}</h3>
                                    <div className="flex items-center text-gray-500 text-sm mb-3 dark:text-muted-foreground">
                                        <MapPin className="w-4 h-4 mr-1 text-orange-500" /> {biz.location}
                                    </div>
                                    <p className="text-gray-600 mb-6 line-clamp-2 dark:text-muted-foreground">{biz.description}</p>
                                    <Button className="w-full bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-200 dark:bg-orange-900/10 dark:text-orange-400 dark:border-orange-900/30 dark:hover:bg-orange-900/20">
                                        Contacter
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Associations Section (Red Theme) */}
                <section className="py-20 bg-white dark:bg-card/50">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                            <div>
                                <h2 className="text-3xl font-bold mb-2 flex items-center text-foreground">
                                    <span className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mr-3">
                                        <Users className="h-6 w-6 text-red-600 dark:text-red-400" />
                                    </span>
                                    Vie Associative
                                </h2>
                                <p className="text-gray-600 dark:text-muted-foreground max-w-2xl">
                                    Rejoignez les associations qui font vivre la communauté.
                                    Culture, entraide, sport et vie étudiante.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20"
                                onClick={() => navigate('/associations')}
                            >
                                Voir toutes les associations <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {associations.map((asso, index) => (
                                <Card key={index} className="hover:shadow-lg transition-all duration-300 border-red-100 dark:border-red-900/20">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400 font-bold text-xl">
                                                {asso.name.charAt(0)}
                                            </div>
                                            <span className="bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 text-xs px-2 py-1 rounded-full font-medium">
                                                {asso.type}
                                            </span>
                                        </div>
                                        <CardTitle className="text-lg mt-4">{asso.name}</CardTitle>
                                        <CardDescription className="flex items-center gap-2">
                                            <MapPin className="w-3 h-3" /> {asso.location}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-600 mb-6 dark:text-muted-foreground text-sm">{asso.description}</p>
                                        <div className="flex items-center justify-between mt-auto">
                                            <span className="text-xs text-muted-foreground flex items-center">
                                                <Users className="w-3 h-3 mr-1" /> {asso.members} membres
                                            </span>
                                            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                                                Rejoindre
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Past Events Gallery Section */}
                <section className="py-20 bg-muted/30">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4 flex items-center justify-center text-foreground">
                                <span className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mr-3">
                                    <Camera className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </span>
                                Événements Passés
                            </h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Revivez les moments forts de notre communauté à travers notre galerie photo.
                            </p>
                        </div>
                        <EventGallery />
                    </div>
                </section>

                {/* Agenda & Map Integration */}
                <section className="py-20 container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Agenda */}
                        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-none">
                            <CardHeader>
                                <CardTitle className="flex items-center text-2xl">
                                    <Calendar className="mr-3 text-blue-600" /> Agenda Communautaire
                                </CardTitle>
                                <CardDescription>Les prochains rendez-vous de la diaspora</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {events.map((event, index) => (
                                    <div key={index} className="flex items-center bg-white/60 dark:bg-black/20 p-4 rounded-xl backdrop-blur-sm">
                                        <div className="flex-shrink-0 w-16 text-center border-r border-gray-200 dark:border-gray-700 pr-4 mr-4">
                                            <span className="block text-2xl font-bold text-blue-600">{event.date.split(' ')[0]}</span>
                                            <span className="block text-xs uppercase text-gray-500">{event.date.split(' ')[1]}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-foreground">{event.title}</h4>
                                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                                                <MapPin className="w-3 h-3 mr-1" /> {event.location}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="link" className="w-full text-blue-600">
                                    Voir tout l'agenda <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Map CTA */}
                        <div className="relative rounded-2xl overflow-hidden min-h-[400px] flex items-center justify-center bg-slate-900 group cursor-pointer" onClick={() => navigate('/')}>
                            <div className="absolute inset-0 opacity-60 group-hover:opacity-40 transition-opacity">
                                {/* Placeholder for map background image if available, or just use the color */}
                                <div className="w-full h-full bg-[url('/lovable-uploads/libreville-bg.jpg')] bg-cover bg-center" />
                            </div>
                            <div className="relative z-10 text-center p-8 max-w-md">
                                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <Globe className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-4">Carte Interactive</h3>
                                <p className="text-gray-200 mb-8">
                                    Localisez les entreprises, associations et services consulaires près de chez vous sur notre carte mondiale.
                                </p>
                                <Button size="lg" className="bg-white text-slate-900 hover:bg-gray-100">
                                    Explorer la carte
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
