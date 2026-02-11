import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { type RegistrationStatus } from "@convex/lib/constants";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	BadgeCheck,
	CheckCircle2,
	Clock,
	CreditCard,
	ExternalLink,
	FileText,
	Loader2,
	Printer,
	Search,
	User,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "sonner";
import { UserProfileCard } from "@/components/dashboard/UserProfileCard";
import { useOrg } from "@/components/org/org-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge as UIBadge } from "@/components/ui/badge";
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
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import {
	useConvexMutationQuery,
	usePaginatedConvexQuery,
} from "@/integrations/convex/hooks";

export const Route = createFileRoute("/admin/consular-registry/")({
	component: ConsularRegistryPage,
});

type StatusFilter = "all" | RegistrationStatus;

function ConsularRegistryPage() {
	const { t, i18n } = useTranslation();
	const { activeOrgId } = useOrg();
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [selectedRegistration, setSelectedRegistration] = useState<{
		_id: Id<"consularRegistrations">;
		requestId: Id<"requests">;
		profile?: { identity?: { firstName?: string; lastName?: string } } | null;
		user?: { _id: Id<"users"> } | null;
		cardNumber?: string;
	} | null>(null);
	const [showCardDialog, setShowCardDialog] = useState(false);
	const [showPrintDialog, setShowPrintDialog] = useState(false);
	const [showProfileDialog, setShowProfileDialog] = useState(false);

	const debouncedSearch = useDebounce(searchQuery, 300);

	// Query registrations for this org (paginated)
	const {
		results: registrations,
		status: paginationStatus,
		loadMore,
		isLoading,
	} = usePaginatedConvexQuery(
		api.functions.consularRegistrations.listByOrg,
		activeOrgId
			? {
					orgId: activeOrgId,
					status: statusFilter === "all" ? undefined : statusFilter,
				}
			: "skip",
		{ initialNumItems: 25 },
	);

	// Mutations
	const { mutateAsync: generateCard } = useConvexMutationQuery(
		api.functions.consularRegistrations.generateCard,
	);
	const { mutateAsync: markAsPrinted } = useConvexMutationQuery(
		api.functions.consularRegistrations.markAsPrinted,
	);

	// Filter registrations by search
	const filteredRegistrations = registrations?.filter((reg: any) => {
		if (!debouncedSearch) return true;
		const search = debouncedSearch.toLowerCase();
		const fullName =
			`${reg.profile?.identity?.firstName ?? ""} ${reg.profile?.identity?.lastName ?? ""}`.toLowerCase();
		return (
			fullName.includes(search) ||
			reg.cardNumber?.toLowerCase().includes(search)
		);
	});

	const handleGenerateCard = async (
		registrationId: Id<"consularRegistrations">,
	) => {
		try {
			const result = await generateCard({ registrationId });
			if (result.success) {
				toast.success(t("dashboard.consularRegistry.cardDialog.success"), {
					description: t(
						"dashboard.consularRegistry.cardDialog.successDescription",
						{ cardNumber: result.cardNumber },
					),
				});
			} else {
				toast.error(t("dashboard.consularRegistry.cardDialog.error"), {
					description: result.message,
				});
			}
			setShowCardDialog(false);
		} catch {
			toast.error(t("dashboard.consularRegistry.cardDialog.errorGeneric"));
		}
	};

	const handleMarkAsPrinted = async (
		registrationId: Id<"consularRegistrations">,
	) => {
		try {
			await markAsPrinted({ registrationId });
			toast.success(t("dashboard.consularRegistry.printDialog.success"));
			setShowPrintDialog(false);
		} catch {
			toast.error(t("dashboard.consularRegistry.printDialog.error"));
		}
	};

	const getStatusBadge = (status: string, hasCard: boolean) => {
		if (status === "active" && hasCard) {
			return (
				<UIBadge variant="default" className="bg-green-600">
					<BadgeCheck className="mr-1 h-3 w-3" />
					{t("dashboard.consularRegistry.badges.cardGenerated")}
				</UIBadge>
			);
		}
		switch (status) {
			case "requested":
				return (
					<UIBadge variant="secondary">
						<Clock className="mr-1 h-3 w-3" />
						{t("dashboard.consularRegistry.badges.requested")}
					</UIBadge>
				);
			case "active":
				return (
					<UIBadge
						variant="outline"
						className="border-amber-500 text-amber-600"
					>
						<CheckCircle2 className="mr-1 h-3 w-3" />
						{t("dashboard.consularRegistry.badges.activeNoCard")}
					</UIBadge>
				);
			case "expired":
				return (
					<UIBadge variant="destructive">
						<XCircle className="mr-1 h-3 w-3" />
						{t("dashboard.consularRegistry.badges.expired")}
					</UIBadge>
				);
			default:
				return <UIBadge variant="outline">{status}</UIBadge>;
		}
	};

	// Stats
	const stats = {
		total: registrations?.length ?? 0,
		requested:
			registrations?.filter((r) => r.status === "requested").length ?? 0,
		active: registrations?.filter((r) => r.status === "active").length ?? 0,
		withCard: registrations?.filter((r) => r.cardNumber).length ?? 0,
	};

	const selectedName =
		`${selectedRegistration?.profile?.identity?.firstName ?? ""} ${selectedRegistration?.profile?.identity?.lastName ?? ""}`.trim();

	return (
		<div className="flex flex-1 flex-col gap-4 p-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						{t("dashboard.consularRegistry.title")}
					</h1>
					<p className="text-muted-foreground">
						{t("dashboard.consularRegistry.description")}
					</p>
				</div>
				<Button asChild>
					<Link to="/admin/consular-registry/print-queue">
						<Printer className="h-4 w-4 mr-2" />
						{t("dashboard.consularRegistry.printQueue")}
					</Link>
				</Button>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							{t("dashboard.consularRegistry.stats.total")}
						</CardTitle>
						<User className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.total}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							{t("dashboard.consularRegistry.stats.requested")}
						</CardTitle>
						<Clock className="h-4 w-4 text-amber-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.requested}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							{t("dashboard.consularRegistry.stats.active")}
						</CardTitle>
						<CheckCircle2 className="h-4 w-4 text-green-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.active}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							{t("dashboard.consularRegistry.stats.withCard")}
						</CardTitle>
						<CreditCard className="h-4 w-4 text-blue-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.withCard}</div>
					</CardContent>
				</Card>
			</div>

			{/* Main Table */}
			<Card>
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<CardTitle className="flex items-center gap-2">
								<FileText className="h-5 w-5" />
								{t("dashboard.consularRegistry.table.title")}
							</CardTitle>
							<CardDescription>
								{t("dashboard.consularRegistry.table.description")}
							</CardDescription>
						</div>
						<div className="flex gap-2">
							<div className="relative w-64">
								<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder={t(
										"dashboard.consularRegistry.table.searchPlaceholder",
									)}
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-8"
								/>
							</div>
							<Select
								value={statusFilter}
								onValueChange={(v) => setStatusFilter(v as RegistrationStatus)}
							>
								<SelectTrigger className="w-40">
									<SelectValue
										placeholder={t(
											"dashboard.consularRegistry.table.statusPlaceholder",
										)}
									/>
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">
										{t("dashboard.consularRegistry.statuses.all")}
									</SelectItem>
									<SelectItem value="requested">
										{t("dashboard.consularRegistry.statuses.requested")}
									</SelectItem>
									<SelectItem value="active">
										{t("dashboard.consularRegistry.statuses.active")}
									</SelectItem>
									<SelectItem value="expired">
										{t("dashboard.consularRegistry.statuses.expired")}
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>
									{t("dashboard.consularRegistry.table.columns.citizen")}
								</TableHead>
								<TableHead>
									{t("dashboard.consularRegistry.table.columns.type")}
								</TableHead>
								<TableHead>
									{t("dashboard.consularRegistry.table.columns.duration")}
								</TableHead>
								<TableHead>
									{t("dashboard.consularRegistry.table.columns.status")}
								</TableHead>
								<TableHead>
									{t("dashboard.consularRegistry.table.columns.cardNumber")}
								</TableHead>
								<TableHead>
									{t(
										"dashboard.consularRegistry.table.columns.registrationDate",
									)}
								</TableHead>
								<TableHead className="text-right">
									{t("dashboard.consularRegistry.table.columns.actions")}
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading && registrations.length === 0 ? (
								<TableRow>
									<TableCell colSpan={7} className="h-24 text-center">
										<div className="flex justify-center items-center gap-2">
											<Loader2 className="h-4 w-4 animate-spin" />
											{t("dashboard.consularRegistry.table.loading")}
										</div>
									</TableCell>
								</TableRow>
							) : filteredRegistrations?.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={7}
										className="h-24 text-center text-muted-foreground"
									>
										{t("dashboard.consularRegistry.table.noResults")}
									</TableCell>
								</TableRow>
							) : (
								filteredRegistrations?.map((reg: any) => (
									<TableRow key={reg._id} className="hover:bg-muted/50">
										<TableCell>
											<div className="flex items-center gap-3">
												<Avatar className="h-8 w-8">
													<AvatarImage src={reg.user?.avatarUrl} />
													<AvatarFallback>
														{reg.profile?.identity?.firstName?.[0]}
														{reg.profile?.identity?.lastName?.[0]}
													</AvatarFallback>
												</Avatar>
												<div>
													<span className="font-medium">
														{reg.profile?.identity?.firstName}{" "}
														{reg.profile?.identity?.lastName}
													</span>
													<p className="text-xs text-muted-foreground">
														{reg.user?.email}
													</p>
												</div>
											</div>
										</TableCell>
										<TableCell className="capitalize">{reg.type}</TableCell>
										<TableCell>
											<UIBadge variant="outline" className="capitalize">
												{reg.duration === "short_stay"
													? t("dashboard.consularRegistry.duration.shortStay")
													: t("dashboard.consularRegistry.duration.longStay")}
											</UIBadge>
										</TableCell>
										<TableCell>
											{getStatusBadge(reg.status, !!reg.cardNumber)}
										</TableCell>
										<TableCell>
											{reg.cardNumber ? (
												<code className="text-xs bg-muted px-1 py-0.5 rounded">
													{reg.cardNumber}
												</code>
											) : (
												<span className="text-muted-foreground">—</span>
											)}
										</TableCell>
										<TableCell>
											{new Date(reg.registeredAt).toLocaleDateString(
												i18n.language === "fr" ? "fr-FR" : "en-US",
											)}
										</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-1">
												{/* View Request */}
												<Button
													size="icon"
													variant="ghost"
													asChild
													title={t(
														"dashboard.consularRegistry.actions.viewRequest",
													)}
												>
													<Link
														to="/admin/requests/$reference"
														params={{
															reference: reg.requestReference ?? reg.requestId,
														}}
													>
														<ExternalLink className="h-4 w-4" />
													</Link>
												</Button>
												{/* View Profile */}
												<Button
													size="icon"
													variant="ghost"
													title={t(
														"dashboard.consularRegistry.actions.viewProfile",
													)}
													onClick={() => {
														setSelectedRegistration(reg);
														setShowProfileDialog(true);
													}}
												>
													<User className="h-4 w-4" />
												</Button>
												{reg.status === "active" && !reg.cardNumber && (
													<Button
														size="sm"
														variant="outline"
														onClick={() => {
															setSelectedRegistration(reg);
															setShowCardDialog(true);
														}}
													>
														<CreditCard className="h-4 w-4 mr-1" />
														{t("dashboard.consularRegistry.actions.generate")}
													</Button>
												)}
												{reg.cardNumber && !reg.printedAt && (
													<Button
														size="sm"
														variant="outline"
														onClick={() => {
															setSelectedRegistration(reg);
															setShowPrintDialog(true);
														}}
													>
														<Printer className="h-4 w-4 mr-1" />
														{t("dashboard.consularRegistry.actions.print")}
													</Button>
												)}
												{reg.printedAt && (
													<UIBadge variant="secondary" className="text-xs">
														<CheckCircle2 className="h-3 w-3 mr-1" />
														{t("dashboard.consularRegistry.badges.printed")}
													</UIBadge>
												)}
											</div>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>

					{/* Load More */}
					{paginationStatus === "CanLoadMore" && (
						<div className="flex justify-center mt-4">
							<Button variant="outline" onClick={() => loadMore(25)}>
								{t("dashboard.consularRegistry.table.loadMore")}
							</Button>
						</div>
					)}
					{paginationStatus === "LoadingMore" && (
						<div className="flex justify-center mt-4">
							<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
						</div>
					)}
				</CardContent>
			</Card>

			{/* Generate Card Dialog */}
			<Dialog open={showCardDialog} onOpenChange={setShowCardDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{t("dashboard.consularRegistry.cardDialog.title")}
						</DialogTitle>
						<DialogDescription>
							<Trans
								i18nKey="dashboard.consularRegistry.cardDialog.description"
								values={{ name: selectedName }}
								components={{ strong: <strong /> }}
							/>
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowCardDialog(false)}>
							{t("dashboard.consularRegistry.cardDialog.cancel")}
						</Button>
						<Button
							onClick={() =>
								selectedRegistration &&
								handleGenerateCard(selectedRegistration._id)
							}
						>
							<CreditCard className="h-4 w-4 mr-2" />
							{t("dashboard.consularRegistry.cardDialog.confirm")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Print Dialog */}
			<Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{t("dashboard.consularRegistry.printDialog.title")}
						</DialogTitle>
						<DialogDescription>
							<Trans
								i18nKey="dashboard.consularRegistry.printDialog.description"
								values={{
									cardNumber: selectedRegistration?.cardNumber ?? "",
								}}
								components={{ code: <code /> }}
							/>
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowPrintDialog(false)}>
							{t("dashboard.consularRegistry.printDialog.cancel")}
						</Button>
						<Button
							onClick={() =>
								selectedRegistration &&
								handleMarkAsPrinted(selectedRegistration._id)
							}
						>
							<Printer className="h-4 w-4 mr-2" />
							{t("dashboard.consularRegistry.printDialog.confirm")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Profile Dialog */}
			<Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
				<DialogContent className="max-w-2xl! max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<User className="h-5 w-5" />
							{t("dashboard.consularRegistry.profileDialog.title")}
						</DialogTitle>
						<DialogDescription>
							<Trans
								i18nKey="dashboard.consularRegistry.profileDialog.description"
								values={{ name: selectedName }}
								components={{ strong: <strong /> }}
							/>
						</DialogDescription>
					</DialogHeader>
					{selectedRegistration?.user?._id && (
						<UserProfileCard userId={selectedRegistration.user._id} />
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
