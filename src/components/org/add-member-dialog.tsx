"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

import { useForm } from "@tanstack/react-form";

import { Check, Loader2, Search, User, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	useAuthenticatedConvexQuery,
	useConvexMutationQuery,
} from "@/integrations/convex/hooks";
import { getLocalizedValue } from "@/lib/i18n-utils";
import { cn } from "@/lib/utils";

interface AddMemberDialogProps {
	orgId: Id<"orgs">;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

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

function getInitials(
	firstName?: string,
	lastName?: string,
	email?: string,
): string {
	if (firstName && lastName) {
		return `${firstName[0]}${lastName[0]}`.toUpperCase();
	}
	if (email) {
		return email.slice(0, 2).toUpperCase();
	}
	return "U";
}

interface SearchResult {
	_id: Id<"users">;
	email: string;
	firstName?: string;
	lastName?: string;
	profileImageUrl?: string;
}

// Grade to role mapping
function gradeToRole(grade?: string): "admin" | "agent" | "viewer" {
	switch (grade) {
		case "chief":
		case "counselor":
			return "admin";
		case "agent":
			return "agent";
		case "external":
			return "viewer";
		default:
			return "agent";
	}
}

const GRADE_BADGE: Record<string, { label: string; className: string }> = {
	chief: { label: "Chef", className: "bg-amber-500/15 text-amber-600" },
	counselor: {
		label: "Conseiller",
		className: "bg-blue-500/15 text-blue-600",
	},
	agent: {
		label: "Agent",
		className: "bg-emerald-500/15 text-emerald-600",
	},
	external: {
		label: "Externe",
		className: "bg-zinc-500/15 text-zinc-600",
	},
};

interface VacantPosition {
	_id: Id<"positions">;
	title: Record<string, string>;
	grade?: string;
	level: number;
}

export function AddMemberDialog({
	orgId,
	open,
	onOpenChange,
}: AddMemberDialogProps) {
	const { t, i18n } = useTranslation();
	const lang = i18n.language;
	const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedUser, setSelectedUser] = useState<SearchResult | null>(null);
	const [selectedPositionId, setSelectedPositionId] = useState<string>("");

	const debouncedSearch = useDebounce(searchQuery, 300);
	const shouldSearch = debouncedSearch.length >= 3;

	const { data: searchResults, isPending: isSearching } =
		useAuthenticatedConvexQuery(
			api.functions.users.search,
			shouldSearch ? { query: debouncedSearch, limit: 10 } : "skip",
		);

	// Fetch org chart for vacant positions
	const { data: orgChart } = useAuthenticatedConvexQuery(
		api.functions.orgs.getOrgChart,
		open ? { orgId } : "skip",
	);

	// Extract vacant positions
	const vacantPositions: VacantPosition[] = (orgChart?.positions ?? [])
		.filter(
			(p: {
				occupant: unknown;
				_id: string;
				title: Record<string, string>;
				grade?: string;
				level: number;
			}) => !p.occupant,
		)
		.map(
			(p: {
				_id: string;
				title: Record<string, string>;
				grade?: string;
				level: number;
			}) => ({
				_id: p._id as Id<"positions">,
				title: p.title,
				grade: p.grade,
				level: p.level,
			}),
		)
		.sort((a: VacantPosition, b: VacantPosition) => a.level - b.level);

	const { mutateAsync: addMemberById, isPending: isAddingById } =
		useConvexMutationQuery(api.functions.orgs.addMember);

	const { mutateAsync: createAccount, isPending: isCreating } =
		useConvexMutationQuery(api.functions.orgs.createAccount);

	// Auto-set role when position changes
	const selectedPosition = vacantPositions.find(
		(p) => p._id === selectedPositionId,
	);

	const existingUserForm = useForm({
		defaultValues: {
			role: "agent" as "admin" | "agent" | "viewer",
		},
		onSubmit: async ({ value }) => {
			if (!selectedUser) {
				toast.error(t("dashboard.dialogs.addMember.selectUser"));
				return;
			}

			try {
				const positionId = selectedPositionId
					? (selectedPositionId as Id<"positions">)
					: undefined;
				await addMemberById({
					orgId,
					userId: selectedUser._id,
					role: value.role as "admin" | "agent" | "viewer",
					positionId,
				});
				toast.success(t("dashboard.dialogs.addMember.successExisting"));
				handleOpenChange(false);
			} catch (error: unknown) {
				const msg = error instanceof Error ? error.message : t("common.error");
				toast.error(msg);
			}
		},
	});

	// When position changes, auto-set the role
	useEffect(() => {
		if (selectedPosition) {
			const autoRole = gradeToRole(selectedPosition.grade);
			existingUserForm.setFieldValue("role", autoRole);
		}
	}, [selectedPositionId]);

