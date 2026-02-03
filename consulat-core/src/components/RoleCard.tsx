import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RoleCardProps {
  role: string;
  title: string;
  description: string;
  permissions: string[];
  icon: LucideIcon;
  colorClass: string;
  badgeColor: string;
}

export const RoleCard = ({
  role,
  title,
  description,
  permissions,
  icon: Icon,
  colorClass,
  badgeColor,
}: RoleCardProps) => {
  const navigate = useNavigate();

  const handleSimulate = () => {
    // Store the simulated role in localStorage
    localStorage.setItem("demo_role", role);
    // Navigate to a dashboard (we'll create this later)
    navigate("/");
  };

  return (
    <Card className={`group hover:shadow-elevation transition-all duration-300 hover:-translate-y-1 ${colorClass}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${badgeColor} bg-opacity-10`}>
              <Icon className={`h-6 w-6 ${badgeColor.replace('bg-', 'text-')}`} />
            </div>
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <Badge variant="outline" className="mt-1">
                {role}
              </Badge>
            </div>
          </div>
        </div>
        <CardDescription className="mt-4">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">Droits d'accès :</h4>
            <ul className="space-y-1">
              {permissions.map((permission, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  {permission}
                </li>
              ))}
            </ul>
          </div>
          <Button
            onClick={handleSimulate}
            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            variant="outline"
          >
            Simuler cet utilisateur
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
