import { useQuery } from "convex/react"
import { useConvexMutationQuery } from "@/integrations/convex/hooks"
import { api } from "@convex/_generated/api"
import { Trash2, FileText, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface DocumentListProps {
  documentIds: string[]
  docType: string
  onRemove: (documentId: string) => Promise<void>
}

export function DocumentList({ documentIds, onRemove }: DocumentListProps) {


  const documents = useQuery(api.documents.getDocumentsByIds, { ids: documentIds as any })
  const { mutateAsync: getUrl } = useConvexMutationQuery(api.documents.getUrl)

  const handleOpen = async (storageId: string) => {
      const url = await getUrl({ storageId: storageId as any })
      if(url) window.open(url, '_blank')
  }

  if (documentIds.length === 0) return null

  if (!documents) return <div className="py-2"><Loader2 className="h-4 w-4 animate-spin"/></div>

  return (
    <div className="space-y-2 mt-4">
      {documents.map((doc) => (
        <div key={doc._id} className="flex items-center justify-between p-3 border rounded-lg bg-background hover:bg-accent/5 transition-colors group">
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-primary/10 rounded-md">
                    <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate max-w-[200px] sm:max-w-xs">{doc.name}</span>
                    <span className="text-xs text-muted-foreground">{(doc.size / 1024).toFixed(0)} KB</span>
                </div>
            </div>
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => handleOpen(doc.storageId)}>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                        toast.promise(onRemove(doc._id), {
                            loading: 'Suppression...',
                            success: 'Fichier supprimé',
                            error: 'Erreur lors de la suppression'
                        })
                    }}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
      ))}
    </div>
  )
}
