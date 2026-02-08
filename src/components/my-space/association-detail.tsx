import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { AssociationRole, AssociationType } from "@convex/lib/constants";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Building2,
  Check,
  Crown,
  Edit2,
  Globe,
  Loader2,
  LogOut,
  Mail,
  Phone,
  Save,
  Shield,
  Trash2,
  UserMinus,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useConvexMutationQuery,
  useConvexQuery,
} from "@/integrations/convex/hooks";

const roleIcons: Partial<Record<AssociationRole, typeof Crown>> = {
  [AssociationRole.President]: Crown,
  [AssociationRole.VicePresident]: Shield,
};

export function AssociationDetailContent({ id }: { id: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: association, isPending } = useConvexQuery(
    api.functions.associations.getById,
    { id: id as Id<"associations"> },
  );

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!association) {
    return (
      <div className="space-y-4 p-1">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: "/my-space/associations" })}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("common.back", "Retour")}
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">
              {t("associations.notFound", "Association introuvable")}
            </h3>
          </CardContent>
        </Card>
      </div>
    );
  }

  const myMembership = association.members?.find((m: any) => m.user?._id);
  const isAdmin =
    myMembership?.role === AssociationRole.President ||
    myMembership?.role === AssociationRole.VicePresident;

  const typeLabels: Record<AssociationType, string> = {
    [AssociationType.Cultural]: t("associations.type.cultural", "Culturelle"),
    [AssociationType.Sports]: t("associations.type.sports", "Sportive"),
    [AssociationType.Religious]: t("associations.type.religious", "Religieuse"),
    [AssociationType.Professional]: t(
      "associations.type.professional",
      "Professionnelle",
    ),
    [AssociationType.Solidarity]: t(
      "associations.type.solidarity",
      "Solidarité",
    ),
    [AssociationType.Education]: t("associations.type.education", "Éducation"),
    [AssociationType.Youth]: t("associations.type.youth", "Jeunesse"),
    [AssociationType.Women]: t("associations.type.women", "Femmes"),
    [AssociationType.Student]: t("associations.type.student", "Étudiante"),
    [AssociationType.Other]: t("associations.type.other", "Autre"),
  };

  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: "/my-space/associations" })}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center">
            {association.logoUrl ?
              <img
                src={association.logoUrl}
                alt={association.name}
                className="h-12 w-12 rounded-lg object-cover"
              />
            : <Building2 className="h-7 w-7 text-primary" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{association.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">
                {typeLabels[association.associationType]}
              </Badge>
              {myMembership && (
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/30"
                >
                  {myMembership.role}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info" className="gap-2">
            <Building2 className="h-4 w-4" />
            {t("common.info", "Informations")}
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2">
            <Users className="h-4 w-4" />
            {t("common.members", "Membres")}
            {association.members && (
              <Badge variant="secondary" className="ml-1">
                {association.members.length}
              </Badge>
            )}
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="settings" className="gap-2">
              <Edit2 className="h-4 w-4" />
              {t("common.settings", "Paramètres")}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="info">
          <InfoTab association={association} />
        </TabsContent>
        <TabsContent value="members">
          <MembersTab
            associationId={association._id}
            members={association.members ?? []}
            isAdmin={isAdmin}
          />
        </TabsContent>
        {isAdmin && (
          <TabsContent value="settings">
            <SettingsTab association={association} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function InfoTab({ association }: { association: any }) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t("associations.info.about", "À propos")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {association.description ?
            <p className="text-sm text-muted-foreground">
              {association.description}
            </p>
          : <p className="text-sm text-muted-foreground italic">
              {t("associations.info.noDescription", "Aucune description")}
            </p>
          }
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t("associations.info.contact", "Contact")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {association.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a
                href={`mailto:${association.email}`}
                className="text-primary hover:underline"
              >
                {association.email}
              </a>
            </div>
          )}
          {association.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{association.phone}</span>
            </div>
          )}
          {association.website && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <a
                href={association.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate"
              >
                {association.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}
          {!association.email && !association.phone && !association.website && (
            <p className="text-sm text-muted-foreground italic">
              {t("associations.info.noContact", "Aucun contact renseigné")}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MembersTab({
  associationId,
  members,
  isAdmin,
}: {
  associationId: Id<"associations">;
  members: any[];
  isAdmin: boolean;
}) {
  const { t } = useTranslation();
  const { mutate: removeMember, isPending: isRemoving } =
    useConvexMutationQuery(api.functions.associations.removeMember);
  const { mutate: updateRole, isPending: isUpdating } = useConvexMutationQuery(
    api.functions.associations.updateMemberRole,
  );
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<{
    userId: string;
    role: AssociationRole;
  } | null>(null);

  const roleOptions: ComboboxOption<AssociationRole>[] = useMemo(
    () =>
      Object.values(AssociationRole).map((r) => ({
        value: r,
        label: {
          [AssociationRole.President]: t(
            "associations.role.president",
            "Président",
          ),
          [AssociationRole.VicePresident]: t(
            "associations.role.vicePresident",
            "Vice-Président",
          ),
          [AssociationRole.Secretary]: t(
            "associations.role.secretary",
            "Secrétaire",
          ),
          [AssociationRole.Treasurer]: t(
            "associations.role.treasurer",
            "Trésorier",
          ),
          [AssociationRole.Member]: t("associations.role.member", "Membre"),
        }[r],
      })),
    [t],
  );

  const roleLabelMap = useMemo(
    () =>
      Object.fromEntries(roleOptions.map((o) => [o.value, o.label])) as Record<
        AssociationRole,
        string
      >,
    [roleOptions],
  );

  const handleRemove = (userId: string) => {
    removeMember(
      { associationId, userId: userId as Id<"users"> },
      {
        onSuccess: () => {
          toast.success(t("associations.memberRemoved", "Membre retiré"));
          setConfirmRemove(null);
        },
        onError: () =>
          toast.error(t("common.error", "Une erreur est survenue")),
      },
    );
  };

  const handleUpdateRole = (userId: string, role: AssociationRole) => {
    updateRole(
      { associationId, userId: userId as Id<"users">, role },
      {
        onSuccess: () => {
          toast.success(t("associations.roleUpdated", "Rôle mis à jour"));
          setEditRole(null);
        },
        onError: () =>
          toast.error(t("common.error", "Une erreur est survenue")),
      },
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">
            {t("common.members", "Membres")}
          </CardTitle>
          <CardDescription>
            {t("associations.membersCount", "{{count}} membre(s)", {
              count: members.length,
            })}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.map((member: any) => {
            const displayName =
              member.profile?.firstName && member.profile?.lastName ?
                `${member.profile.firstName} ${member.profile.lastName}`
              : (member.user?.name ?? "Utilisateur");
            const initials = displayName
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
            const RoleIcon = roleIcons[member.role as AssociationRole];

            return (
              <div
                key={member._id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.user?.avatarUrl} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{displayName}</span>
                      {RoleIcon && (
                        <RoleIcon className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {roleLabelMap[member.role as AssociationRole] ??
                          member.role}
                      </Badge>
                      {member.user?.email && (
                        <span className="text-xs text-muted-foreground">
                          {member.user.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    {editRole?.userId === member.user?._id ?
                      <div className="flex items-center gap-1">
                        <Combobox<AssociationRole>
                          options={roleOptions}
                          value={editRole!.role}
                          onValueChange={(v) =>
                            setEditRole({
                              userId: editRole!.userId,
                              role: v,
                            })
                          }
                          placeholder={t("associations.role.select", "Rôle...")}
                          searchPlaceholder={t(
                            "common.search",
                            "Rechercher...",
                          )}
                          emptyText={t("common.noResults", "Aucun résultat.")}
                          className="h-8 w-36 text-xs"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() =>
                            handleUpdateRole(editRole!.userId, editRole!.role)
                          }
                          disabled={isUpdating}
                        >
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => setEditRole(null)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    : <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() =>
                          setEditRole({
                            userId: member.user?._id ?? "",
                            role: member.role,
                          })
                        }
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    }
                    {confirmRemove === member.user?._id ?
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 text-xs"
                          onClick={() => handleRemove(member.user?._id)}
                          disabled={isRemoving}
                        >
                          {isRemoving ?
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : t("common.confirm", "Confirmer")}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => setConfirmRemove(null)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    : <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setConfirmRemove(member.user?._id)}
                      >
                        <UserMinus className="h-3.5 w-3.5" />
                      </Button>
                    }
                  </div>
                )}
              </div>
            );
          })}
          {members.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t("associations.noMembers", "Aucun membre")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SettingsTab({ association }: { association: any }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutate: update, isPending: isUpdating } = useConvexMutationQuery(
    api.functions.associations.update,
  );
  const { mutate: deleteAssociation, isPending: isDeleting } =
    useConvexMutationQuery(api.functions.associations.deleteAssociation);
  const { mutate: leave, isPending: isLeaving } = useConvexMutationQuery(
    api.functions.associations.leave,
  );
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: association.name ?? "",
    description: association.description ?? "",
    email: association.email ?? "",
    phone: association.phone ?? "",
    website: association.website ?? "",
  });

  const handleSave = () => {
    update(
      {
        id: association._id,
        name: formData.name || undefined,
        description: formData.description || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        website: formData.website || undefined,
      },
      {
        onSuccess: () => {
          toast.success(t("associations.updated", "Association mise à jour"));
          setEditing(false);
        },
        onError: () =>
          toast.error(t("common.error", "Une erreur est survenue")),
      },
    );
  };

  const handleDelete = () => {
    deleteAssociation(
      { id: association._id },
      {
        onSuccess: () => {
          toast.success(t("associations.deleted", "Association supprimée"));
          navigate({ to: "/my-space/associations" });
        },
        onError: () =>
          toast.error(t("common.error", "Une erreur est survenue")),
      },
    );
  };

  const handleLeave = () => {
    leave(
      { associationId: association._id },
      {
        onSuccess: () => {
          toast.success(
            t("associations.left", "Vous avez quitté l'association"),
          );
          navigate({ to: "/my-space/associations" });
        },
        onError: () =>
          toast.error(t("common.error", "Une erreur est survenue")),
      },
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            {t("associations.settings.edit", "Modifier l'association")}
          </CardTitle>
          {!editing ?
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              {t("common.edit", "Modifier")}
            </Button>
          : <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(false)}
              >
                {t("common.cancel", "Annuler")}
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isUpdating}>
                {isUpdating ?
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                : <Save className="h-4 w-4 mr-2" />}
                {t("common.save", "Enregistrer")}
              </Button>
            </div>
          }
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("associations.form.name", "Nom")}</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={!editing}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("associations.form.email", "Email")}</Label>
              <Input
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={!editing}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("associations.form.phone", "Téléphone")}</Label>
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                disabled={!editing}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("associations.form.website", "Site web")}</Label>
              <Input
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                disabled={!editing}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("associations.form.description", "Description")}</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={!editing}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-base text-destructive">
            {t("common.dangerZone", "Zone dangereuse")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                {t("associations.leave.title", "Quitter l'association")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t(
                  "associations.leave.settingsDesc",
                  "Vous ne serez plus membre de cette association",
                )}
              </p>
            </div>
            <Dialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <LogOut className="h-4 w-4" />
                  {t("associations.leave.confirm", "Quitter")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {t(
                      "associations.leave.confirmTitle",
                      "Quitter cette association ?",
                    )}
                  </DialogTitle>
                </DialogHeader>
                <p className="text-muted-foreground text-sm">
                  {t(
                    "associations.leave.description",
                    "Vous ne serez plus membre de {{name}}.",
                    { name: association.name },
                  )}
                </p>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowLeaveConfirm(false)}
                  >
                    {t("common.cancel", "Annuler")}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleLeave}
                    disabled={isLeaving}
                  >
                    {isLeaving && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {t("associations.leave.confirm", "Quitter")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-destructive">
                {t("associations.delete.title", "Supprimer l'association")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t(
                  "associations.delete.description",
                  "Cette action est irréversible",
                )}
              </p>
            </div>
            <Dialog
              open={showDeleteConfirm}
              onOpenChange={setShowDeleteConfirm}
            >
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  {t("common.delete", "Supprimer")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {t(
                      "associations.delete.confirmTitle",
                      "Supprimer {{name}} ?",
                      { name: association.name },
                    )}
                  </DialogTitle>
                </DialogHeader>
                <p className="text-muted-foreground text-sm">
                  {t(
                    "associations.delete.confirmDescription",
                    "Tous les membres seront retirés et les données seront supprimées.",
                  )}
                </p>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    {t("common.cancel", "Annuler")}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {t("common.delete", "Supprimer")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
