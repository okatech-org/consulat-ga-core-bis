"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { MoreHorizontal, Shield, UserCheck, UserX, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Doc } from "@convex/_generated/dataModel"
import { UserRoleDialog } from "./user-role-dialog"
import { useConvexMutationQuery } from "@/integrations/convex/hooks"
import { api } from "@convex/_generated/api"
import { toast } from "sonner"
import { useNavigate } from "@tanstack/react-router"

interface UserActionsCellProps {
  user: Doc<"users">
}

export function UserActionsCell({ user }: UserActionsCellProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  
  const { mutate: enableUser, isPending: isEnabling } = useConvexMutationQuery(
    api.functions.admin.enableUser
  )
  
  const { mutate: disableUser, isPending: isDisabling } = useConvexMutationQuery(
    api.functions.admin.disableUser
  )

  const handleToggleStatus = async () => {
    try {
      if (user.isActive) {
        await disableUser({ userId: user._id })
        toast.success(t("superadmin.users.actions.disable") + " ✓")
      } else {
        await enableUser({ userId: user._id })
        toast.success(t("superadmin.users.actions.enable") + " ✓")
      }
    } catch (error) {
      toast.error(t("superadmin.common.error"))
    }
  }

  const handleView = () => {
    navigate({ to: `/superadmin/users/${user._id}` as any })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleView}>
            <Eye className="mr-2 h-4 w-4" />
            {t("superadmin.common.view")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowRoleDialog(true)}>
            <Shield className="mr-2 h-4 w-4" />
            {t("superadmin.users.actions.editRole")}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleToggleStatus}
            disabled={isEnabling || isDisabling}
          >
            {user.isActive ? (
              <>
                <UserX className="mr-2 h-4 w-4" />
                {t("superadmin.users.actions.disable")}
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                {t("superadmin.users.actions.enable")}
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UserRoleDialog
        user={user}
        open={showRoleDialog}
        onOpenChange={setShowRoleDialog}
      />
    </>
  )
}
