import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { POSITION_GRADES, type PositionGrade } from "@convex/lib/roles";
import { createFileRoute } from "@tanstack/react-router";
import {
	Building2,
	ChevronDown,
	ChevronRight,
	CircleDot,
	MoreHorizontal,
	Network,
	Shield,
	ShieldCheck,
	User,
	UserCheck,
	UserMinus,
	UserPlus,
	Users,
	XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AddMemberDialog } from "@/components/org/add-member-dialog";
import { MemberPermissionsDialog } from "@/components/org/member-permissions-dialog";
import { useOrg } from "@/components/org/org-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	useAuthenticatedConvexQuery,
	useConvexMutationQuery,
} from "@/integrations/convex/hooks";
import { getLocalizedValue } from "@/lib/i18n-utils";
import { DynamicLucideIcon } from "@/lib/lucide-icon";

export const Route = createFileRoute("/admin/team/")({
	component: DashboardTeam,
});

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

type OrgChartPosition = {
	_id: Id<"positions">;
	code: string;
	title: Record<string, string>;
	description?: Record<string, string>;
	level: number;
	grade?: string;
	isRequired?: boolean;
	tasks?: string[];
	occupant: {
		userId: Id<"users">;
		name: string;
		firstName?: string;
		lastName?: string;
		email: string;
		avatarUrl?: string;
		membershipId: Id<"memberships">;
	} | null;
};

type UnassignedMember = {
	userId: Id<"users">;
	name: string;
	firstName?: string;
	lastName?: string;
	email: string;
	avatarUrl?: string;
	membershipId: Id<"memberships">;
};

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════

