"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

import { Check, Loader2, Search, User, UserPlus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	convexQuery,
	useAuthenticatedConvexQuery,
	useConvexMutationQuery,
} from "@/integrations/convex/hooks";
import { cn } from "@/lib/utils";
import { useDebounce } from "../../hooks/use-debounce";

interface AddMemberDialogProps {
	orgId: Id<"orgs">;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

function getInitials(
	firstName?: string,
	lastName?: string,
	email?: string,
): string {
	if (firstName && lastName) {
		return `${firstName[0]}${lastName[0]}`.toUpperCase();
	}
	if (firstName) {
		return firstName.slice(0, 2).toUpperCase();
	}
	if (email) {
		return email.slice(0, 2).toUpperCase();
	}
	return "??";
}

interface SearchResult {
	_id: Id<"users">;
	firstName?: string;
	lastName?: string;
	email?: string;
	profileImageUrl?: string;
}

export function AddMemberDialog({
	orgId,
	open,
	onOpenChange,
}: AddMemberDialogProps) {
	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedUser, setSelectedUser] = useState<SearchResult | null>(null);
	const [role, setRole] = useState<"admin" | "agent" | "viewer">("agent");

	const [newUser, setNewUser] = useState({
		firstName: "",
		lastName: "",
		email: "",
	});

	const debouncedSearch = useDebounce(searchQuery, 300);
	const shouldSearch = debouncedSearch.length >= 3;

	const { data: searchResults, isPending: isSearching } =
		useAuthenticatedConvexQuery(
			api.functions.users.search,
			shouldSearch ? { query: debouncedSearch, limit: 10 } : "skip",
		);

	const { mutateAsync: addMemberById, isPending: isAddingById } =
		useConvexMutationQuery(api.functions.orgs.addMember);

	const { mutateAsync: createExternalUser, isPending: isCreatingClerk } =
		useConvexMutationQuery(api.functions.admin.createExternalUser);

