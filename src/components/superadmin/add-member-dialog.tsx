"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useConvexMutationQuery } from "@/integrations/convex/hooks"
import { api } from "@convex/_generated/api"
import { Id } from "@convex/_generated/dataModel"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AddMemberDialogProps {
  orgId: Id<"orgs">
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddMemberDialog({ orgId, open, onOpenChange }: AddMemberDialogProps) {
  const { t } = useTranslation()
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"admin" | "agent" | "viewer">("agent")

  const { mutateAsync: addMember, isPending } = useConvexMutationQuery(
    api.orgs.addMemberByEmail
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error(t("superadmin.orgMembers.emailRequired"))
      return
    }

    try {
      await addMember({
        orgId,
        email: email.trim(),
        role: role as any, // Type assertion for Convex enum
      })
      toast.success(t("superadmin.orgMembers.memberAdded"))
      setEmail("")
      setRole("agent")
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || t("superadmin.common.error"))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("superadmin.orgMembers.addMember")}</DialogTitle>
          <DialogDescription>
            {t("superadmin.orgMembers.addMemberDesc")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">
                {t("superadmin.users.columns.email")}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">
                {t("superadmin.users.columns.role")}
              </Label>
              <Select value={role} onValueChange={(v) => setRole(v as "admin" | "agent" | "viewer")}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    {t("superadmin.orgMembers.roles.admin")}
                  </SelectItem>
                  <SelectItem value="agent">
                    {t("superadmin.orgMembers.roles.agent")}
                  </SelectItem>
                  <SelectItem value="viewer">
                    {t("superadmin.orgMembers.roles.viewer")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("superadmin.organizations.form.cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t("superadmin.common.loading") : t("superadmin.orgMembers.addMember")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
