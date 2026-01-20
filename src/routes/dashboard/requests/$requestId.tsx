import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useQuery, useMutation } from "convex/react"
import { api } from "@convex/_generated/api"
import { Id } from "@convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RequestStatus } from "@convex/lib/validators"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, FileText, User, Calendar, MessageSquare, Send, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export const Route = createFileRoute("/dashboard/requests/$requestId")({
  component: RequestDetail,
})

function RequestDetail() {
  const { requestId } = Route.useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [newNote, setNewNote] = useState("")
  const [isInternal, setIsInternal] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>("")

  const request = useQuery(api.functions.requests.getById, { requestId: requestId as Id<"requests"> })
  const updateStatus = useMutation(api.functions.requests.updateStatus)
  const addNote = useMutation(api.functions.requests.addNote)

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === request?.status) return
    try {
      await updateStatus({
        requestId: requestId as Id<"requests">,
        status: selectedStatus as RequestStatus,
      })
      toast.success(t("dashboard.requests.detail.statusCard.statusUpdated"))
    } catch {
      toast.error(t("dashboard.requests.detail.statusCard.updateError"))
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    try {
      await addNote({
        requestId: requestId as Id<"requests">,
        content: newNote,
        isInternal,
      })
      setNewNote("")
      toast.success(t("dashboard.requests.detail.notesCard.noteAdded"))
    } catch {
      toast.error(t("dashboard.requests.detail.notesCard.noteError"))
    }
  }

  if (!request) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/dashboard/requests" as any })}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("dashboard.requests.detail.title", { ref: request.reference || t("dashboard.requests.noReference") })}
          </h1>
          <p className="text-muted-foreground">
            {t("dashboard.requests.detail.createdAt", { date: new Date(request._creationTime).toLocaleDateString() })}
          </p>
        </div>
        <Badge variant={request.status === RequestStatus.Completed ? "default" : "secondary"} className="text-sm">
          {t(`dashboard.requests.statuses.${request.status}`)}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-4">
          {/* Service Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t("dashboard.requests.detail.serviceCard.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <Label className="text-muted-foreground">{t("dashboard.requests.detail.serviceCard.serviceName")}</Label>
                  <p className="font-medium">{(request.service as any)?.name || t("dashboard.requests.detail.serviceCard.unknownService")}</p>
                </div>
                {request.formData && (
                  <div>
                    <Label className="text-muted-foreground">{t("dashboard.requests.detail.serviceCard.formData")}</Label>
                    <pre className="mt-1 rounded-md bg-muted p-3 text-sm overflow-auto max-h-60">
                      {JSON.stringify(request.formData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {t("dashboard.requests.detail.notesCard.title")}
              </CardTitle>
              <CardDescription>
                {t("dashboard.requests.detail.notesCard.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {request.notes && request.notes.length > 0 ? (
                  request.notes.map((note: any) => (
                    <div key={note._id} className={`p-3 rounded-lg ${note.isInternal ? 'bg-yellow-50 border border-yellow-200' : 'bg-muted'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{t("dashboard.requests.detail.notesCard.agent")}</span>
                        {note.isInternal && <Badge variant="outline" className="text-xs">{t("dashboard.requests.detail.notesCard.internal")}</Badge>}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(note.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{note.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t("dashboard.requests.detail.notesCard.noNotes")}
                  </p>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <Textarea
                  placeholder={t("dashboard.requests.detail.notesCard.addPlaceholder")}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    {t("dashboard.requests.detail.notesCard.internalNote")}
                  </label>
                  <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>
                    <Send className="mr-2 h-4 w-4" />
                    {t("dashboard.requests.detail.notesCard.send")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Requester Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t("dashboard.requests.detail.requesterCard.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {request.user ? (
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={request.user?.avatarUrl} />
                    <AvatarFallback>
                      {request.user.firstName?.[0]}{request.user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{request.user.firstName} {request.user.lastName}</p>
                    <p className="text-sm text-muted-foreground">{request.user.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">{t("dashboard.requests.detail.requesterCard.unknown")}</p>
              )}
            </CardContent>
          </Card>

          {/* Status Update */}
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.requests.detail.statusCard.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select 
                value={selectedStatus || request.status} 
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("dashboard.requests.detail.statusCard.selectPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={RequestStatus.UnderReview}>{t("dashboard.requests.statuses.under_review")}</SelectItem>
                  <SelectItem value={RequestStatus.InProduction}>{t("dashboard.requests.statuses.processing")}</SelectItem>
                  <SelectItem value={RequestStatus.PendingCompletion}>{t("dashboard.requests.statuses.pending_documents")}</SelectItem>
                  <SelectItem value={RequestStatus.Pending}>{t("dashboard.requests.statuses.pending_payment")}</SelectItem>
                  <SelectItem value={RequestStatus.Completed}>{t("dashboard.requests.statuses.completed")}</SelectItem>
                  <SelectItem value={RequestStatus.Rejected}>{t("dashboard.requests.statuses.rejected")}</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                className="w-full" 
                onClick={handleStatusUpdate}
                disabled={!selectedStatus || selectedStatus === request.status}
              >
                {t("dashboard.requests.detail.statusCard.update")}
              </Button>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t("dashboard.requests.detail.timelineCard.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("dashboard.requests.detail.timelineCard.created")}</span>
                  <span>{new Date(request._creationTime).toLocaleDateString()}</span>
                </div>
                {request.submittedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("dashboard.requests.detail.timelineCard.submitted")}</span>
                    <span>{new Date(request.submittedAt).toLocaleDateString()}</span>
                  </div>
                )}
                {request.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("dashboard.requests.detail.timelineCard.completed")}</span>
                    <span>{new Date(request.completedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

