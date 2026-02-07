import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { createFileRoute, Link } from "@tanstack/react-router";
import { DynamicFolderIcon } from "@/components/icons/DynamicFolderIcon";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  File,
  FileText,
  Info,
  Loader2,
  Search,
  Shield,
  Upload,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAuthenticatedConvexQuery,
  useConvexMutationQuery,
} from "@/integrations/convex/hooks";

export const Route = createFileRoute("/my-space/documents")({
  component: DocumentsPage,
});

function DocumentsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 p-1">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <DynamicFolderIcon count={0} size={28} />
          {t("documents.title", "Mes Documents")}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t(
            "documents.description",
            "Gérez vos documents consulaires et pièces justificatives",
          )}
        </p>
      </motion.div>

      <Tabs defaultValue="vault" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vault" className="gap-2">
            <Shield className="h-4 w-4" />
            {t("documents.tabs.vault", "Coffre-fort")}
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-2">
            <FileText className="h-4 w-4" />
            {t("documents.tabs.requests", "Demandes")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vault">
          <DocumentVault />
        </TabsContent>

        <TabsContent value="requests">
          <RequestDocuments />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DocumentVault() {
  const { t } = useTranslation();
  const { data: profile, isPending } = useAuthenticatedConvexQuery(
    api.functions.profiles.getMine,
    {},
  );
  const { mutateAsync: getUrl } = useConvexMutationQuery(
    api.functions.documents.getUrl,
  );

  const handleDownload = async (storageId: string) => {
    try {
      const url = await getUrl({ storageId: storageId as Id<"_storage"> });
      if (url) {
        window.open(url, "_blank");
      } else {
        toast.error(
          t("documents.error.noUrl", "Impossible de récupérer le lien"),
        );
      }
    } catch {
      toast.error(
        t("documents.error.download", "Erreur lors du téléchargement"),
      );
    }
  };

  const vaultDocuments = [
    {
      key: "passport",
      label: t("documents.vault.passport", "Passeport"),
      description: t(
        "documents.vault.passportDesc",
        "Copie de votre passeport gabonais valide",
      ),
      icon: "🛂",
    },
    {
      key: "identityPhoto",
      label: t("documents.vault.identityPhoto", "Photo d'identité"),
      description: t(
        "documents.vault.identityPhotoDesc",
        "Photo récente format identité",
      ),
      icon: "📷",
    },
    {
      key: "proofOfAddress",
      label: t("documents.vault.proofOfAddress", "Justificatif de domicile"),
      description: t(
        "documents.vault.proofOfAddressDesc",
        "Facture ou attestation de moins de 3 mois",
      ),
      icon: "🏠",
    },
    {
      key: "birthCertificate",
      label: t("documents.vault.birthCertificate", "Acte de naissance"),
      description: t(
        "documents.vault.birthCertificateDesc",
        "Copie intégrale ou extrait",
      ),
      icon: "📜",
    },
    {
      key: "proofOfResidency",
      label: t("documents.vault.proofOfResidency", "Titre de séjour"),
      description: t(
        "documents.vault.proofOfResidencyDesc",
        "Carte de séjour ou visa",
      ),
      icon: "🪪",
    },
  ];

  if (isPending) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  const documents = profile?.documents ?? {};
  const completedCount = Object.values(documents).filter(Boolean).length;
  const totalCount = vaultDocuments.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>
          {t("documents.vault.title", "Coffre-fort numérique")}
        </AlertTitle>
        <AlertDescription>
          {t(
            "documents.vault.description",
            "Vos documents personnels sont stockés de manière sécurisée et utilisés pour pré-remplir vos demandes consulaires.",
          )}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("documents.vault.myDocs", "Mes pièces")}</CardTitle>
              <CardDescription>
                {t(
                  "documents.vault.progress",
                  "{{completed}} sur {{total}} documents",
                  {
                    completed: completedCount,
                    total: totalCount,
                  },
                )}
              </CardDescription>
            </div>
            <Badge
              variant={completedCount === totalCount ? "default" : "secondary"}
            >
              {completedCount === totalCount ?
                t("documents.vault.complete", "✓ Complet")
              : `${Math.round((completedCount / totalCount) * 100)}%`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {vaultDocuments.map((doc) => {
              const docId = documents[doc.key as keyof typeof documents];
              const isUploaded = Boolean(docId);

              return (
                <Card
                  key={doc.key}
                  className={`transition-all ${isUploaded ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20" : "border-dashed"}`}
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="text-2xl">{doc.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{doc.label}</h4>
                        {isUploaded ?
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        : <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        }
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {doc.description}
                      </p>
                      <div className="mt-3">
                        {isUploaded ?
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() =>
                              handleDownload(docId as unknown as string)
                            }
                          >
                            <Download className="h-3.5 w-3.5" />
                            {t("common.download", "Télécharger")}
                          </Button>
                        : <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            asChild
                          >
                            <Link to="/my-space/profile">
                              <Upload className="h-3.5 w-3.5" />
                              {t("documents.vault.upload", "Ajouter")}
                            </Link>
                          </Button>
                        }
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function RequestDocuments() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === "fr" ? "fr" : "en";

  const { data: requests, isPending } = useAuthenticatedConvexQuery(
    api.functions.requests.listMine,
    {},
  );
  const { mutateAsync: getUrl } = useConvexMutationQuery(
    api.functions.documents.getUrl,
  );

  const [searchQuery, setSearchQuery] = useState("");

  const handleDownload = async (storageId: string) => {
    try {
      const url = await getUrl({ storageId: storageId as Id<"_storage"> });
      if (url) {
        window.open(url, "_blank");
      } else {
        toast.error(
          t("documents.error.noUrl", "Impossible de récupérer le lien"),
        );
      }
    } catch {
      toast.error(
        t("documents.error.download", "Erreur lors du téléchargement"),
      );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "validated":
        return (
          <Badge
            variant="secondary"
            className="gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          >
            <CheckCircle className="h-3 w-3" />
            {t("documents.status.validated", "Validé")}
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            {t("documents.status.rejected", "Refusé")}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            {t("documents.status.pending", "En attente")}
          </Badge>
        );
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allDocuments: any[] =
    requests?.flatMap((request) =>
      (request.documents || []).map((doc: any) => ({
        ...doc,
        requestReference: request.reference,
        requestId: request._id,
        serviceName: request.serviceName?.[lang] || request.serviceName?.fr,
      })),
    ) || [];

  const filteredDocs =
    searchQuery ?
      allDocuments.filter(
        (doc) =>
          doc.filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.documentType?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : allDocuments;

  if (isPending) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Alert className="mb-4">
        <Info className="h-4 w-4" />
        <AlertTitle>
          {t("documents.requests.title", "Documents de demandes")}
        </AlertTitle>
        <AlertDescription>
          {t(
            "documents.requests.description",
            "Les documents joints à vos demandes de services consulaires.",
          )}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>
                {t("documents.listTitle", "Liste des documents")}
              </CardTitle>
              <CardDescription>
                {t(
                  "documents.listDescription",
                  "Documents joints à vos demandes",
                )}
              </CardDescription>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("documents.search", "Rechercher...")}
                className="pl-9"
                autoComplete="off"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!filteredDocs || filteredDocs.length === 0 ?
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <File className="h-12 w-12 mb-4 opacity-20" />
              <p className="mb-4">
                {searchQuery ?
                  t("common.noResults", "Aucun résultat trouvé.")
                : t("documents.empty", "Vous n'avez pas encore de documents.")}
              </p>
              {!searchQuery && (
                <p className="text-sm max-w-md">
                  {t(
                    "documents.emptyHint",
                    "Les documents seront ajoutés automatiquement lorsque vous soumettrez une demande.",
                  )}
                </p>
              )}
              <Button asChild className="mt-4" variant="outline">
                <Link to="/services">
                  {t("documents.browseServices", "Découvrir les services")}
                </Link>
              </Button>
            </div>
          : <div className="space-y-6">
              {requests
                ?.filter((r) => r.documents && r.documents.length > 0)
                .map((request) => {
                  const requestDocs = (request.documents || []).filter(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (doc: any) =>
                      !searchQuery ||
                      doc.filename
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      doc.documentType
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()),
                  );

                  if (requestDocs.length === 0) return null;

                  return (
                    <Collapsible key={request._id} defaultOpen={false}>
                      <div className="flex items-center justify-between gap-2 py-2 border-b">
                        <CollapsibleTrigger className="flex items-center gap-2 flex-1 hover:underline">
                          <DynamicFolderIcon
                            count={requestDocs.length}
                            size={24}
                          />
                          <ChevronRight className="size-4 transition-transform group-data-[state=open]:hidden" />
                          <ChevronDown className="size-4 hidden group-data-[state=open]:block" />
                          <h3 className="font-medium">
                            {request.serviceName?.[lang] ||
                              request.serviceName?.fr ||
                              request.reference}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {request.reference}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {requestDocs.length}{" "}
                            {t("documents.count", "document(s)")}
                          </Badge>
                        </CollapsibleTrigger>
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            to="/my-space/requests/$requestId"
                            params={{ requestId: request._id }}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            {t("documents.viewRequest", "Voir la demande")}
                          </Link>
                        </Button>
                      </div>
                      <CollapsibleContent>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-3">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {requestDocs.map((doc: any) => (
                            <Card
                              key={doc._id}
                              className="group hover:border-primary/50 transition-colors"
                            >
                              <CardContent className="p-4 flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                  <FileText className="h-6 w-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4
                                    className="font-medium truncate"
                                    title={doc.filename}
                                  >
                                    {doc.filename}
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    {doc._creationTime ?
                                      format(
                                        new Date(doc._creationTime),
                                        "dd MMM yyyy",
                                        { locale: fr },
                                      )
                                    : "-"}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    {getStatusBadge(doc.status)}
                                    <span className="text-xs text-muted-foreground">
                                      {doc.sizeBytes ?
                                        `${(doc.sizeBytes / 1024).toFixed(0)} KB`
                                      : "-"}
                                    </span>
                                  </div>
                                </div>
                              </CardContent>
                              <div className="px-4 pb-4 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  title={t("documents.download", "Télécharger")}
                                  onClick={() => handleDownload(doc.storageId)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
            </div>
          }
        </CardContent>
      </Card>
    </motion.div>
  );
}
