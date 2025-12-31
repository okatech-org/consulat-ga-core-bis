import { createFileRoute } from "@tanstack/react-router"
// import { useTranslation } from "react-i18next"
import { useQuery, useMutation } from "convex/react"
import { api } from "@convex/_generated/api"
import { useOrg } from "@/components/org/org-provider"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Building2, MoreHorizontal, UserPlus, Shield, User, XCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { AddMemberDialog } from "@/components/org/add-member-dialog"
import { MemberRoleDialog } from "@/components/org/member-role-dialog"
import { Id } from "@convex/_generated/dataModel"

export const Route = createFileRoute("/dashboard/team/")({
  component: DashboardTeam,
})

function DashboardTeam() {
  const { activeOrgId } = useOrg()
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<any>(null)

  // Queries
  const members = useQuery(
    api.orgs.getMembers,
    activeOrgId ? { orgId: activeOrgId } : "skip"
  )

  // Mutations
  const removeMember = useMutation(api.orgs.removeMember)

  const handleRemove = async (userId?: Id<"users">) => {
    if (!activeOrgId || !userId || !confirm("Êtes-vous sûr de vouloir retirer ce membre ?")) return

    try {
      await removeMember({ orgId: activeOrgId, userId })
      toast.success("Membre retiré")
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    }
  }

  const openRoleDialog = (member: any) => {
    setSelectedMember(member)
    setRoleDialogOpen(true)
  }

  if (!members) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Équipe</h1>
          <p className="text-muted-foreground">
            Gérez les membres de votre organisation et leurs permissions
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Ajouter un membre
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Membres de l'organisation
          </CardTitle>
          <CardDescription>
            Liste des utilisateurs ayant accès à ce tableau de bord.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Date d'ajout</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.profileImageUrl} />
                        <AvatarFallback>
                          {member.firstName?.[0]}
                          {member.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={member.role === "admin" ? "default" : "secondary"}
                      className="capitalize"
                    >
                      {member.role === "admin" && <Shield className="mr-1 h-3 w-3" />}
                      {member.role === "agent" && <User className="mr-1 h-3 w-3" />}
                      {member.role === "viewer" && <User className="mr-1 h-3 w-3" />}
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openRoleDialog(member)}>
                          Changer le rôle
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleRemove(member._id)}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Retirer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {activeOrgId && (
        <>
          <AddMemberDialog 
            open={addDialogOpen} 
            onOpenChange={setAddDialogOpen} 
            orgId={activeOrgId} 
          />
          
          {selectedMember && (
            <MemberRoleDialog
              open={roleDialogOpen}
              onOpenChange={setRoleDialogOpen}
              orgId={activeOrgId}
              userId={selectedMember._id}
              currentRole={selectedMember.role}
              userName={`${selectedMember.firstName} ${selectedMember.lastName}`}
            />
          )}
        </>
      )}
    </div>
  )
}