function DashboardTeam() {
	const { activeOrgId } = useOrg();
	const { t, i18n } = useTranslation();
	const lang = i18n.language?.startsWith("fr") ? "fr" : "en";

	const [addDialogOpen, setAddDialogOpen] = useState(false);
	const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
	const [selectedMember, setSelectedMember] = useState<UnassignedMember | null>(
		null,
	);
	const [assignDialogOpen, setAssignDialogOpen] = useState(false);
	const [assignTarget, setAssignTarget] = useState<{
		positionId: Id<"positions">;
		positionTitle: string;
	} | null>(null);
	const [collapsedGrades, setCollapsedGrades] = useState<Set<string>>(
		new Set(),
	);

	const { data: orgChart, isPending } = useAuthenticatedConvexQuery(
		api.functions.orgs.getOrgChart,
		activeOrgId ? { orgId: activeOrgId } : "skip",
	);

	const { mutateAsync: removeMember } = useConvexMutationQuery(
		api.functions.orgs.removeMember,
	);
	const { mutateAsync: assignPosition } = useConvexMutationQuery(
		api.functions.orgs.assignMemberPosition,
	);

	// Group positions by grade
	const positionsByGrade = useMemo(() => {
		if (!orgChart) return {};
		return orgChart.positions.reduce<Record<string, OrgChartPosition[]>>(
			(acc, pos) => {
				const grade = pos.grade || "agent";
				if (!acc[grade]) acc[grade] = [];
				acc[grade].push(pos as OrgChartPosition);
				return acc;
			},
			{},
		);
	}, [orgChart]);

	const handleRemove = async (userId?: Id<"users">) => {
		if (!activeOrgId || !userId || !confirm(t("dashboard.team.confirmRemove")))
			return;
		try {
			await removeMember({ orgId: activeOrgId, userId });
			toast.success(t("dashboard.team.memberRemoved"));
		} catch {
			toast.error(t("dashboard.team.removeError"));
		}
	};

	const handleAssignToPosition = async (
		membershipId: Id<"memberships">,
		positionId: Id<"positions">,
	) => {
		if (!activeOrgId) return;
		try {
			await assignPosition({
				orgId: activeOrgId,
				membershipId,
				positionId,
			});
			toast.success(t("dashboard.team.positionAssigned"));
			setAssignDialogOpen(false);
			setAssignTarget(null);
		} catch {
			toast.error(t("dashboard.team.assignError"));
		}
	};

	const handleUnassignPosition = async (membershipId: Id<"memberships">) => {
		if (!activeOrgId) return;
		try {
			await assignPosition({
				orgId: activeOrgId,
				membershipId,
				positionId: undefined,
			});
			toast.success(t("dashboard.team.positionUnassigned"));
		} catch {
			toast.error(t("dashboard.team.assignError"));
		}
	};

	const toggleGrade = (grade: string) => {
		setCollapsedGrades((prev) => {
			const next = new Set(prev);
			if (next.has(grade)) next.delete(grade);
			else next.add(grade);
			return next;
		});
	};

	if (isPending) {
		return (
			<div className="p-6 space-y-6">
				<Skeleton className="h-10 w-64" />
				<div className="grid gap-3 sm:grid-cols-3">
					<Skeleton className="h-24" />
					<Skeleton className="h-24" />
					<Skeleton className="h-24" />
				</div>
				<Skeleton className="h-[400px]" />
			</div>
		);
	}

	if (!orgChart) return null;

	const gradeOrder: PositionGrade[] = [
		"chief",
		"counselor",
		"agent",
		"external",
	];

	return (
		<div className="flex flex-1 flex-col gap-6 p-6">
			{/* ─── Header ──────────────────────────────── */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
						<Network className="h-6 w-6 text-primary" />
						{t("dashboard.team.title")}
					</h1>
					<p className="text-muted-foreground text-sm mt-1">
						{t("dashboard.team.description")}
					</p>
				</div>
				<Button onClick={() => setAddDialogOpen(true)} className="gap-2">
					<UserPlus className="h-4 w-4" />
					{t("dashboard.team.addMember")}
				</Button>
			</div>

			{/* ─── Stats ──────────────────────────────── */}
			<div className="grid gap-3 sm:grid-cols-3">
				<Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
					<CardContent className="p-4 flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
							<Users className="h-5 w-5 text-primary" />
						</div>
						<div>
							<p className="text-2xl font-bold">{orgChart.totalPositions}</p>
							<p className="text-xs text-muted-foreground">
								{t("dashboard.team.stats.positions")}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
					<CardContent className="p-4 flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/15">
							<UserCheck className="h-5 w-5 text-green-600" />
						</div>
						<div>
							<p className="text-2xl font-bold">{orgChart.filledPositions}</p>
							<p className="text-xs text-muted-foreground">
								{t("dashboard.team.stats.filled")}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
					<CardContent className="p-4 flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/15">
							<CircleDot className="h-5 w-5 text-amber-600" />
						</div>
						<div>
							<p className="text-2xl font-bold">{orgChart.vacantPositions}</p>
							<p className="text-xs text-muted-foreground">
								{t("dashboard.team.stats.vacant")}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* ─── Org Chart ──────────────────────────────── */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-base">
						<Building2 className="h-4 w-4" />
						{t("dashboard.team.cardTitle")}
					</CardTitle>
					<CardDescription>
						{t(
							"dashboard.team.orgChartDesc",
							"Postes et membres organisés par grade hiérarchique",
						)}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{gradeOrder.map((gradeKey) => {
						const grade = POSITION_GRADES[gradeKey];
						const gradePositions = positionsByGrade[gradeKey] ?? [];
						const isCollapsed = collapsedGrades.has(gradeKey);
						const filledCount = gradePositions.filter((p) => p.occupant).length;

						return (
							<div key={gradeKey}>
								{/* Grade header */}
								<button
									type="button"
									className={`w-full flex items-center gap-2.5 py-2 px-3 rounded-lg transition-colors ${grade.bgColor} hover:opacity-90`}
									onClick={() => toggleGrade(gradeKey)}
								>
									{isCollapsed ? (
										<ChevronRight className={`h-4 w-4 ${grade.color}`} />
									) : (
										<ChevronDown className={`h-4 w-4 ${grade.color}`} />
									)}
									<DynamicLucideIcon
										name={grade.icon}
										className={`h-4 w-4 ${grade.color}`}
									/>
									<span
										className={`text-xs font-semibold uppercase tracking-wider ${grade.color}`}
									>
										{getLocalizedValue(grade.label, lang)}
									</span>
									<Badge
										variant="outline"
										className={`text-[10px] px-1.5 py-0 ml-auto ${grade.borderColor}`}
									>
										{filledCount}/{gradePositions.length}
									</Badge>
								</button>

								{/* Position cards */}
								{!isCollapsed && (
									<div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 pl-2">
										{gradePositions.length === 0 && (
											<div className="col-span-full py-6 text-center text-sm text-muted-foreground border border-dashed rounded-lg">
												{t(
													"dashboard.team.noPositions",
													"Aucun poste dans ce grade",
												)}
											</div>
										)}
										{gradePositions.map((pos: OrgChartPosition) => (
											<PositionCard
												key={pos._id}
												position={pos}
												lang={lang}
												onAssign={() => {
													setAssignTarget({
														positionId: pos._id,
														positionTitle: getLocalizedValue(pos.title, lang),
													});
													setAssignDialogOpen(true);
												}}
												onUnassign={() => {
													if (pos.occupant) {
														handleUnassignPosition(pos.occupant.membershipId);
													}
												}}
												onViewPermissions={(member) => {
													setSelectedMember(member);
													setPermissionsDialogOpen(true);
												}}
												onChangeRole={(member) => {
													setSelectedMember(member);
													setRoleDialogOpen(true);
												}}
												onRemove={(userId) => handleRemove(userId)}
											/>
										))}
									</div>
								)}
							</div>
						);
					})}
				</CardContent>
			</Card>

			{/* ─── Unassigned Members ──────────────────────────────── */}
			{orgChart.unassignedMembers.length > 0 && (
				<Card className="border-amber-200 dark:border-amber-800/50">
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 text-base text-amber-700 dark:text-amber-400">
							<Users className="h-4 w-4" />
							{t("dashboard.team.unassigned.title")}
							<Badge variant="outline" className="ml-auto text-[10px]">
								{orgChart.unassignedMembers.length}
							</Badge>
						</CardTitle>
						<CardDescription>
							{t(
								"dashboard.team.unassigned.desc",
								"Ces membres n'ont pas encore de poste assigné",
							)}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
							{orgChart.unassignedMembers.map((member: UnassignedMember) => (
								<div
									key={member.membershipId}
									className="flex items-center gap-3 p-3 rounded-lg border border-dashed hover:border-primary/30 transition-colors group"
								>
									<Avatar className="h-9 w-9">
										<AvatarImage src={member.avatarUrl} />
										<AvatarFallback className="text-xs">
											{member.firstName?.[0]}
											{member.lastName?.[0]}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium truncate">
											{member.firstName} {member.lastName}
										</p>
										<p className="text-xs text-muted-foreground truncate">
											{member.email}
										</p>
									</div>
									<Badge variant="secondary" className="text-[10px] shrink-0">
										{member.role === "admin" && (
											<Shield className="mr-1 h-3 w-3" />
										)}
										{member.role}
									</Badge>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
											>
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuLabel>
												{t("dashboard.team.columns.actions")}
											</DropdownMenuLabel>
											<DropdownMenuItem
												onClick={() => {
													setSelectedMember(member);
													setRoleDialogOpen(true);
												}}
											>
												{t("dashboard.team.actions.changeRole")}
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => {
													setSelectedMember(member);
													setPermissionsDialogOpen(true);
												}}
											>
												<ShieldCheck className="mr-2 h-4 w-4" />
												{t("dashboard.team.actions.permissions")}
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												className="text-destructive focus:text-destructive"
												onClick={() => handleRemove(member.userId)}
											>
												<XCircle className="mr-2 h-4 w-4" />
												{t("dashboard.team.actions.remove")}
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* ─── Dialogs ──────────────────────────────── */}
			{activeOrgId && (
				<>
					<AddMemberDialog
						open={addDialogOpen}
						onOpenChange={setAddDialogOpen}
						orgId={activeOrgId}
					/>

					{selectedMember && (
						<MemberPermissionsDialog
							open={permissionsDialogOpen}
							onOpenChange={setPermissionsDialogOpen}
							orgId={activeOrgId}
							membershipId={selectedMember.membershipId}
							memberName={`${selectedMember.firstName} ${selectedMember.lastName}`}
							memberRole={selectedMember.role}
						/>
					)}

					{/* Assign member to position dialog */}
					<AssignMemberDialog
						open={assignDialogOpen}
						onOpenChange={setAssignDialogOpen}
						positionTitle={assignTarget?.positionTitle ?? ""}
						unassignedMembers={orgChart?.unassignedMembers ?? []}
						allMembers={[
							...(orgChart?.positions
								.filter((p) => p.occupant)
								.map((p) => p.occupant!) ?? []),
							...(orgChart?.unassignedMembers ?? []),
						]}
						onAssign={(membershipId) => {
							if (assignTarget) {
								handleAssignToPosition(membershipId, assignTarget.positionId);
							}
						}}
					/>
				</>
			)}
		</div>
	);
}

// ═══════════════════════════════════════════════════════════════
// Position Card
// ═══════════════════════════════════════════════════════════════

function PositionCard({
	position,
	lang,
	onAssign,
	onUnassign,
	onViewPermissions,
	onChangeRole,
	onRemove,
}: {
	position: OrgChartPosition;
	lang: string;
	onAssign: () => void;
	onUnassign: () => void;
	onViewPermissions: (member: UnassignedMember) => void;
	onChangeRole: (member: UnassignedMember) => void;
	onRemove: (userId: Id<"users">) => void;
}) {
	const { t } = useTranslation();
	const grade =
		position.grade && POSITION_GRADES[position.grade as PositionGrade];
	const isVacant = !position.occupant;

	return (
		<div
			className={`rounded-xl border transition-all ${
				isVacant
					? "border-dashed border-muted-foreground/30 bg-muted/30 hover:border-primary/40"
					: "border-border bg-card hover:shadow-md hover:border-primary/30"
			}`}
		>
			{/* Position header */}
			<div className="px-3.5 pt-3 pb-2">
				<div className="flex items-start justify-between gap-2">
					<div className="min-w-0">
						<p className="text-sm font-semibold leading-tight truncate">
							{getLocalizedValue(position.title, lang)}
						</p>
						{position.description && (
							<p className="text-[11px] text-muted-foreground mt-0.5 truncate">
								{getLocalizedValue(position.description, lang)}
							</p>
						)}
					</div>
					{position.isRequired && (
						<Badge
							variant="destructive"
							className="text-[9px] h-4 px-1 shrink-0"
						>
							{t("admin.roles.required")}
						</Badge>
					)}
				</div>
				{grade && (
					<Badge
						variant="outline"
						className={`text-[9px] px-1.5 py-0 mt-1.5 flex items-center gap-1 w-fit ${grade.color} ${grade.borderColor}`}
					>
						<DynamicLucideIcon name={grade.icon} className="h-2.5 w-2.5" />
						{getLocalizedValue(grade.label, lang)}
					</Badge>
				)}
			</div>

			{/* Divider */}
			<div className="border-t mx-3" />

			{/* Occupant */}
			<div className="px-3.5 py-2.5">
				{position.occupant ? (
					<div className="flex items-center gap-2.5 group">
						<Avatar className="h-8 w-8 ring-2 ring-green-400/30">
							<AvatarImage src={position.occupant.avatarUrl} />
							<AvatarFallback className="text-[10px] bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
								{position.occupant.firstName?.[0]}
								{position.occupant.lastName?.[0]}
							</AvatarFallback>
						</Avatar>
						<div className="flex-1 min-w-0">
							<p className="text-xs font-medium truncate">
								{position.occupant.firstName} {position.occupant.lastName}
							</p>
							<p className="text-[10px] text-muted-foreground truncate">
								{position.occupant.email}
							</p>
						</div>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
								>
									<MoreHorizontal className="h-3.5 w-3.5" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuLabel>
									{position.occupant.firstName} {position.occupant.lastName}
								</DropdownMenuLabel>
								<DropdownMenuItem
									onClick={() =>
										onChangeRole({
											userId: position.occupant!.userId,
											name: position.occupant!.name,
											firstName: position.occupant!.firstName,
											lastName: position.occupant!.lastName,
											email: position.occupant!.email,
											avatarUrl: position.occupant!.avatarUrl,
											membershipId: position.occupant!.membershipId,
											role: position.occupant!.role,
										})
									}
								>
									<Shield className="mr-2 h-3.5 w-3.5" />
									{t("dashboard.team.actions.changeRole")}
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										onViewPermissions({
											userId: position.occupant!.userId,
											name: position.occupant!.name,
											firstName: position.occupant!.firstName,
											lastName: position.occupant!.lastName,
											email: position.occupant!.email,
											avatarUrl: position.occupant!.avatarUrl,
											membershipId: position.occupant!.membershipId,
											role: position.occupant!.role,
										})
									}
								>
									<ShieldCheck className="mr-2 h-3.5 w-3.5" />
									{t("dashboard.team.actions.permissions")}
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={onUnassign}>
									<UserMinus className="mr-2 h-3.5 w-3.5" />
									{t("dashboard.team.actions.unassign")}
								</DropdownMenuItem>
								<DropdownMenuItem
									className="text-destructive focus:text-destructive"
									onClick={() => onRemove(position.occupant!.userId)}
								>
									<XCircle className="mr-2 h-3.5 w-3.5" />
									{t("dashboard.team.actions.remove")}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				) : (
					<button
						type="button"
						className="w-full flex items-center gap-2.5 py-1 cursor-pointer group"
						onClick={onAssign}
					>
						<div className="h-8 w-8 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center group-hover:border-primary/50 transition-colors">
							<User className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary/70" />
						</div>
						<span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
							{t("dashboard.team.assignMember")}
						</span>
					</button>
				)}
			</div>
		</div>
	);
}

// ═══════════════════════════════════════════════════════════════
// Assign Member Dialog
// ═══════════════════════════════════════════════════════════════

function AssignMemberDialog({
	open,
	onOpenChange,
	positionTitle,
	unassignedMembers,
	allMembers,
	onAssign,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	positionTitle: string;
	unassignedMembers: UnassignedMember[];
	allMembers: UnassignedMember[];
	onAssign: (membershipId: Id<"memberships">) => void;
}) {
	const { t } = useTranslation();
	const [selectedId, setSelectedId] = useState<string>("");

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<UserPlus className="h-5 w-5 text-primary" />
						{t("dashboard.team.assignDialog.title")}
					</DialogTitle>
					<DialogDescription>
						{t(
							"dashboard.team.assignDialog.desc",
							"Choisissez un membre pour le poste de",
						)}{" "}
						<strong>{positionTitle}</strong>
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-2">
					<Select value={selectedId} onValueChange={setSelectedId}>
						<SelectTrigger>
							<SelectValue
								placeholder={t(
									"dashboard.team.assignDialog.placeholder",
									"Sélectionner un membre...",
								)}
							/>
						</SelectTrigger>
						<SelectContent>
							{unassignedMembers.length > 0 && (
								<>
									<SelectItem disabled value="__unassigned_header__">
										<span className="text-xs font-semibold text-muted-foreground">
											{t(
												"dashboard.team.assignDialog.unassigned",
												"— Sans poste —",
											)}
										</span>
									</SelectItem>
									{unassignedMembers.map((m) => (
										<SelectItem key={m.membershipId} value={m.membershipId}>
											<div className="flex items-center gap-2">
												<span>
													{m.firstName} {m.lastName}
												</span>
												<span className="text-muted-foreground text-xs">
													· {m.role}
												</span>
											</div>
										</SelectItem>
									))}
								</>
							)}
							{allMembers.length > unassignedMembers.length && (
								<>
									<SelectItem disabled value="__all_header__">
										<span className="text-xs font-semibold text-muted-foreground">
											{t(
												"dashboard.team.assignDialog.reassign",
												"— Réassigner depuis un autre poste —",
											)}
										</span>
									</SelectItem>
									{allMembers
										.filter(
											(m) =>
												!unassignedMembers.some(
													(u) => u.membershipId === m.membershipId,
												),
										)
										.map((m) => (
											<SelectItem key={m.membershipId} value={m.membershipId}>
												<div className="flex items-center gap-2">
													<span>
														{m.firstName} {m.lastName}
													</span>
													<span className="text-muted-foreground text-xs">
														· {m.role}
													</span>
												</div>
											</SelectItem>
										))}
								</>
							)}
						</SelectContent>
					</Select>
					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={() => onOpenChange(false)}>
							{t("common.cancel")}
						</Button>
						<Button
							disabled={!selectedId || selectedId.startsWith("__")}
							onClick={() => onAssign(selectedId as Id<"memberships">)}
						>
							{t("dashboard.team.assignDialog.assign")}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
