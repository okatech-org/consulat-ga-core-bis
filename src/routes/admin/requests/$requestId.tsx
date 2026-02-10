"use client";

import { api } from "@convex/_generated/api";
import { RequestStatus } from "@convex/lib/constants";
import { getLocalized } from "@convex/lib/utils";
import type { LocalizedString } from "@convex/lib/validators";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  Send,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { RequestActionModal } from "@/components/admin/RequestActionModal";
import { GenerateDocumentDialog } from "@/components/dashboard/GenerateDocumentDialog";
import { UserProfilePreviewCard } from "@/components/dashboard/UserProfilePreviewCard";
import { DocumentChecklist } from "@/components/shared/DocumentChecklist";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MultiSelect } from "@/components/ui/multi-select";
import { Textarea } from "@/components/ui/textarea";
import {
  useAuthenticatedConvexQuery,
  useConvexMutationQuery,
} from "@/integrations/convex/hooks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/requests/$requestId")({
  component: RequestDetailPage,
});

// ─── Status styling (reuses palette from list page) ──────────────────
const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string }> =
  {
    draft: {
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-700 dark:text-slate-300",
      dot: "bg-slate-400",
    },
    submitted: {
      bg: "bg-blue-100 dark:bg-blue-900/40",
      text: "text-blue-700 dark:text-blue-300",
      dot: "bg-blue-500",
    },
    pending: {
      bg: "bg-amber-100 dark:bg-amber-900/40",
      text: "text-amber-700 dark:text-amber-300",
      dot: "bg-amber-500",
    },
    pending_completion: {
      bg: "bg-orange-100 dark:bg-orange-900/40",
      text: "text-orange-700 dark:text-orange-300",
      dot: "bg-orange-500",
    },
    edited: {
      bg: "bg-indigo-100 dark:bg-indigo-900/40",
      text: "text-indigo-700 dark:text-indigo-300",
      dot: "bg-indigo-500",
    },
    under_review: {
      bg: "bg-purple-100 dark:bg-purple-900/40",
      text: "text-purple-700 dark:text-purple-300",
      dot: "bg-purple-500",
    },
    in_production: {
      bg: "bg-cyan-100 dark:bg-cyan-900/40",
      text: "text-cyan-700 dark:text-cyan-300",
      dot: "bg-cyan-500",
    },
    validated: {
      bg: "bg-emerald-100 dark:bg-emerald-900/40",
      text: "text-emerald-700 dark:text-emerald-300",
      dot: "bg-emerald-500",
    },
    rejected: {
      bg: "bg-red-100 dark:bg-red-900/40",
      text: "text-red-700 dark:text-red-300",
      dot: "bg-red-500",
    },
    appointment_scheduled: {
      bg: "bg-teal-100 dark:bg-teal-900/40",
      text: "text-teal-700 dark:text-teal-300",
      dot: "bg-teal-500",
    },
    ready_for_pickup: {
      bg: "bg-green-100 dark:bg-green-900/40",
      text: "text-green-700 dark:text-green-300",
      dot: "bg-green-500",
    },
    completed: {
      bg: "bg-emerald-100 dark:bg-emerald-900/40",
      text: "text-emerald-700 dark:text-emerald-300",
      dot: "bg-emerald-500",
    },
    cancelled: {
      bg: "bg-gray-100 dark:bg-gray-800",
      text: "text-gray-600 dark:text-gray-400",
      dot: "bg-gray-400",
    },
    processing: {
      bg: "bg-purple-100 dark:bg-purple-900/40",
      text: "text-purple-700 dark:text-purple-300",
      dot: "bg-purple-500",
    },
  };

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  submitted: "Soumis",
  pending: "En attente",
  pending_completion: "Incomplet",
  edited: "Modifié",
  under_review: "En examen",
  in_production: "En production",
  validated: "Validé",
  rejected: "Rejeté",
  appointment_scheduled: "RDV fixé",
  ready_for_pickup: "Prêt",
  completed: "Terminé",
  cancelled: "Annulé",
  processing: "Traitement",
};

