"use client"

import { useState } from "react"
// import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useConvexMutationQuery } from "@/integrations/convex/hooks"
import { api } from "@convex/_generated/api"
import { Id } from "@convex/_generated/dataModel"
import { toast } from "sonner"
import { OrgMemberRole } from "@convex/lib/types"

interface MemberRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orgId: Id<"orgs">
  userId: Id<"users">
  currentRole: string
  userName?: string
}

export function MemberRoleDialog({
  open,
  onOpenChange,
  orgId,
  userId,
  currentRole,
  userName,
}: MemberRoleDialogProps) {
  // const { t } = useTranslation()
  const [selectedRole, setSelectedRole] = useState(currentRole)

  const { mutateAsync: updateRole, isPending } = useConvexMutationQuery(
    api.orgs.updateMemberRole
  )

  const handleSubmit = async () => {
    if (selectedRole === currentRole) {
      onOpenChange(false)
      return
    }

    try {
      await updateRole({
        orgId,
        userId,
        role: selectedRole as OrgMemberRole,
      })
      toast.success("Rôle mis à jour")
      onOpenChange(false)
    } catch (error) {
      toast.error("Erreur")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Changer le rôle</DialogTitle>
          <DialogDescription>
            {userName && `Changer le rôle de ${userName}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Rôle</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  Administrateur
                </SelectItem>
                <SelectItem value="agent">
                  Agent Consulaire
                </SelectItem>
                <SelectItem value="viewer">
                  Observateur
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
