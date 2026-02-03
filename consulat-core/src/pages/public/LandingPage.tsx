import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
    ChevronRight, Globe, Shield, FileText, Users, MapPin,
    Zap, Lock, Smartphone, Clock, Plane, UserCheck,
    CreditCard, Baby, AlertTriangle, Stamp
} from "lucide-react";
import { cn } from "@/lib/utils";
import sceauGabon from "@/assets/sceau_gabon.png";
import { MOCK_SERVICES } from "@/data/mock-services";
import { InteractiveWorldMap } from "@/components/InteractiveWorldMap";
import profileResident from "@/assets/profile-resident-new.png";
import profilePassage from "@/assets/profile-passage-new.png";
import profileVisitor from "@/assets/profile-visitor-new.png";
import communityHero from "@/assets/community-hero.jpg";

// Popular service IDs
const POPULAR_SERVICE_IDS = [
    'consular-card', 'passport-ordinary', 'civil-birth',
    'laissez-passer', 'visa-tourist', 'consular-protection'
];

const LandingPage = () => {
    const navigate = useNavigate();

    const popularServices = MOCK_SERVICES.filter(s => POPULAR_SERVICE_IDS.includes(s.id));

    return (
        <div className={cn(
            "min-h-screen w-full font-sans overflow-y-auto",
            "text-gray-900 dark:text-white bg-background"
        )}>
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/15 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px]" />
            </div>

            {/* ========== HERO SECTION WITH VIDEO ========== */}
            <section className="relative z-10 min-h-[80vh] flex items-center justify-center overflow-hidden">
                {/* Video Background */}
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                >
                    <source src="/videos/video_idn_ga.mp4" type="video/mp4" />
                </video>

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/60" />

                {/* Content */}
                <div className="relative z-10 max-w-6xl mx-auto text-center px-4 lg:px-8 py-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-6"
                    >
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-semibold border border-primary/30 backdrop-blur-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            Plateforme Consulaire Officielle du Gabon
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-white">
                            Vos services consulaires <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-yellow-400 to-green-500">
                                où que vous soyez
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
                            Passeport, état civil, protection consulaire... Effectuez vos démarches
                            administratives gabonaises en ligne, 24h/24, depuis n'importe quel pays.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <Button
                                size="lg"
                                className="h-14 px-8 text-base shadow-xl shadow-primary/30 hover:scale-105 transition-transform"
                                onClick={() => navigate("/register")}
                            >
                                M'inscrire au Consulat
                                <ChevronRight className="w-5 h-5 ml-2" />
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="h-14 px-8 text-base border-white/30 text-white hover:bg-white/10 hover:text-white"
                                onClick={() => navigate("/services")}
                            >
                                Découvrir les services
                            </Button>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex flex-wrap justify-center gap-8 pt-8 text-sm text-white/90">
                            <div className="flex items-center gap-2">
                                <Globe className="w-5 h-5 text-primary" />
                                <span><strong>50+</strong> représentations</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                <span><strong>15+</strong> services</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary" />
                                <span><strong>200K+</strong> usagers</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ========== USER PROFILES SECTION ========== */}
            <section className="relative z-10 py-16 px-4 lg:px-8 bg-muted/30">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-10"
                    >
                        <h2 className="text-3xl font-bold mb-3">Qui êtes-vous ?</h2>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                            Accédez à un espace personnalisé selon votre situation
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Résident */}
                        <ProfileCard
                            image={profileResident}
                            title="Résident à l'étranger"
                            subtitle="Gabonais installé hors du pays (+6 mois)"
                            description="Inscription consulaire complète, renouvellement de passeport, actes d'état civil, protection consulaire."
                            color="green"
                            onClick={() => navigate("/register/gabonais")}
                            delay={0}
                        />

                        {/* De Passage */}
                        <ProfileCard
                            image={profilePassage}
                            title="De passage à l'étranger"
                            subtitle="Gabonais en séjour temporaire (-6 mois)"
                            description="Déclaration temporaire, assistance d'urgence, laissez-passer en cas de perte de documents."
                            color="yellow"
                            onClick={() => navigate("/register/gabonais")}
                            delay={0.1}
                        />

                        {/* Visiteur */}
                        <ProfileCard
                            image={profileVisitor}
                            title="Visiteur / Étranger"
                            subtitle="Souhaitant se rendre au Gabon"
                            description="Demande de visa, légalisation de documents, informations sur l'entrée au Gabon."
                            color="blue"
                            onClick={() => navigate("/register/etranger")}
                            delay={0.2}
                        />
                    </div>
                </div>
            </section>

            {/* ========== POPULAR SERVICES SECTION ========== */}
            <section className="relative z-10 py-16 px-4 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-10"
                    >
                        <h2 className="text-3xl font-bold mb-3">Services les plus demandés</h2>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                            Accédez rapidement aux démarches consulaires les plus courantes
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {popularServices.map((service, index) => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                index={index}
                                onClick={() => navigate("/login")}
                            />
                        ))}
                    </div>

                    <div className="text-center mt-8">
                        <Button variant="outline" onClick={() => navigate("/services")} className="gap-2">
                            Voir tous les services
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* ========== WORLD NETWORK SECTION ========== */}
            <section className="relative z-10 py-10 px-4 lg:px-8 bg-muted/30">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-6"
                    >
                        <h2 className="text-3xl font-bold mb-2">
                            Le Gabon, présent sur <span className="text-primary">5 continents</span>
                        </h2>
                        <p className="text-muted-foreground">
                            Notre réseau diplomatique vous accompagne partout dans le monde. Ambassades, consulats et représentations sont à votre service.
                        </p>
                    </motion.div>

                    {/* Full-width Map */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl border border-border">
                            <InteractiveWorldMap />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ========== ADVANTAGES SECTION ========== */}
            <section className="relative z-10 py-16 px-4 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-10"
                    >
                        <h2 className="text-3xl font-bold mb-3">Pourquoi Consulat.ga ?</h2>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                            Une plateforme moderne au service des Gabonais du monde entier
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <AdvantageCard
                            icon={<Lock className="w-8 h-8" />}
                            title="Sécurisé"
                            description="Vos données sont protégées selon les standards internationaux"
                            color="blue"
                            delay={0}
                        />
                        <AdvantageCard
                            icon={<Zap className="w-8 h-8" />}
                            title="Rapide"
                            description="Démarches simplifiées, suivi en temps réel de vos demandes"
                            color="yellow"
                            delay={0.1}
                        />
                        <AdvantageCard
                            icon={<Globe className="w-8 h-8" />}
                            title="Accessible"
                            description="Disponible 24h/24, 7j/7, depuis n'importe quel pays"
                            color="purple"
                            delay={0.2}
                        />
                        <AdvantageCard
                            icon={<Smartphone className="w-8 h-8" />}
                            title="Moderne"
                            description="Interface intuitive adaptée à tous les appareils"
                            color="green"
                            delay={0.3}
                        />
                    </div>
                </div>
            </section>

            {/* ========== FINAL CTA SECTION ========== */}
            <section className="relative z-10 min-h-[50vh] flex items-center justify-center overflow-hidden">
                {/* Background Image - Full Width */}
                <img
                    src={communityHero}
                    alt="Communauté"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-green-900/50 via-black/40 to-green-900/50" />

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative z-10 text-center text-white px-4 py-16 space-y-6 max-w-3xl mx-auto"
                >
                    <h2 className="text-3xl lg:text-5xl font-bold tracking-tight">
                        Rejoignez la communauté consulaire
                    </h2>
                    <p className="text-white/90 text-lg leading-relaxed">
                        Inscrivez-vous gratuitement et accédez à l'ensemble des services
                        consulaires depuis votre espace personnel sécurisé.
                    </p>
                    <Button
                        size="lg"
                        className="h-16 px-10 text-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold shadow-xl hover:scale-105 transition-all"
                        onClick={() => navigate("/register")}
                    >
                        Créer mon compte consulaire
                        <ChevronRight className="w-6 h-6 ml-2" />
                    </Button>
                </motion.div>
            </section>
        </div>
    );
};