	const newUserForm = useForm({
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			role: "agent" as "admin" | "agent" | "viewer",
		},
		onSubmit: async ({ value }) => {
			if (!value.email.trim()) {
				toast.error(t("dashboard.dialogs.addMember.emailRequired"));
				return;
			}

			try {
				const { userId } = await createAccount({
					orgId,
					email: value.email.trim(),
					firstName: value.firstName,
					lastName: value.lastName,
				});

				const positionId = selectedPositionId
					? (selectedPositionId as Id<"positions">)
					: undefined;
				await addMemberById({
					orgId,
					userId: userId as Id<"users">,
					role: value.role as "admin" | "agent" | "viewer",
					positionId,
				});

				toast.success(t("dashboard.dialogs.addMember.successNew"));
				handleOpenChange(false);
			} catch (error: unknown) {
				console.error(error);
				const msg = error instanceof Error ? error.message : t("common.error");
				toast.error(msg);
			}
		},
	});

	// Reset state when dialog closes
	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			setSearchQuery("");
			setSelectedUser(null);
			setSelectedPositionId("");
			setActiveTab("existing");
			existingUserForm.reset();
			newUserForm.reset();
		}
		onOpenChange(newOpen);
	};

	const isPending = isAddingById || isCreating;

	// Position selector shared between both tabs
	const PositionSelector = () => (
		<Field>
			<FieldLabel>
				Poste{" "}
				<span className="text-muted-foreground font-normal">(optionnel)</span>
			</FieldLabel>
			<Select value={selectedPositionId} onValueChange={setSelectedPositionId}>
				<SelectTrigger>
					<SelectValue placeholder="Assigner à un poste..." />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="none">Aucun poste</SelectItem>
					{vacantPositions.map((pos) => (
						<SelectItem key={pos._id} value={pos._id}>
							<div className="flex items-center gap-2">
								<span>{getLocalizedValue(pos.title, lang)}</span>
								{pos.grade && GRADE_BADGE[pos.grade] && (
									<Badge
										variant="secondary"
										className={`text-[10px] px-1 py-0 ${GRADE_BADGE[pos.grade].className}`}
									>
										{GRADE_BADGE[pos.grade].label}
									</Badge>
								)}
							</div>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{selectedPosition && (
				<p className="text-xs text-muted-foreground mt-1">
					Rôle auto-assigné :{" "}
					<strong>{gradeToRole(selectedPosition.grade)}</strong> (basé sur le
					grade)
				</p>
			)}
		</Field>
	);

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{t("dashboard.dialogs.addMember.title")}</DialogTitle>
					<DialogDescription>
						{t("dashboard.dialogs.addMember.description")}
					</DialogDescription>
				</DialogHeader>

				<Tabs
					value={activeTab}
					onValueChange={(v) => setActiveTab(v as "existing" | "new")}
				>
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

					<TabsContent value="existing">
						<form
							id="existing-user-form"
							onSubmit={(e) => {
								e.preventDefault();
								existingUserForm.handleSubmit();
							}}
						>
							<FieldGroup>
								{/* Search */}
								<div className="space-y-2">
									<FieldLabel>
										{t("dashboard.dialogs.addMember.searchByEmail")}
									</FieldLabel>
									<div className="relative">
										<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
										<Input
											type="email"
											placeholder={t(
												"dashboard.dialogs.addMember.emailPlaceholder",
											)}
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											className="pl-10"
										/>
									</div>
								</div>

								{/* Results */}
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
												{t("dashboard.dialogs.addMember.noUserFound")}
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
										</div>
									)}
								</div>

								{/* Position selector */}
								{vacantPositions.length > 0 && <PositionSelector />}

								{/* Role */}
								<existingUserForm.Field
									name="role"
									children={(field) => (
										<Field>
											<FieldLabel>
												{t("dashboard.dialogs.addMember.roleLabel")}
											</FieldLabel>
											<Select
												value={field.state.value}
												onValueChange={(value) =>
													field.handleChange(
														value as "admin" | "agent" | "viewer",
													)
												}
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

							<div className="flex justify-end gap-2 mt-6">
								<Button
									variant="outline"
									type="button"
									onClick={() => handleOpenChange(false)}
								>
									{t("dashboard.dialogs.addMember.cancel")}
								</Button>
								<Button type="submit" disabled={isPending || !selectedUser}>
									{isPending ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										t("dashboard.dialogs.addMember.add")
									)}
								</Button>
							</div>
						</form>
					</TabsContent>

					<TabsContent value="new">
						<form
							id="new-user-form"
							onSubmit={(e) => {
								e.preventDefault();
								newUserForm.handleSubmit();
							}}
						>
							<FieldGroup>
								<newUserForm.Field
									name="firstName"
									children={(field) => (
										<Field>
											<FieldLabel htmlFor={field.name}>
												{t("dashboard.dialogs.addMember.firstName")}
											</FieldLabel>
											<Input
												id={field.name}
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
											/>
										</Field>
									)}
								/>

								<newUserForm.Field
									name="lastName"
									children={(field) => (
										<Field>
											<FieldLabel htmlFor={field.name}>
												{t("dashboard.dialogs.addMember.lastName")}
											</FieldLabel>
											<Input
												id={field.name}
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
											/>
										</Field>
									)}
								/>

								<newUserForm.Field
									name="email"
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>
													{t("dashboard.dialogs.addMember.emailLabel")}
												</FieldLabel>
												<Input
													id={field.name}
													type="email"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													required
												/>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>

								{/* Position selector */}
								{vacantPositions.length > 0 && <PositionSelector />}

								{/* Role */}
								<newUserForm.Field
									name="role"
									children={(field) => (
										<Field>
											<FieldLabel>
												{t("dashboard.dialogs.addMember.roleLabel")}
											</FieldLabel>
											<Select
												value={field.state.value}
												onValueChange={(value) =>
													field.handleChange(
														value as "admin" | "agent" | "viewer",
													)
												}
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

							<div className="flex justify-end gap-2 mt-6">
								<Button
									variant="outline"
									type="button"
									onClick={() => handleOpenChange(false)}
								>
									{t("dashboard.dialogs.addMember.cancel")}
								</Button>
								<Button type="submit" disabled={isPending}>
									{isPending ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										t("dashboard.dialogs.addMember.add")
									)}
								</Button>
							</div>
						</form>
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
