import { JurisdictionSelector } from "@/components/JurisdictionSelector";
import { InteractiveWorldMap } from "@/components/InteractiveWorldMap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Globe, Newspaper, Shield } from "lucide-react";

export default function GlobalHub() {
  const articles = [
    {
      title: "Nouvelles mesures douanières pour la diaspora",
      category: "Administratif",
      region: "Global",
      date: "15 Nov 2025",
    },
    {
      title: "Événement culturel - Fête Nationale",
      category: "Communauté",
      region: "France",
      date: "12 Nov 2025",
    },
    {
      title: "Mise à jour des procédures consulaires",
      category: "Diplomatie",
      region: "USA",
      date: "10 Nov 2025",
    },
  ];

  return (
    <>
      {/* Hero Section - Hub Global */}
      <section className="relative py-16 md:py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center space-y-8 mb-16 animate-fade-in">
            <div className="flex justify-center mb-6">
              <Globe className="h-20 w-20 text-primary animate-pulse" />
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              CONSULAT.GA
            </h1>
            <p className="text-2xl md:text-3xl text-muted-foreground">
              Le portail des Gabonais de l'étranger
            </p>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Accédez aux services de votre consulat où que vous soyez dans le monde.
              Une plateforme unique, des services adaptés à votre localisation.
            </p>

            <div className="pt-6">
              <JurisdictionSelector />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button asChild size="lg" variant="outline" className="min-w-[200px]">
                <Link to="/actualites">
                  <Newspaper className="mr-2 h-5 w-5" />
                  Actualités Diaspora
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="min-w-[200px]">
                <Link to="/demo-portal">
                  <Shield className="mr-2 h-5 w-5" />
                  Portail Démo
                </Link>
              </Button>
            </div>
          </div>

          {/* Carte Interactive */}
          <div className="max-w-7xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <InteractiveWorldMap />
          </div>
        </div>
      </section>

      {/* Section Actualités */}
      <section className="py-20 md:py-24 bg-background">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">L'actualité de la communauté</h2>
            <p className="text-muted-foreground text-lg">
              Restez informés des dernières nouvelles consulaires et événements
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 lg:gap-8">
            {articles.map((article, index) => (
              <Card
                key={index}
                className="hover-scale animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex gap-2 mb-2">
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                      {article.category}
                    </span>
                    <span className="text-xs px-2 py-1 bg-accent text-accent-foreground rounded">
                      {article.region}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                  <CardDescription>{article.date}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full" asChild>
                    <Link to="/actualites">Lire la suite →</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="max-w-2xl mx-auto text-center mt-12">
            <Button asChild variant="outline" size="lg" className="min-w-[250px]">
              <Link to="/actualites">Voir toutes les actualités</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Section Réseau Mondial */}
      <section className="py-20 md:py-24 bg-muted/30">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Un réseau mondial à votre service</h2>
            <p className="text-muted-foreground text-lg md:text-xl mb-12 max-w-3xl mx-auto">
              Ambassades et consulats du Gabon présents sur tous les continents,
              pour accompagner la diaspora gabonaise dans toutes ses démarches administratives.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 max-w-4xl mx-auto">
              {['🇺🇸 USA', '🇫🇷 France', '🇨🇳 Chine', '🇸🇳 Sénégal'].map((country, i) => (
                <div
                  key={i}
                  className="p-4 bg-background rounded-lg shadow-sm hover-scale"
                >
                  <div className="text-3xl mb-2">{country.split(' ')[0]}</div>
                  <div className="text-sm font-medium">{country.split(' ')[1]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
