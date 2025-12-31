"use client"

import { useState, useEffect } from "react"
// import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"
import { useConvexMutationQuery, convexQuery, useConvexActionQuery } from "@/integrations/convex/hooks"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, Search, User, UserPlus, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
// import { useDebounce } from "../../hooks/use-debounce"
// Simple debounce hook implementation to avoid import issues
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

interface AddMemberDialogProps {
  orgId: Id<"orgs">
  open: boolean
  onOpenChange: (open: boolean) => void
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

interface SearchResult {
  _id: Id<"users">
  firstName?: string
  lastName?: string
  email?: string
  profileImageUrl?: string
}

export function AddMemberDialog({ orgId, open, onOpenChange }: AddMemberDialogProps) {
  // const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing")
  
  // Existing user state
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<SearchResult | null>(null)
  const [role, setRole] = useState<"admin" | "agent" | "viewer">("agent")
  
  // New user state
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
  })

  // Debounced search query
  const debouncedSearch = useDebounce(searchQuery, 300)
  const shouldSearch = debouncedSearch.length >= 3

  // Search users query - using ORG specific search (public/auth)
  const { data: searchResults, isPending: isSearching } = useQuery({
    ...convexQuery(api.orgs.searchCandidates, { query: debouncedSearch, limit: 10 }),
    enabled: shouldSearch,
  })

  const { mutateAsync: addMemberById, isPending: isAddingById } = useConvexMutationQuery(
    api.orgs.addMember
  )

  const { mutateAsync: createAccount, isPending: isCreating } = useConvexActionQuery(
    api.orgs.createAccount
  )

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("")
      setSelectedUser(null)
      setRole("agent")
      setNewUser({ firstName: "", lastName: "", email: "" })
      setActiveTab("existing")
    }
  }, [open])

  const handleAddExistingUser = async () => {
    if (!selectedUser) {
      toast.error("Veuillez sélectionner un utilisateur")
      return
    }

    try {
      await addMemberById({
        orgId,
        userId: selectedUser._id,
        role: role as any,
      })
      toast.success("Membre ajouté avec succès")
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'ajout")
    }
  }

  const handleAddNewUser = async () => {
    if (!newUser.email.trim()) {
      toast.error("L'email est requis")
      return
    }

    try {
      // 1. Create user in Clerk (via Org Action)
      const { userId } = await createAccount({
        orgId,
        email: newUser.email.trim(),
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      })

      // 2. Add as member to the organization
      await addMemberById({
        orgId,
        userId: userId as Id<"users">,
        role: role as any,
      })

      toast.success("Nouveau compte créé et membre ajouté")
      onOpenChange(false)
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Erreur lors de la création")
    }
  }

  const isPending = isAddingById || isCreating

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un membre</DialogTitle>
          <DialogDescription>
            Ajoutez un utilisateur existant ou créez un nouveau compte pour votre équipe.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "existing" | "new")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Utilisateur existant
            </TabsTrigger>
            <TabsTrigger value="new" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Nouveau compte
            </TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="space-y-4 pt-4">
            {/* Search Input */}
            <div className="space-y-2">
              <Label>Recherche par email</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="exemple@email.com"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Search Results */}
            <div className="space-y-2">
              {isSearching && debouncedSearch.length >= 3 && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}

              {!isSearching && (searchResults as SearchResult[]) && (searchResults as SearchResult[]).length > 0 && (
                <div className="max-h-48 overflow-y-auto rounded-md border">
                  {(searchResults as SearchResult[]).map((user) => (
                    <button
                      key={user._id}
                      type="button"
                      onClick={() => setSelectedUser(user)}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted/50 transition-colors",
                        selectedUser?._id === user._id && "bg-primary/10"
                      )}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profileImageUrl} />
                        <AvatarFallback className="text-xs">
                          {getInitials(user.firstName, user.lastName, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user.email}
                        </p>
                        {user.firstName && user.lastName && (
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        )}
                      </div>
                      {selectedUser?._id === user._id && (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {!isSearching && debouncedSearch.length >= 3 && searchResults?.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun utilisateur trouvé
                </p>
              )}

              {selectedUser && (
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-md border border-primary/20">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedUser.profileImageUrl} />
                    <AvatarFallback>
                      {getInitials(selectedUser.firstName, selectedUser.lastName, selectedUser.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">
                      {selectedUser.firstName && selectedUser.lastName
                        ? `${selectedUser.firstName} ${selectedUser.lastName}`
                        : selectedUser.email}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUser(null)}
                    className="text-muted-foreground"
                  >
                    ×
                  </Button>
                </div>
              )}
            </div>

            {/* Role Selector */}
            <div className="space-y-2">
              <Label>Rôle</Label>
              <Select value={role} onValueChange={(v) => setRole(v as "admin" | "agent" | "viewer")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrateur</SelectItem>
                  <SelectItem value="agent">Agent Consulaire</SelectItem>
                  <SelectItem value="viewer">Observateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="new" className="space-y-4 pt-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Prénom</Label>
                  <Input
                    placeholder="John"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input
                    placeholder="Doe"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="john.doe@example.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>

              {/* Role Selector */}
              <div className="space-y-2">
                <Label>Rôle</Label>
                <Select value={role} onValueChange={(v) => setRole(v as "admin" | "agent" | "viewer")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="agent">Agent Consulaire</SelectItem>
                    <SelectItem value="viewer">Observateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={activeTab === "existing" ? handleAddExistingUser : handleAddNewUser}
            disabled={isPending || (activeTab === "existing" && !selectedUser)}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Patientez...
              </>
            ) : (
              "Ajouter le membre"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
