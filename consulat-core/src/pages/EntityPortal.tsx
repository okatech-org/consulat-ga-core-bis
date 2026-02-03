import { useParams, Link } from "react-router-dom";
import { getEntityById } from "@/data/mock-entities";
import { SERVICE_CATALOG, ServiceType } from "@/types/services";
import { COUNTRY_FLAGS } from "@/types/entity";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin } from "lucide-react";

export default function EntityPortal() {
  const { entityId } = useParams<{ entityId: string }>();
  const entity = entityId ? getEntityById(entityId) : null;

  if (!entity) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Entité non trouvée</h1>
          <Button asChild>
            <Link to="/">Retour à l'accueil</Link>
          </Button>
        </div>
      </div>
    );
  }

  const enabledServices = (entity.enabledServices || []) as ServiceType[];

  return (
    <div className="py-12 bg-gradient-official">
      <div className="container">
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au réseau mondial
          </Link>
        </Button>

        <div className="max-w-4xl mx-auto">
          {/* En-tête de l'entité */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="text-6xl mb-4">
              {COUNTRY_FLAGS[entity.countryCode] || '🌍'}
            </div>
            <h1 className="text-4xl font-bold mb-2">{entity.name}</h1>
            <p className="text-xl text-muted-foreground flex items-center justify-center gap-2">
              <MapPin className="h-5 w-5" />
              {entity.city}, {entity.country}
            </p>
            <span className="inline-block mt-4 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
              {entity.type}
            </span>
          </div>

          {/* Services disponibles */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Services disponibles dans cette {entity.type.toLowerCase()}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {enabledServices.map((serviceType, index) => {
                const service = SERVICE_CATALOG[serviceType];
                const Icon = service.icon;
                return (
                  <Card
                    key={serviceType}
                    className="hover-scale animate-scale-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Icon className={`h-6 w-6 ${service.color}`} />
                        </div>
                        <CardTitle>{service.name}</CardTitle>
                      </div>
                      <CardDescription>{service.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full" asChild>
                        <Link to="/login">Accéder au service</Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Informations de contact */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Informations de contact</CardTitle>
              <CardDescription>
                Pour toute question, n'hésitez pas à nous contacter
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">
                <strong>Adresse :</strong> {entity.name}, {entity.city}
              </p>
              <p className="text-sm">
                <strong>Horaires :</strong> Lundi - Vendredi, 9h00 - 17h00
              </p>
              <p className="text-sm">
                <strong>Email :</strong> contact@consulat-{(entity.countryCode || 'ga').toLowerCase()}.ga
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