// ========== SUB-COMPONENTS ==========

const ProfileCard = ({ image, title, subtitle, description, color, onClick, delay }: {
    image: string;
    title: string;
    subtitle: string;
    description: string;
    color: 'green' | 'yellow' | 'blue';
    onClick: () => void;
    delay: number;
}) => {
    const colorClasses = {
        green: 'border-green-500 dark:border-green-600 hover:border-green-400 bg-green-50/50 dark:bg-green-950/30',
        yellow: 'border-yellow-500 dark:border-yellow-500 hover:border-yellow-400 bg-yellow-100/80 dark:bg-yellow-950/50 border-2',
        blue: 'border-blue-500 dark:border-blue-600 hover:border-blue-400 bg-blue-50/50 dark:bg-blue-950/30',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay }}
        >
            <Card
                className={cn(
                    "cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden h-full",
                    colorClasses[color]
                )}
                onClick={onClick}
            >
                <div className="h-48 w-full overflow-hidden">
                    <img src={image} alt={title} className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-110" />
                </div>
                <CardContent className="p-6 space-y-4">
                    <div>
                        <h3 className="text-lg font-bold">{title}</h3>
                        <p className="text-sm text-muted-foreground">{subtitle}</p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                    <Button variant="ghost" size="sm" className="gap-1 p-0 h-auto text-primary">
                        Accéder <ChevronRight className="w-4 h-4" />
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
};

