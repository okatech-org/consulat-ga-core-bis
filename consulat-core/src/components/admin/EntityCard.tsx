import { Entity } from "@/types/entity";
import { COUNTRY_FLAGS } from "@/types/entity";
import { SERVICE_CATALOG, ServiceType } from "@/types/services";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Settings, Trash2, Users } from "lucide-react";
import { getProfileCountsByEntity } from '@/data/mock-user-profiles';

interface EntityCardProps {
  entity: Entity;
  onEdit?: (entity: Entity) => void;
  onDelete?: (entity: Entity) => void;
  onViewDetails?: (entity: Entity) => void;
}

export function EntityCard({ entity, onEdit, onDelete, onViewDetails }: EntityCardProps) {
  const enabledServices = entity.enabledServices as ServiceType[];
  const disabledServices = (Object.keys(SERVICE_CATALOG) as ServiceType[]).filter(
    (service) => !enabledServices.includes(service)
  );
  const profileCounts = getProfileCountsByEntity(entity.id);

  return (
    <Card 
      className="hover-scale transition-all duration-300 h-full cursor-pointer" 
      onClick={() => onViewDetails?.(entity)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">
              {COUNTRY_FLAGS[entity.countryCode] || "🌍"}
            </div>
            <div>
              <CardTitle className="text-lg">{entity.name}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {entity.city}, {entity.country}
              </CardDescription>
            </div>
          </div>
          <Badge variant={entity.isActive ? "default" : "secondary"}>
            {entity.type}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Statistiques utilisateurs */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{profileCounts.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{profileCounts.gabonese}</div>
            <div className="text-xs text-muted-foreground">Gabonais</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{profileCounts.visaRequests}</div>
            <div className="text-xs text-muted-foreground">Visas</div>
          </div>
        </div>

        {/* Services activés */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-green-600">
            ✓ Services activés ({enabledServices.length})
          </h4>
          <div className="flex flex-wrap gap-1">
            {enabledServices.slice(0, 4).map((serviceId) => {
              const service = SERVICE_CATALOG[serviceId];
              return (
                <Badge key={serviceId} variant="outline" className="text-xs">
                  {service.name}
                </Badge>
              );
            })}
            {enabledServices.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{enabledServices.length - 4}
              </Badge>
            )}
          </div>
        </div>

        {/* Services désactivés */}
        {disabledServices.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 text-red-600">
              ✗ Services désactivés ({disabledServices.length})
            </h4>
            <div className="flex flex-wrap gap-1">
              {disabledServices.slice(0, 3).map((serviceId) => {
                const service = SERVICE_CATALOG[serviceId];
                return (
                  <Badge
                    key={serviceId}
                    variant="outline"
                    className="text-xs opacity-50 line-through"
                  >
                    {service.name}
                  </Badge>
                );
              })}
              {disabledServices.length > 3 && (
                <Badge variant="outline" className="text-xs opacity-50">
                  +{disabledServices.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          {onViewDetails && (
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(entity);
              }}
            >
              <Users className="mr-2 h-4 w-4" />
              Voir comptes
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(entity);
              }}
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(entity);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
