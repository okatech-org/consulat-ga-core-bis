"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
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
  const { t } = useTranslation()
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
      toast.success(t("dashboard.dialogs.memberRole.success"))
      onOpenChange(false)
    } catch {
      toast.error(t("dashboard.dialogs.memberRole.error"))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("dashboard.dialogs.memberRole.title")}</DialogTitle>
          <DialogDescription>
            {userName && `${t("dashboard.dialogs.memberRole.descriptionPrefix")} ${userName}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t("dashboard.dialogs.memberRole.role")}</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  {t("dashboard.dialogs.addMember.roles.admin")}
                </SelectItem>
                <SelectItem value="agent">
                  {t("dashboard.dialogs.addMember.roles.agent")}
                </SelectItem>
                <SelectItem value="viewer">
                  {t("dashboard.dialogs.addMember.roles.viewer")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("dashboard.dialogs.memberRole.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "..." : t("dashboard.dialogs.memberRole.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