const ServiceCard = ({ service, index, onClick }: { service: any; index: number; onClick: () => void }) => {
    const getIcon = (id: string) => {
        const icons: Record<string, React.ReactNode> = {
            'consular-card': <CreditCard className="w-6 h-6" />,
            'passport-ordinary': <Stamp className="w-6 h-6" />,
            'civil-birth': <Baby className="w-6 h-6" />,
            'laissez-passer': <FileText className="w-6 h-6" />,
            'visa-tourist': <Plane className="w-6 h-6" />,
            'consular-protection': <Shield className="w-6 h-6" />,
        };
        return icons[id] || <FileText className="w-6 h-6" />;
    };

    const getIconColor = (id: string) => {
        const colors: Record<string, string> = {
            'consular-card': 'bg-green-500/20 text-green-500',
            'passport-ordinary': 'bg-blue-500/20 text-blue-500',
            'civil-birth': 'bg-pink-500/20 text-pink-500',
            'laissez-passer': 'bg-yellow-500/20 text-yellow-600',
            'visa-tourist': 'bg-purple-500/20 text-purple-500',
            'consular-protection': 'bg-red-500/20 text-red-500',
        };
        return colors[id] || 'bg-primary/10 text-primary';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
        >
            <Card
                className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full"
                onClick={onClick}
            >
                <CardContent className="p-5 flex items-start gap-4">
                    <div className={cn("p-3 rounded-xl flex-shrink-0", getIconColor(service.id))}>
                        {getIcon(service.id)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm line-clamp-1">{service.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {service.shortDescription || service.description}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

const StatBlock = ({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) => (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-card border">
        <div className="text-primary">{icon}</div>
        <div>
            <div className="font-bold text-lg">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
        </div>
    </div>
);

const AdvantageCard = ({ icon, title, description, color, delay }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: 'blue' | 'yellow' | 'purple' | 'green';
    delay: number;
}) => {
    const colorClasses = {
        blue: 'bg-blue-500/20 text-blue-500',
        yellow: 'bg-yellow-500/20 text-yellow-500',
        purple: 'bg-purple-500/20 text-purple-500',
        green: 'bg-green-500/20 text-green-500',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay }}
        >
            <Card className="text-center h-full">
                <CardContent className="p-6 space-y-4">
                    <div className={cn("w-16 h-16 mx-auto rounded-2xl flex items-center justify-center", colorClasses[color])}>
                        {icon}
                    </div>
                    <h3 className="font-bold text-lg">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default LandingPage;
