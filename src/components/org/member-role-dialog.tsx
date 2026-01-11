"use client"

import { useTranslation } from "react-i18next"
import { useForm } from "@tanstack/react-form"
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
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

  const { mutateAsync: updateRole, isPending } = useConvexMutationQuery(
    api.orgs.updateMemberRole
  )

  const form = useForm({
    defaultValues: {
      role: currentRole,
    },
    onSubmit: async ({ value }) => {
      if (value.role === currentRole) {
        onOpenChange(false)
        return
      }

      try {
        await updateRole({
          orgId,
          userId,
          role: value.role as OrgMemberRole,
        })
        toast.success(t("dashboard.dialogs.memberRole.success"))
        onOpenChange(false)
      } catch {
        toast.error(t("dashboard.dialogs.memberRole.error"))
      }
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("dashboard.dialogs.memberRole.title")}</DialogTitle>
          <DialogDescription>
            {userName && `${t("dashboard.dialogs.memberRole.descriptionPrefix")} ${userName}`}
          </DialogDescription>
        </DialogHeader>

        <form
          id="member-role-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name="role"
              children={(field) => (
                <Field>
                  <FieldLabel>{t("dashboard.dialogs.memberRole.role")}</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value)}
                  >
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
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("dashboard.dialogs.memberRole.cancel")}
          </Button>
          <Button type="submit" form="member-role-form" disabled={isPending}>
            {isPending ? "..." : t("dashboard.dialogs.memberRole.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
