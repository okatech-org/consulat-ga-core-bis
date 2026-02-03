import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Tag } from "lucide-react";
import actualitesHero from "@/assets/actualites-hero.jpg";

export default function Actualites() {
  const articles = [
    {
      id: 1,
      category: "Annonces Consulaires",
      title: "Nouvelles procédures de demande de visa",
      description: "À partir du 1er janvier 2025, de nouvelles procédures simplifiées seront mises en place pour les demandes de visa.",
      date: "15 Décembre 2024",
      badge: "Important",
      badgeVariant: "destructive" as const,
      image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&auto=format&fit=crop&q=60"
    },
    {
      id: 2,
      category: "Sensibilisation Diaspora",
      title: "Campagne d'inscription sur les listes électorales",
      description: "Les membres de la diaspora sont invités à s'inscrire sur les listes électorales avant la date limite.",
      date: "10 Décembre 2024",
      badge: "Urgent",
      badgeVariant: "default" as const,
      image: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&auto=format&fit=crop&q=60"
    },
    {
      id: 3,
      category: "Événements",
      title: "Célébration de la fête nationale",
      description: "Le consulat organise une cérémonie pour célébrer la fête nationale du Gabon le 17 août prochain.",
      date: "5 Décembre 2024",
      badge: "Événement",
      badgeVariant: "secondary" as const,
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=60"
    },
    {
      id: 4,
      category: "Annonces Consulaires",
      title: "Horaires d'ouverture pendant les fêtes",
      description: "Le consulat sera fermé du 24 décembre au 2 janvier. Les services en ligne restent accessibles.",
      date: "1 Décembre 2024",
      badge: "Info",
      badgeVariant: "outline" as const,
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=60"
    },
    {
      id: 5,
      category: "Sensibilisation Diaspora",
      title: "Programme d'aide au retour volontaire",
      description: "Un nouveau programme d'assistance est disponible pour les membres de la diaspora souhaitant retourner au Gabon.",
      date: "25 Novembre 2024",
      badge: "Nouveau",
      badgeVariant: "default" as const,
      image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop&q=60"
    },
    {
      id: 6,
      category: "Événements",
      title: "Forum économique de la diaspora",
      description: "Participez au forum annuel dédié aux opportunités économiques et d'investissement au Gabon.",
      date: "20 Novembre 2024",
      badge: "Événement",
      badgeVariant: "secondary" as const,
      image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=60"
    },
  ];

  return (
    <div className="flex-1 bg-gradient-official dark:bg-none dark:bg-background">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img 
          src={actualitesHero} 
          alt="Actualités consulaires" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">Actualités & Sensibilisation</h1>
            <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto px-4 drop-shadow">
              Restez informé des dernières nouvelles et annonces consulaires
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-12 px-4">

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {articles.map((article, index) => (
            <Card
              key={article.id}
              className="group hover:shadow-elevation transition-all duration-300 hover:-translate-y-1 animate-scale-in overflow-hidden dark:bg-card dark:border-border"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="h-48 w-full overflow-hidden">
                <img 
                  src={article.image} 
                  alt={article.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={article.badgeVariant}>{article.badge}</Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Tag className="h-3 w-3" />
                    <span>{article.category}</span>
                  </div>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2 text-foreground">
                  {article.title}
                </CardTitle>
                <CardDescription className="line-clamp-3 text-muted-foreground">{article.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{article.date}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
