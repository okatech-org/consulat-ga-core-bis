"use client"

import { useTranslation } from 'react-i18next'
import { useAuthenticatedConvexQuery, useConvexMutationQuery } from '@/integrations/convex/hooks'
import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, UserPlus, Trash2, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import { AddMemberDialog } from './add-member-dialog'
import { MemberRoleDialog } from './member-role-dialog'

interface OrgMembersTableProps {
  orgId: Id<"orgs">
}

// Helper to get initials
function getInitials(firstName?: string, lastName?: string, email?: string): string {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }
  if (firstName) {
    return firstName.slice(0, 2).toUpperCase()
  }
  if (email) {
    return email.slice(0, 2).toUpperCase()
  }
  return "??"
}

// Helper to get role badge variant
function getRoleBadgeVariant(role: string): "default" | "secondary" | "outline" {
  switch (role) {
    case "admin":
      return "default"
    case "agent":
      return "secondary"
    default:
      return "outline"
  }
}

// Type for a member with embedded user data
interface MemberWithUser {
  _id?: Id<"users">
  firstName?: string
  lastName?: string
  email?: string
  profileImageUrl?: string
  role: string
  joinedAt: number
  membershipId: Id<"orgMembers">
}

export function OrgMembersTable({ orgId }: OrgMembersTableProps) {
  const { t } = useTranslation()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [roleDialogMember, setRoleDialogMember] = useState<MemberWithUser | null>(null)

  const { data: members, isPending, error } = useAuthenticatedConvexQuery(
    api.orgs.getMembers,
    { orgId }
  )

  const { mutate: removeMember, isPending: isRemoving } = useConvexMutationQuery(
    api.orgs.removeMember
  )

  const handleRemoveMember = async (userId: Id<"users">) => {
    try {
      await removeMember({ orgId, userId })
      toast.success(t("superadmin.orgMembers.memberRemoved"))
    } catch (error) {
      toast.error(t("superadmin.common.error"))
    }
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">{t("superadmin.common.error")}</p>
        </CardContent>
      </Card>
    )
  }

  const typedMembers = (members ?? []) as MemberWithUser[]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t("superadmin.orgMembers.title")}</CardTitle>
          <CardDescription>
            {t("superadmin.orgMembers.description")}
          </CardDescription>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          {t("superadmin.orgMembers.addMember")}
        </Button>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : typedMembers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("superadmin.users.columns.name")}</TableHead>
                <TableHead>{t("superadmin.users.columns.email")}</TableHead>
                <TableHead>{t("superadmin.users.columns.role")}</TableHead>
                <TableHead>{t("superadmin.table.createdAt")}</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {typedMembers.map((member) => (
                <TableRow key={member.membershipId}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.profileImageUrl} />
                        <AvatarFallback className="text-xs">
                          {getInitials(member.firstName, member.lastName, member.email)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {member.firstName && member.lastName
                          ? `${member.firstName} ${member.lastName}`
                          : member.email || "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {member.email || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(member.role)}>
                      {t(`superadmin.orgMembers.roles.${member.role}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {member._id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setRoleDialogMember(member)}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            {t("superadmin.orgMembers.changeRole")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRemoveMember(member._id!)}
                            disabled={isRemoving}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t("superadmin.orgMembers.removeMember")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            {t("superadmin.orgMembers.noMembers")}
          </p>
        )}
      </CardContent>

      <AddMemberDialog
        orgId={orgId}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />

      {roleDialogMember && roleDialogMember._id && (
        <MemberRoleDialog
          open={!!roleDialogMember}
          onOpenChange={(open) => !open && setRoleDialogMember(null)}
          orgId={orgId}
          userId={roleDialogMember._id}
          currentRole={roleDialogMember.role}
          userName={roleDialogMember.firstName && roleDialogMember.lastName 
            ? `${roleDialogMember.firstName} ${roleDialogMember.lastName}` 
            : roleDialogMember.email}
        />
      )}
    </Card>
  )
}
