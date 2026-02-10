import { api } from "@convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  Check,
  Clock,
  Loader2,
  MessageSquare,
  X,
} from "lucide-react";
import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  useAuthenticatedConvexQuery,
  useConvexMutationQuery,
} from "@/integrations/convex/hooks";

export const Route = createFileRoute("/dashboard/association-claims")({
  component: AssociationClaimsPage,
});

function AssociationClaimsPage() {
  const { t } = useTranslation();
  const { data: claims, isPending: isLoading } = useAuthenticatedConvexQuery(
    api.functions.associationClaims.listClaims,
    {},
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {t("admin.claims.title", "Demandes de propriété")}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t(
            "admin.claims.description",
            "Examinez les demandes de propriété des associations",
          )}
        </p>
      </div>

      {isLoading ?
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      : !claims || claims.length === 0 ?
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Check className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">
              {t("admin.claims.empty", "Aucune demande en attente")}
            </p>
          </CardContent>
        </Card>
      : <div className="grid gap-4">
          {claims.map((claim: any) => (
            <ClaimCard key={claim._id} claim={claim} />
          ))}
        </div>
      }
    </div>
  );
}

function ClaimCard({ claim }: { claim: any }) {
  const { t } = useTranslation();
  const [reviewNote, setReviewNote] = useState("");
  const [showReviewNote, setShowReviewNote] = useState(false);

  const { mutate: respond, isPending } = useConvexMutationQuery(
    api.functions.associationClaims.respondToClaim,
  );

  const handleRespond = (approve: boolean) => {
    respond(
      {
        claimId: claim._id,
        approve,
        reviewNote: reviewNote.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success(
            approve ?
              t(
                "admin.claims.approved",
                "Demande approuvée — l'utilisateur est maintenant président",
              )
            : t("admin.claims.rejected", "Demande refusée"),
          );
        },
        onError: (err: Error) => {
          toast.error(err.message);
        },
      },
    );
  };

  const displayName =
    claim.profile?.firstName && claim.profile?.lastName ?
      `${claim.profile.firstName} ${claim.profile.lastName}`
    : (claim.user?.name ?? claim.user?.email ?? "—");

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {claim.user?.avatarUrl && (
                <AvatarImage src={claim.user.avatarUrl} />
              )}
              <AvatarFallback>
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{displayName}</CardTitle>
              {claim.user?.email && (
                <CardDescription>{claim.user.email}</CardDescription>
              )}
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0">
            <Clock className="h-3 w-3 mr-1" />
            {new Date(claim.createdAt).toLocaleDateString("fr-FR")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Association info */}
        <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium">
            {claim.association?.name ?? "Association supprimée"}
          </span>
        </div>

        {/* Claim message */}
        {claim.message && (
          <div className="flex items-start gap-2 p-2 rounded-md border">
            <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">{claim.message}</p>
          </div>
        )}

        {/* Review note */}
        {showReviewNote && (
          <Textarea
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            placeholder={t(
              "admin.claims.reviewNotePlaceholder",
              "Note de revue (optionnelle)...",
            )}
            rows={2}
          />
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReviewNote(!showReviewNote)}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            {t("admin.claims.addNote", "Ajouter une note")}
          </Button>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-destructive"
              onClick={() => handleRespond(false)}
              disabled={isPending}
            >
              {isPending ?
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              : <X className="h-4 w-4 mr-1" />}
              {t("common.reject", "Refuser")}
            </Button>
            <Button
              size="sm"
              onClick={() => handleRespond(true)}
              disabled={isPending}
            >
              {isPending ?
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              : <Check className="h-4 w-4 mr-1" />}
              {t("common.approve", "Approuver")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
