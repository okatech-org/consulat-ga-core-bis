import { useNavigate } from "react-router-dom";
import { useDemo } from "@/contexts/DemoContext";
import { DemoUser } from "@/types/roles";
import { ConsularRole } from "@/types/consular-roles";
import { getEntityById } from "@/data/mock-entities";
import { SERVICE_CATALOG, ServiceType } from "@/types/services";
import { COUNTRY_FLAGS } from "@/types/entity";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Briefcase, Award } from "lucide-react";

interface DemoUserCardProps {
  user: DemoUser;
  compact?: boolean;
}

export function DemoUserCard({ user, compact }: DemoUserCardProps) {
  const navigate = useNavigate();
  const { simulateUser } = useDemo();
  const entity = user.entityId ? getEntityById(user.entityId) : null;

  const handleSimulate = () => {
    simulateUser(user.id);

    switch (user.role) {
      case 'ADMIN':
        navigate("/dashboard/super-admin");
        break;
      case ConsularRole.CITIZEN:
        navigate("/dashboard/citizen");
        break;
      case ConsularRole.FOREIGNER:
        navigate("/dashboard/foreigner");
        break;
      default:
        // For all consular roles (Agent, Consul, etc.)
        navigate("/dashboard/agent");
        break;
    }
  };

  const getRoleColor = () => {
    switch (user.role) {
      case 'ADMIN': return 'bg-red-600';
      case ConsularRole.CONSUL_GENERAL: return 'bg-yellow-600'; // Gold
      case ConsularRole.AMBASSADEUR: return 'bg-yellow-600'; // Gold
      case ConsularRole.PREMIER_CONSEILLER: return 'bg-slate-500';
      case ConsularRole.CONSUL: return 'bg-slate-500'; // Silver
      case ConsularRole.VICE_CONSUL: return 'bg-orange-600'; // Bronze
      case ConsularRole.CHARGE_AFFAIRES_CONSULAIRES: return 'bg-blue-600';
      case ConsularRole.AGENT_CONSULAIRE: return 'bg-green-600';
      case ConsularRole.STAGIAIRE: return 'bg-purple-500';
      case ConsularRole.CITIZEN: return 'bg-gray-400';
      case ConsularRole.FOREIGNER: return 'bg-teal-500';
      default: return 'bg-gray-500';
    }
  };

  const allServices = Object.keys(SERVICE_CATALOG) as ServiceType[];
  const enabledServices = entity?.enabledServices || allServices;

  if (compact) {
    return (
      <Card
        className="hover-scale transition-all duration-300 border-l-4 overflow-hidden"
        style={{ borderLeftColor: getRoleColor().replace('bg-', '') }}
      >
        <div className="p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs text-white shadow-sm flex-shrink-0 ${getRoleColor()}`}>
              {user.badge}
            </div>
            <div className="min-w-0">
              <div className="font-medium text-sm truncate">{user.name}</div>
              <div className="text-[10px] text-muted-foreground truncate uppercase tracking-widest">
                {user.role === 'CITIZEN' ? 'CITOYEN' : user.role.replace(/_/g, ' ')}
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 hover:bg-primary/5 hover:text-primary"
            onClick={handleSimulate}
          >
            <Check className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="hover-scale transition-all duration-300 border-l-4 h-full flex flex-col" style={{ borderLeftColor: getRoleColor().replace('bg-', '') }}>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-2">
            <Badge className={getRoleColor()}>
              <span className="mr-1">{user.badge}</span>
              {user.role === 'CITIZEN' ? 'CITOYEN' : user.role.replace(/_/g, ' ')}
            </Badge>
            {user.hierarchyLevel && (
              <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                Niveau {user.hierarchyLevel}
              </Badge>
            )}
          </div>
          {entity && (
            <span className="text-2xl">
              {COUNTRY_FLAGS[entity.countryCode] || '🌍'}
            </span>
          )}
        </div>
        <CardTitle className="text-xl">{user.name}</CardTitle>
        <CardDescription>{user.description}</CardDescription>

        {user.employmentStatus && (
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Briefcase className="h-3 w-3" />
            <span className="font-medium">{user.employmentStatus}</span>
          </div>
        )}

        {entity && (
          <p className="text-xs text-muted-foreground mt-1">
            📍 {entity.city}, {entity.country}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4 flex-1">
        <div>
          <h4 className="font-semibold text-sm mb-2">Permissions :</h4>
          <ul className="space-y-1">
            {user.permissions.slice(0, 3).map((permission, index) => (
              <li key={index} className="text-sm flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{permission}</span>
              </li>
            ))}
          </ul>
        </div>

        {entity && user.role !== 'CITIZEN' && (
          <div>
            <h4 className="font-semibold text-sm mb-2">Services disponibles :</h4>
            <div className="grid grid-cols-2 gap-2">
              {allServices.map((serviceType) => {
                const isEnabled = enabledServices.includes(serviceType);
                const service = SERVICE_CATALOG[serviceType];
                return (
                  <div
                    key={serviceType}
                    className={`flex items-center gap-1 text-xs p-1.5 rounded ${isEnabled ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500 line-through'
                      }`}
                  >
                    {isEnabled ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                    <span>{service.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="mt-auto">
        <Button
          onClick={handleSimulate}
          className="w-full"
          variant="default"
        >
          Simuler cet utilisateur
        </Button>
      </CardFooter>
    </Card>
  );
}
