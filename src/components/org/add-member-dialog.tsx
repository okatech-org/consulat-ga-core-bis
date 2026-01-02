"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
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
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing")
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<SearchResult | null>(null)
  const [role, setRole] = useState<"admin" | "agent" | "viewer">("agent")
  
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
  })

  const debouncedSearch = useDebounce(searchQuery, 300)
  const shouldSearch = debouncedSearch.length >= 3

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
      toast.error(t("dashboard.dialogs.addMember.selectUser"))
      return
    }

    try {
      await addMemberById({
        orgId,
        userId: selectedUser._id,
        role: role as any,
      })
      toast.success(t("dashboard.dialogs.addMember.successExisting"))
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || t("common.error"))
    }
  }

  const handleAddNewUser = async () => {
    if (!newUser.email.trim()) {
      toast.error(t("dashboard.dialogs.addMember.emailRequired"))
      return
    }

    try {
      const { userId } = await createAccount({
        orgId,
        email: newUser.email.trim(),
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      })

      await addMemberById({
        orgId,
        userId: userId as Id<"users">,
        role: role as any,
      })

      toast.success(t("dashboard.dialogs.addMember.successNew"))
      onOpenChange(false)
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || t("common.error"))
    }
  }

  const isPending = isAddingById || isCreating

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("dashboard.dialogs.addMember.title")}</DialogTitle>
          <DialogDescription>
            {t("dashboard.dialogs.addMember.description")}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "existing" | "new")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {t("dashboard.dialogs.addMember.existingUser")}
            </TabsTrigger>
            <TabsTrigger value="new" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              {t("dashboard.dialogs.addMember.newAccount")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>{t("dashboard.dialogs.addMember.searchByEmail")}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder={t("dashboard.dialogs.addMember.emailPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

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
                  {t("dashboard.dialogs.addMember.noUserFound")}
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

            <div className="space-y-2">
              <Label>{t("dashboard.dialogs.addMember.role")}</Label>
              <Select value={role} onValueChange={(v) => setRole(v as "admin" | "agent" | "viewer")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{t("dashboard.dialogs.addMember.roles.admin")}</SelectItem>
                  <SelectItem value="agent">{t("dashboard.dialogs.addMember.roles.agent")}</SelectItem>
                  <SelectItem value="viewer">{t("dashboard.dialogs.addMember.roles.viewer")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="new" className="space-y-4 pt-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t("dashboard.dialogs.addMember.firstName")}</Label>
                  <Input
                    placeholder="John"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("dashboard.dialogs.addMember.lastName")}</Label>
                  <Input
                    placeholder="Doe"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("dashboard.dialogs.addMember.email")}</Label>
                <Input
                  type="email"
                  placeholder="john.doe@example.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>{t("dashboard.dialogs.addMember.role")}</Label>
                <Select value={role} onValueChange={(v) => setRole(v as "admin" | "agent" | "viewer")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">{t("dashboard.dialogs.addMember.roles.admin")}</SelectItem>
                    <SelectItem value="agent">{t("dashboard.dialogs.addMember.roles.agent")}</SelectItem>
                    <SelectItem value="viewer">{t("dashboard.dialogs.addMember.roles.viewer")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("dashboard.dialogs.addMember.cancel")}
          </Button>
          <Button
            onClick={activeTab === "existing" ? handleAddExistingUser : handleAddNewUser}
            disabled={isPending || (activeTab === "existing" && !selectedUser)}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("dashboard.dialogs.addMember.loading")}
              </>
            ) : (
              t("dashboard.dialogs.addMember.add")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

