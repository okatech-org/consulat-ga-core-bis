import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { HubHero } from "@/components/hub/HubHero";
import { ProfileCard } from "@/components/hub/ProfileCard";
import { ServiceGrid } from "@/components/hub/ServiceGrid";
import { InteractiveWorldMap } from "@/components/InteractiveWorldMap";
import { GraduationCap, Home as HomeIcon, Plane, Newspaper, Globe, MapPin, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import profileStudent from "@/assets/profile-student.jpg";
import profileResident from "@/assets/profile-resident.jpg";
import profileVisitor from "@/assets/profile-visitor.jpg";
import heroHome from "@/assets/hero-home.jpg";

import iconPassport from "@/assets/icons/icon-passport.png";
import iconVisa from "@/assets/icons/icon-visa.png";
import iconConsularCard from "@/assets/icons/icon-consular-card.png";
import iconLegalization from "@/assets/icons/icon-legalization.png";

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

export default function Home() {
  const navigate = useNavigate();

  const profiles = [
    {
      title: "Je suis Étudiant",
      description: "Bourses, logement, équivalences de diplômes et vie étudiante.",
      icon: GraduationCap,
      color: "blue" as const,
      path: "/hub/etudiant",
      image: profileStudent
    },
    {
      title: "Je suis Résident",
      description: "Démarches consulaires, recensement, et vie de la communauté.",
      icon: HomeIcon,
      color: "green" as const,
      path: "/hub/resident",
      image: profileResident
    },
    {
      title: "Je suis Visiteur",
      description: "Visas, tourisme, opportunités d'affaires et guide pratique.",
      icon: Plane,
      color: "orange" as const,
      path: "/hub/visiteur",
      image: profileVisitor
    }
  ];

  const quickServices = [
    { title: "Demande de Visa", icon: FileText, path: "/services/visa" },
    { title: "Passeport Biométrique", icon: FileText, path: "/services/passeport" },
    { title: "Carte Consulaire", icon: FileText, path: "/services/carte-consulaire" },
    { title: "Légalisation", icon: FileText, path: "/services/legalisation" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {/* Hero Section */}
        <HubHero
          title="Bienvenue sur le Hub Numérique du Gabon"
          subtitle="Votre passerelle unique pour toutes vos démarches, informations et connexions avec le Gabon, où que vous soyez."
          backgroundImage={heroHome}
          ctaText="Découvrir les services"
          onCtaClick={() => document.getElementById('profiles')?.scrollIntoView({ behavior: 'smooth' })}
        />

        {/* Profile Selection Section */}
        <motion.section 
          id="profiles" 
          className="py-20 container mx-auto px-4"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div 
            className="text-center mb-12"
            variants={itemVariants}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Quel est votre profil ?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Sélectionnez votre situation pour accéder à des informations et services personnalisés.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <ServiceGrid>
              {profiles.map((profile, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <ProfileCard
                    title={profile.title}
                    description={profile.description}
                    icon={profile.icon}
                    color={profile.color}
                    image={profile.image}
                    onClick={() => navigate(profile.path)}
                  />
                </motion.div>
              ))}
            </ServiceGrid>
          </motion.div>
        </motion.section>

        {/* Quick Access & News */}
        <motion.section 
          className="py-16 bg-muted/30"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="container mx-auto px-4">
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {/* Quick Services */}
              <motion.div className="lg:col-span-2 space-y-8" variants={itemVariants}>

                {/* Pour les Gabonais */}
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center text-foreground/90">
                    <span className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center mr-3">
                      <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </span>
                    Pour les Gabonais
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { title: "Carte Consulaire", icon: iconConsularCard, path: "/services/carte-consulaire" },
                      { title: "Passeport Biométrique", icon: iconPassport, path: "/services/passeport" },
                      { title: "Transcription", icon: iconLegalization, path: "/services/transcription" },
                      { title: "Légalisation et autres", icon: iconLegalization, path: "/services/legalisation" },
                    ].map((service, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-auto py-4 justify-start text-base font-medium bg-card/50 hover:bg-green-500/5 hover:text-green-600 hover:border-green-500/30 transition-all hover:scale-[1.02] border-border/50"
                        onClick={() => navigate(service.path)}
                      >
                        <img src={service.icon} alt="" className="mr-3 h-6 w-6 object-contain" />
                        {service.title}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Pour les Visiteurs */}
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center text-foreground/90">
                    <span className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center mr-3">
                      <Plane className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </span>
                    Pour les Visiteurs
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { title: "Demande de Visa", icon: iconVisa, path: "/services/visa" },
                      { title: "Légalisation et autres", icon: iconLegalization, path: "/services/legalisation-visiteur" },
                    ].map((service, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-auto py-4 justify-start text-base font-medium bg-card/50 hover:bg-orange-500/5 hover:text-orange-600 hover:border-orange-500/30 transition-all hover:scale-[1.02] border-border/50"
                        onClick={() => navigate(service.path)}
                      >
                        <img src={service.icon} alt="" className="mr-3 h-6 w-6 object-contain" />
                        {service.title}
                      </Button>
                    ))}
                  </div>
                </div>

              </motion.div>

              {/* Latest News Preview */}
              <motion.div variants={itemVariants}>
                <h3 className="text-2xl font-bold mb-6 flex items-center">
                  <Newspaper className="mr-2 text-primary" /> Actualités
                </h3>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">Lancement du e-Visa</CardTitle>
                    <CardDescription>Il y a 2 jours</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      La procédure de demande de visa est désormais 100% en ligne...
                    </p>
                    <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/actualites')}>
                      Lire la suite →
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Diplomatic Network Map */}
        <motion.section 
          id="reseau-mondial" 
          className="py-20 bg-gradient-to-b from-background to-muted/20"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-12"
              variants={itemVariants}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Notre Réseau Mondial</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Retrouvez ambassades, consulats, entreprises et associations du Gabon à travers le monde.
                Utilisez la géolocalisation pour trouver votre juridiction administrative.
              </p>
            </motion.div>

            <motion.div 
              className="max-w-7xl mx-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <InteractiveWorldMap />
            </motion.div>

            {/* Map Features */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div 
                className="text-center p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
                variants={itemVariants}
              >
                <MapPin className="w-8 h-8 mx-auto mb-3 text-blue-500" />
                <h4 className="font-semibold mb-2">Géolocalisation</h4>
                <p className="text-sm text-muted-foreground">Trouvez automatiquement votre juridiction la plus proche</p>
              </motion.div>
              <motion.div 
                className="text-center p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
                variants={itemVariants}
              >
                <Globe className="w-8 h-8 mx-auto mb-3 text-emerald-500" />
                <h4 className="font-semibold mb-2">Réseau Complet</h4>
                <p className="text-sm text-muted-foreground">Ambassades, consulats et représentations mondiales</p>
              </motion.div>
              <motion.div 
                className="text-center p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
                variants={itemVariants}
              >
                <FileText className="w-8 h-8 mx-auto mb-3 text-orange-500" />
                <h4 className="font-semibold mb-2">Informations Pratiques</h4>
                <p className="text-sm text-muted-foreground">Horaires, adresses et services disponibles</p>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
