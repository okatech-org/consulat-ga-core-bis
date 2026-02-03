import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Entity, COUNTRY_FLAGS } from "@/types/entity";
import { getUserProfilesByEntity } from "@/data/mock-user-profiles";
import { PROFILE_TYPE_LABELS, PROFILE_TYPE_COLORS, UserProfile } from "@/types/user-profiles";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, FileText, User, Mail, Phone, Calendar } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EntityDetailModalProps {
  entity: Entity | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EntityDetailModal({ entity, isOpen, onClose }: EntityDetailModalProps) {
  if (!entity) return null;

  const profiles = getUserProfilesByEntity(entity.id);
  
  const gaboneseProfiles = profiles.filter(p => 
    ['RESIDENT_PERMANENT', 'ETUDIANT', 'TRAVAILLEUR', 'MINEUR', 'VISITEUR_GABONAIS', 'VISITEUR_ETRANGER'].includes(p.profileType)
  );
  
  const visaProfiles = profiles.filter(p => p.profileType.startsWith('VISA_'));

  const renderProfileCard = (profile: UserProfile) => (
    <Card key={profile.id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {profile.firstName} {profile.lastName}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{profile.nationality}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={PROFILE_TYPE_COLORS[profile.profileType]}>
              {PROFILE_TYPE_LABELS[profile.profileType]}
            </Badge>
            <Badge variant={profile.status === 'ACTIVE' ? 'default' : 'secondary'}>
              {profile.status}
            </Badge>
            {profile.visaStatus && (
              <Badge variant="outline" className="text-xs">
                {profile.visaStatus}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{profile.email}</span>
        </div>
        {profile.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{profile.phone}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Inscrit le {new Date(profile.createdAt).toLocaleDateString('fr-FR')}
          </span>
        </div>
        {profile.parentId && (
          <Badge variant="outline" className="text-xs">
            Compte rattaché au parent
          </Badge>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <span className="text-3xl">{COUNTRY_FLAGS[entity.countryCode]}</span>
            <div>
              <div>{entity.name}</div>
              <div className="text-sm font-normal text-muted-foreground">
                {entity.city}, {entity.country}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <Users className="h-8 w-8 text-primary mb-2" />
                <div className="text-3xl font-bold">{profiles.length}</div>
                <div className="text-sm text-muted-foreground">Total comptes</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <User className="h-8 w-8 text-blue-500 mb-2" />
                <div className="text-3xl font-bold">{gaboneseProfiles.length}</div>
                <div className="text-sm text-muted-foreground">Ressortissants</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <FileText className="h-8 w-8 text-green-500 mb-2" />
                <div className="text-3xl font-bold">{visaProfiles.length}</div>
                <div className="text-sm text-muted-foreground">Demandes visa</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="gabonese" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gabonese">
              Ressortissants Gabonais ({gaboneseProfiles.length})
            </TabsTrigger>
            <TabsTrigger value="visa">
              Demandes de Visa ({visaProfiles.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="gabonese">
            <ScrollArea className="h-[400px] pr-4">
              {gaboneseProfiles.length > 0 ? (
                gaboneseProfiles.map(renderProfileCard)
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Aucun ressortissant gabonais enregistré
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="visa">
            <ScrollArea className="h-[400px] pr-4">
              {visaProfiles.length > 0 ? (
                visaProfiles.map(renderProfileCard)
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Aucune demande de visa en cours
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