	// Reset state when dialog closes
	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			// Reset all state immediately when closing
			setSearchQuery("");
			setSelectedUser(null);
			setRole("agent");
			setNewUser({ firstName: "", lastName: "", email: "" });
			setActiveTab("existing");
		}
		onOpenChange(newOpen);
	};

	const handleAddExistingUser = async () => {
		if (!selectedUser) {
			toast.error(t("superadmin.orgMembers.selectUser"));
			return;
		}

		try {
			await addMemberById({
				orgId,
				userId: selectedUser._id,
				role: role as any,
			});
			toast.success(t("superadmin.orgMembers.memberAdded"));
			handleOpenChange(false);
		} catch (error: any) {
			const errorKey = error.message?.startsWith("errors.")
				? error.message
				: null;
			toast.error(errorKey ? t(errorKey) : t("superadmin.common.error"));
		}
	};

	const handleAddNewUser = async () => {
		if (!newUser.email.trim()) {
			toast.error(t("superadmin.orgMembers.emailRequired"));
			return;
		}

		try {
			const { userId } = await createExternalUser({
				email: newUser.email.trim(),
				firstName: newUser.firstName,
				lastName: newUser.lastName,
			});

			await addMemberById({
				orgId,
				userId: userId as Id<"users">,
				role: role as any,
			});

			toast.success(t("superadmin.orgMembers.memberAdded"));
			handleOpenChange(false);
		} catch (error: any) {
			console.error(error);
			const errorKey = error.message?.startsWith("errors.")
				? error.message
				: null;
			toast.error(
				errorKey ? t(errorKey) : error.message || t("superadmin.common.error"),
			);
		}
	};

	const isPending = isAddingById || isCreatingClerk;

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{t("superadmin.orgMembers.addMember")}</DialogTitle>
					<DialogDescription>
						{t("superadmin.orgMembers.addMemberDesc")}
					</DialogDescription>
				</DialogHeader>

				<Tabs
					value={activeTab}
					onValueChange={(v) => setActiveTab(v as "existing" | "new")}
				>
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="existing" className="flex items-center gap-2">
							<User className="h-4 w-4" />
							{t("superadmin.orgMembers.tabs.existing")}
						</TabsTrigger>
						<TabsTrigger value="new" className="flex items-center gap-2">
							<UserPlus className="h-4 w-4" />
							{t("superadmin.orgMembers.tabs.new")}
						</TabsTrigger>
					</TabsList>

					<TabsContent value="existing" className="space-y-4 pt-4">
						{/* Search Input */}
						<div className="space-y-2">
							<Label>{t("superadmin.common.search")}</Label>
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

							{!isSearching &&
								(searchResults as SearchResult[]) &&
								(searchResults as SearchResult[]).length > 0 && (
									<div className="max-h-48 overflow-y-auto rounded-md border">
										{(searchResults as SearchResult[]).map((user) => (
											<button
												key={user._id}
												type="button"
												onClick={() => setSelectedUser(user)}
												className={cn(
													"flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted/50 transition-colors",
													selectedUser?._id === user._id && "bg-primary/10",
												)}
											>
												<Avatar className="h-8 w-8">
													<AvatarImage src={user.profileImageUrl} />
													<AvatarFallback className="text-xs">
														{getInitials(
															user.firstName,
															user.lastName,
															user.email,
														)}
													</AvatarFallback>
												</Avatar>
												<div className="flex-1 min-w-0">
													<p className="font-medium text-sm truncate">
														{user.firstName && user.lastName
															? `${user.firstName} ${user.lastName}`
															: user.email}
													</p>
													{user.firstName && user.lastName && (
														<p className="text-xs text-muted-foreground truncate">
															{user.email}
														</p>
													)}
												</div>
												{selectedUser?._id === user._id && (
													<Check className="h-4 w-4 text-primary shrink-0" />
												)}
											</button>
										))}
									</div>
								)}

							{!isSearching &&
								debouncedSearch.length >= 3 &&
								searchResults?.length === 0 && (
									<p className="text-sm text-muted-foreground text-center py-4">
										{t("superadmin.orgMembers.noUsersFound")}
									</p>
								)}

							{!isSearching &&
								debouncedSearch.length > 0 &&
								debouncedSearch.length < 3 &&
								!selectedUser && (
									<p className="text-sm text-muted-foreground text-center py-4">
										Saisissez au moins 3 caractères
									</p>
								)}

							{selectedUser && (
								<div className="flex items-center gap-3 p-3 bg-primary/5 rounded-md border border-primary/20">
									<Avatar className="h-10 w-10">
										<AvatarImage src={selectedUser.profileImageUrl} />
										<AvatarFallback>
											{getInitials(
												selectedUser.firstName,
												selectedUser.lastName,
												selectedUser.email,
											)}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1">
										<p className="font-medium">
											{selectedUser.firstName && selectedUser.lastName
												? `${selectedUser.firstName} ${selectedUser.lastName}`
												: selectedUser.email}
										</p>
										{selectedUser.firstName && selectedUser.lastName && (
											<p className="text-sm text-muted-foreground">
												{selectedUser.email}
											</p>
										)}
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
							<Label>{t("superadmin.users.columns.role")}</Label>
							<Select
								value={role}
								onValueChange={(v) =>
									setRole(v as "admin" | "agent" | "viewer")
								}
							>
								<SelectTrigger>
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
					</TabsContent>

					<TabsContent value="new" className="space-y-4 pt-4">
						<div className="grid gap-4">
							<div className="grid grid-cols-2 gap-3">
								<div className="space-y-2">
									<Label>{t("superadmin.orgMembers.newUser.firstName")}</Label>
									<Input
										placeholder="John"
										value={newUser.firstName}
										onChange={(e) =>
											setNewUser({ ...newUser, firstName: e.target.value })
										}
									/>
								</div>
								<div className="space-y-2">
									<Label>{t("superadmin.orgMembers.newUser.lastName")}</Label>
									<Input
										placeholder="Doe"
										value={newUser.lastName}
										onChange={(e) =>
											setNewUser({ ...newUser, lastName: e.target.value })
										}
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label>{t("superadmin.orgMembers.newUser.email")}</Label>
								<Input
									type="email"
									placeholder="john.doe@example.com"
									value={newUser.email}
									onChange={(e) =>
										setNewUser({ ...newUser, email: e.target.value })
									}
									required
								/>
							</div>

							{/* Role Selector */}
							<div className="space-y-2">
								<Label>{t("superadmin.users.columns.role")}</Label>
								<Select
									value={role}
									onValueChange={(v) =>
										setRole(v as "admin" | "agent" | "viewer")
									}
								>
									<SelectTrigger>
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
					</TabsContent>
				</Tabs>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => handleOpenChange(false)}
					>
						{t("superadmin.common.cancel")}
					</Button>
					<Button
						onClick={
							activeTab === "existing"
								? handleAddExistingUser
								: handleAddNewUser
						}
						disabled={isPending || (activeTab === "existing" && !selectedUser)}
					>
						{isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								{t("superadmin.common.loading")}
							</>
						) : (
							t("superadmin.orgMembers.addMember")
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
