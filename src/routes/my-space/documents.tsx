import { createFileRoute, Link } from "@tanstack/react-router"
import { useAuthenticatedConvexQuery, useConvexMutationQuery } from "@/integrations/convex/hooks"
import { api } from "@convex/_generated/api"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, File, Download, Trash2, Search, FileText, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useState } from "react"
import type { Id } from "@convex/_generated/dataModel"
import { toast } from "sonner"

export const Route = createFileRoute("/my-space/documents")({
  component: DocumentsPage,
})

function DocumentsPage() {
  const { t } = useTranslation()
  const { data: documents, isPending } = useAuthenticatedConvexQuery(api.functions.documents.listMine, {})
  const { mutateAsync: getUrl } = useConvexMutationQuery(api.functions.documents.getUrl)
  const { mutateAsync: deleteDocument } = useConvexMutationQuery(api.functions.documents.remove)
  
  const [searchQuery, setSearchQuery] = useState("")

  const handleDownload = async (storageId: string) => {
      try {
          const url = await getUrl({ storageId: storageId as Id<"_storage"> })
          if (url) {
              window.open(url, '_blank')
          } else {
              toast.error("Impossible de récupérer le lien du document")
          }
      } catch (e) {
          toast.error("Erreur lors du téléchargement")
      }
  }

  const handleDelete = async (id: string, name: string) => {
      if (confirm(`Êtes-vous sûr de vouloir supprimer "${name}" ?`)) {
          try {
              await deleteDocument({ documentId: id as Id<"documents"> })
              toast.success("Document supprimé")
          } catch (e) {
              toast.error("Erreur lors de la suppression")
          }
      }
  }

  const filteredDocs = documents?.filter(doc => 
      doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  if (isPending) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("documents.title", "Mes Documents")}</h1>
          <p className="text-muted-foreground">
            {t("documents.desc", "Consultez et téléchargez vos documents.")}
          </p>
        </div>
        <Button asChild>
          <Link to="/my-space/profile" search={{ tab: 'documents' }}>
            <Plus className="mr-2 h-4 w-4" />
            {t("documents.add", "Ajouter un document")}
          </Link>
        </Button>
      </div>

       <Card>
        <CardHeader>
           <div className="flex items-center justify-between">
                <CardTitle>{t("documents.listTitle", "Coffre-fort numérique")}</CardTitle>
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
             {!filteredDocs || filteredDocs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <File className="h-12 w-12 mb-4 opacity-20" />
                    <p>{documents && documents.length > 0 ? t("common.noResults", "Aucun résultat trouvé.") : t("documents.empty", "Vous n'avez aucun document.")}</p>
                </div>
             ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredDocs.map((doc) => (
                        <Card key={doc._id} className="group hover:border-primary/50 transition-colors">
                            <CardContent className="p-4 flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium truncate" title={doc.filename}>{doc.filename}</h4>
                                    <p className="text-xs text-muted-foreground">
                                        {format(new Date(doc._creationTime), "dd MMM yyyy", { locale: fr })}
                                    </p>
                                    <p className="text-xs text-muted-foreground uppercase mt-1">
                                        {doc.documentType.split('/')[1] || doc.documentType} • {(doc.sizeBytes / 1024).toFixed(0)} KB
                                    </p>
                                </div>
                            </CardContent>
                             <div className="px-4 pb-4 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon-xs" title="Télécharger" onClick={() => handleDownload(doc.storageId)}>
                                    <Download className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon-xs" className="text-destructive hover:text-destructive hover:bg-destructive/10" title="Supprimer" onClick={() => handleDelete(doc._id, doc.filename)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
             )}
        </CardContent>
      </Card>
    </div>
  )
}