function getStatusStyle(status: string) {
  return (
    STATUS_STYLE[status] ?? {
      bg: "bg-gray-100 dark:bg-gray-800",
      text: "text-gray-600 dark:text-gray-400",
      dot: "bg-gray-400",
    }
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────

// Fields to hide from the form data display
const HIDDEN_FIELDS = new Set([
  "profileId",
  "type",
  "userId",
  "_id",
  "orgId",
  "orgServiceId",
]);

function renderValue(value: unknown): string | null {
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  if (Array.isArray(value)) {
    if (
      value.every((v) => typeof v === "string" && /^[a-z0-9]{20,}$/i.test(v))
    ) {
      return null;
    }
    return value.join(", ");
  }
  if (typeof value === "object") {
    if ("fr" in (value as object)) {
      return String((value as { fr: string }).fr);
    }
    return JSON.stringify(value);
  }
  return String(value);
}

// Types for FormSchema
interface FormSchemaField {
  id: string;
  type?: string;
  label?: LocalizedString;
  description?: LocalizedString;
}

interface FormSchemaSection {
  id: string;
  title?: LocalizedString;
  description?: LocalizedString;
  fields?: FormSchemaField[];
}

interface FormSchema {
  sections?: FormSchemaSection[];
  joinedDocuments?: Array<{
    type: string;
    label: LocalizedString;
    required: boolean;
  }>;
  showRecap?: boolean;
}

// ─── Main Component ──────────────────────────────────────────────────

function RequestDetailPage() {
  const { i18n, t } = useTranslation();
  const { requestId } = Route.useParams();
  const navigate = useNavigate();

  const { data: request } = useAuthenticatedConvexQuery(
    api.functions.requests.getById,
    { requestId: requestId as any },
  );
  const { data: agentNotes } = useAuthenticatedConvexQuery(
    api.functions.agentNotes.listByRequest,
    request?._id ? { requestId: request._id } : "skip",
  );
  const { mutateAsync: updateStatus } = useConvexMutationQuery(
    api.functions.requests.updateStatus,
  );
  const { mutateAsync: createNote } = useConvexMutationQuery(
    api.functions.agentNotes.create,
  );
  const { mutateAsync: validateDocument } = useConvexMutationQuery(
    api.functions.documents.validate,
  );

  const [noteContent, setNoteContent] = useState("");

  // Build label lookups from formSchema
  function buildSchemaLookups(schema: FormSchema | undefined) {
    const sectionLabels: Record<string, string> = {};
    const fieldLabels: Record<string, string> = {};
    if (!schema?.sections) return { sectionLabels, fieldLabels };

    for (const section of schema.sections) {
      sectionLabels[section.id] =
        getLocalized(section.title, i18n.language) || section.id;
      if (section.fields) {
        for (const field of section.fields) {
          fieldLabels[`${section.id}.${field.id}`] =
            getLocalized(field.label, i18n.language) || field.id;
          fieldLabels[field.id] =
            getLocalized(field.label, i18n.language) || field.id;
        }
      }
    }
    return { sectionLabels, fieldLabels };
  }

  const { sectionLabels, fieldLabels } = useMemo(() => {
    const schema = request?.orgService?.formSchema as FormSchema | undefined;
    return buildSchemaLookups(schema);
  }, [request?.orgService?.formSchema]);

  // ─── Loading / Not found ────────────────────────────────────────
  if (request === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (request === null) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <FileText className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-muted-foreground">Demande introuvable</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate({ to: "/admin/requests" })}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour aux demandes
        </Button>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateStatus({ requestId: request._id, status: newStatus as any });
      toast.success("Statut mis à jour");
    } catch (e) {
      toast.error("Erreur");
    }
  };

  const serviceName =
    getLocalized(request.service?.name, "fr") || "Service inconnu";

  // Parse formData
  let formDataObj: Record<string, unknown> = {};
  if (request.formData) {
    if (typeof request.formData === "string") {
      try {
        formDataObj = JSON.parse(request.formData);
      } catch {
        formDataObj = { données: request.formData };
      }
    } else if (typeof request.formData === "object") {
      formDataObj = request.formData as Record<string, unknown>;
    }
  }

  const getSectionLabel = (sectionId: string): string =>
    sectionLabels[sectionId] || sectionId.replace(/^section_\d+_/i, "");

  const getFieldLabel = (sectionId: string, fieldId: string): string =>
    fieldLabels[`${sectionId}.${fieldId}`] ||
    fieldLabels[fieldId] ||
    fieldId.replace(/^field_\d+_/i, "");

  const statusStyle = getStatusStyle(request.status);
  const statusHistory = (request as any).statusHistory ?? [];

  return (
    <div className="flex flex-col min-h-0 h-full">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="shrink-0 flex items-center gap-4 border-b border-border/60 bg-card/80 backdrop-blur-sm px-6 py-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => navigate({ to: "/admin/requests" })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold tracking-tight truncate">
              {serviceName}
            </h1>
            <Badge variant="outline" className="font-mono text-xs shrink-0">
              {request.reference}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              Soumis le{" "}
              {format(
                request.submittedAt || request._creationTime || Date.now(),
                "dd MMMM yyyy 'à' HH:mm",
                { locale: fr },
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Status badge */}
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
              statusStyle.bg,
              statusStyle.text,
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", statusStyle.dot)} />
            {STATUS_LABELS[request.status] || request.status}
          </span>

          <div className="h-6 w-px bg-border/60 mx-1" />

          <GenerateDocumentDialog request={request as any} />
          <RequestActionModal requestId={request._id} />
          <MultiSelect<RequestStatus>
            type="single"
            selected={request.status as RequestStatus}
            onChange={(value) => handleStatusChange(value)}
            options={Object.values(RequestStatus).map((status) => ({
              value: status,
              label: t(`fields.requestStatus.options.${status}`),
            }))}
          />
        </div>
      </header>

      {/* ── Action Banners ─────────────────────────────────────── */}
      {request.actionRequired && !request.actionRequired.completedAt && (
        <div className="px-6 pt-4">
          <Alert
            variant="destructive"
            className="border-amber-500 bg-amber-50 dark:bg-amber-950/20"
          >
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800 dark:text-amber-400">
              Action requise du citoyen
              <Badge variant="outline" className="ml-1 text-xs">
                {request.actionRequired.type === "upload_document" &&
                  "Documents"}
                {request.actionRequired.type === "complete_info" &&
                  "Informations"}
                {request.actionRequired.type === "schedule_appointment" &&
                  "Rendez-vous"}
                {request.actionRequired.type === "make_payment" && "Paiement"}
                {request.actionRequired.type === "confirm_info" &&
                  "Confirmation"}
              </Badge>
            </AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              {request.actionRequired.message}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {request.actionRequired?.completedAt && (
        <div className="px-6 pt-4">
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800 dark:text-green-400">
              Réponse reçue du citoyen
              <Badge variant="outline" className="ml-1 text-xs text-green-600">
                À traiter
              </Badge>
            </AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-300">
              Le citoyen a fourni les éléments demandés. Vérifiez et validez sa
              réponse.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* ── Main Content ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* ── LEFT: Form Data + Documents ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Form Data */}
            <div className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border/40 bg-muted/20">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-primary/10 p-1.5">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm">
                      Données du formulaire
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Informations soumises par le demandeur
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5">
                {Object.keys(formDataObj).length > 0 ?
                  <div className="space-y-5">
                    {Object.entries(formDataObj).map(
                      ([sectionId, sectionData]) => {
                        // Skip hidden system fields
                        if (HIDDEN_FIELDS.has(sectionId)) return null;

                        // Handle nested section
                        if (
                          typeof sectionData === "object" &&
                          sectionData !== null &&
                          !Array.isArray(sectionData) &&
                          !("fr" in sectionData)
                        ) {
                          const entries = Object.entries(
                            sectionData as Record<string, unknown>,
                          ).filter(
                            ([key, value]) =>
                              !HIDDEN_FIELDS.has(key) &&
                              renderValue(value) !== null,
                          );

                          if (entries.length === 0) return null;

                          return (
                            <div
                              key={sectionId}
                              className="rounded-lg border border-border/40 overflow-hidden"
                            >
                              <div className="bg-muted/30 px-4 py-2.5 border-b border-border/40">
                                <h3 className="font-medium text-sm text-foreground/80">
                                  {getSectionLabel(sectionId)}
                                </h3>
                              </div>
                              <div className="p-4">
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                                  {entries.map(([fieldId, value]) => (
                                    <div key={fieldId} className="space-y-0.5">
                                      <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        {getFieldLabel(sectionId, fieldId)}
                                      </dt>
                                      <dd className="text-sm font-medium">
                                        {renderValue(value)}
                                      </dd>
                                    </div>
                                  ))}
                                </dl>
                              </div>
                            </div>
                          );
                        }

                        // Flat field
                        const rendered = renderValue(sectionData);
                        if (rendered === null) return null;

                        return (
                          <div
                            key={sectionId}
                            className="flex justify-between items-center py-2.5 border-b border-border/20 last:border-0"
                          >
                            <span className="text-sm text-muted-foreground">
                              {getSectionLabel(sectionId)}
                            </span>
                            <span className="text-sm font-medium">
                              {rendered}
                            </span>
                          </div>
                        );
                      },
                    )}
                  </div>
                : <div className="text-muted-foreground italic text-center py-8 text-sm">
                    Aucune donnée de formulaire
                  </div>
                }
              </div>
            </div>

            {/* Documents Checklist */}
            <DocumentChecklist
              requiredDocuments={(request.joinedDocuments || []) as any}
              submittedDocuments={(request.documents || []).map((doc: any) => ({
                ...doc,
                url: doc.url || undefined,
              }))}
              isAgent={true}
              onValidate={async (docId) => {
                try {
                  await validateDocument({
                    documentId: docId,
                    status: "validated" as any,
                  });
                  toast.success("Document validé");
                } catch (err) {
                  toast.error("Erreur lors de la validation");
                }
              }}
              onReject={async (docId, reason) => {
                try {
                  await validateDocument({
                    documentId: docId,
                    status: "rejected" as any,
                    rejectionReason: reason,
                  });
                  toast.success("Document rejeté");
                } catch (err) {
                  toast.error("Erreur lors du rejet");
                }
              }}
            />
          </div>

          {/* ── RIGHT: Profile, Timeline, Notes ── */}
          <div className="space-y-6">
            {/* User Profile */}
            {request.userId && (
              <UserProfilePreviewCard userId={request.userId} />
            )}

            {/* Status Timeline */}
            {statusHistory.length > 0 && (
              <div className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-border/40 bg-muted/20">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Historique
                    <Badge
                      variant="secondary"
                      className="text-xs font-normal ml-auto"
                    >
                      {statusHistory.length}
                    </Badge>
                  </h3>
                </div>
                <div className="p-4">
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border/60" />

                    <div className="space-y-4">
                      {statusHistory.map((event: any, idx: number) => {
                        const toStyle = getStatusStyle(event.to);
                        const isLast = idx === statusHistory.length - 1;

                        return (
                          <div
                            key={event._id}
                            className="relative flex gap-3 pl-0"
                          >
                            {/* Dot */}
                            <div
                              className={cn(
                                "relative z-10 mt-1 h-[15px] w-[15px] rounded-full border-2 border-background shrink-0",
                                isLast ? toStyle.dot : "bg-muted-foreground/30",
                              )}
                            />

                            {/* Content */}
                            <div className="flex-1 min-w-0 pb-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={cn(
                                    "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold",
                                    toStyle.bg,
                                    toStyle.text,
                                  )}
                                >
                                  {STATUS_LABELS[event.to] || event.to}
                                </span>
                                {event.from && (
                                  <span className="text-[10px] text-muted-foreground">
                                    ← {STATUS_LABELS[event.from] || event.from}
                                  </span>
                                )}
                              </div>
                              {event.note && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                  {event.note}
                                </p>
                              )}
                              <span className="text-[10px] text-muted-foreground/70">
                                {formatDistanceToNow(event.createdAt, {
                                  addSuffix: true,
                                  locale: fr,
                                })}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Internal Notes */}
            <Card className="flex flex-col max-h-[400px]">
              <CardHeader className="shrink-0 pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  Notes internes
                  <Badge
                    variant="secondary"
                    className="text-xs font-normal ml-auto"
                  >
                    {agentNotes?.length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto space-y-3">
                {!agentNotes || agentNotes.length === 0 ?
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucune note
                  </p>
                : agentNotes.map((note) => (
                    <div
                      key={note._id}
                      className={cn(
                        "p-3 rounded-lg text-sm",
                        note.source === "ai" ?
                          "bg-primary/5 border border-primary/15"
                        : "bg-muted/40",
                      )}
                    >
                      {note.source === "ai" && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <Bot className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-medium text-primary">
                            Analyse IA
                          </span>
                          {note.aiConfidence && (
                            <Badge
                              variant="outline"
                              className="text-xs ml-auto"
                            >
                              {note.aiConfidence}% confiance
                            </Badge>
                          )}
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{note.content}</p>
                      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        <span>
                          {note.source === "ai" ?
                            "IA"
                          : note.author ?
                            `${note.author.firstName} ${note.author.lastName}`
                          : "Agent"}
                        </span>
                        <span>
                          {formatDistanceToNow(note.createdAt, {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                }
              </CardContent>
              <CardFooter className="shrink-0 pt-3">
                <div className="flex w-full gap-2">
                  <Textarea
                    placeholder="Ajouter une note..."
                    className="min-h-[40px] text-sm"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                  />
                  <Button
                    size="icon"
                    onClick={async () => {
                      if (!noteContent.trim()) return;
                      try {
                        await createNote({
                          requestId: request._id,
                          content: noteContent,
                        });
                        setNoteContent("");
                        toast.success("Note ajoutée");
                      } catch {
                        toast.error("Erreur lors de l'ajout");
                      }
                    }}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
