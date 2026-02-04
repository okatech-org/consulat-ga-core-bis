import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { createFileRoute } from "@tanstack/react-router";
import {
	Building2,
	MoreHorizontal,
	Shield,
	User,
	UserPlus,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AddMemberDialog } from "@/components/org/add-member-dialog";
import { MemberRoleDialog } from "@/components/org/member-role-dialog";
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
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	useAuthenticatedConvexQuery,
	useConvexMutationQuery,
} from "@/integrations/convex/hooks";

export const Route = createFileRoute("/admin/team/")({
	component: DashboardTeam,
});

function DashboardTeam() {
	const { activeOrgId } = useOrg();
	const { t } = useTranslation();
	const [addDialogOpen, setAddDialogOpen] = useState(false);
	const [roleDialogOpen, setRoleDialogOpen] = useState(false);
	const [selectedMember, setSelectedMember] = useState<any>(null);

	const { data: members } = useAuthenticatedConvexQuery(
		api.functions.orgs.getMembers,
		activeOrgId ? { orgId: activeOrgId } : "skip",
	);

	const { mutateAsync: removeMember } = useConvexMutationQuery(
		api.functions.orgs.removeMember,
	);

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

	const openRoleDialog = (member: any) => {
		setSelectedMember(member);
		setRoleDialogOpen(true);
	};

	if (!members) {
		return (
			<div className="p-4 space-y-4">
				<Skeleton className="h-8 w-64" />
				<Skeleton className="h-[400px] w-full" />
			</div>
		);
	}

	return (
		<div className="flex flex-1 flex-col gap-4 p-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						{t("dashboard.team.title")}
					</h1>
					<p className="text-muted-foreground">
						{t("dashboard.team.description")}
					</p>
				</div>
				<Button onClick={() => setAddDialogOpen(true)}>
					<UserPlus className="mr-2 h-4 w-4" />
					{t("dashboard.team.addMember")}
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Building2 className="h-5 w-5" />
						{t("dashboard.team.cardTitle")}
					</CardTitle>
					<CardDescription>
						{t("dashboard.team.cardDescription")}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>{t("dashboard.team.columns.user")}</TableHead>
								<TableHead>{t("dashboard.team.columns.role")}</TableHead>
								<TableHead>{t("dashboard.team.columns.joinedAt")}</TableHead>
								<TableHead className="text-right">
									{t("dashboard.team.columns.actions")}
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{members.map((member) => (
								<TableRow key={member._id}>
									<TableCell className="font-medium">
										<div className="flex items-center gap-3">
											<Avatar className="h-8 w-8">
												<AvatarImage src={member.avatarUrl} />
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
											variant={
												member.role === "admin" ? "default" : "secondary"
											}
										>
											{member.role === "admin" && (
												<Shield className="mr-1 h-3 w-3" />
											)}
											{member.role === "agent" && (
												<User className="mr-1 h-3 w-3" />
											)}
											{member.role === "viewer" && (
												<User className="mr-1 h-3 w-3" />
											)}
											{t(`dashboard.team.roles.${member.role}`)}
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
												<DropdownMenuLabel>
													{t("dashboard.team.columns.actions")}
												</DropdownMenuLabel>
												<DropdownMenuItem
													onClick={() => openRoleDialog(member)}
												>
													{t("dashboard.team.actions.changeRole")}
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													className="text-destructive focus:text-destructive"
													onClick={() => handleRemove(member._id)}
												>
													<XCircle className="mr-2 h-4 w-4" />
													{t("dashboard.team.actions.remove")}
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
	);
}
