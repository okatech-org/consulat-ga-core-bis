import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import {
	Bell,
	CheckCircle2,
	Clock,
	CreditCard,
	FileText,
	Loader2,
	Printer,
	User,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
	getNotificationColumns,
	NotificationActionsCell,
	type NotificationRow,
} from "@/components/admin/consular-notifications-columns";
import {
	getRegistrationColumns,
	RegistrationActionsCell,
	type RegistrationRow,
} from "@/components/admin/consular-registrations-columns";
import { UserProfileCard } from "@/components/dashboard/UserProfileCard";
import { useOrg } from "@/components/org/org-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	useConvexMutationQuery,
	usePaginatedConvexQuery,
} from "@/integrations/convex/hooks";

export const Route = createFileRoute("/admin/consular-registry/")({
	component: ConsularRegistryPage,
});

// ═══════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════

function ConsularRegistryPage() {
	const { t, i18n } = useTranslation();
	const { activeOrgId } = useOrg();

	// ── Dialog State ────────────────────────────────────────────
	const [selectedRegistration, setSelectedRegistration] =
		useState<RegistrationRow | null>(null);
	const [selectedNotification, setSelectedNotification] =
		useState<NotificationRow | null>(null);
	const [showCardDialog, setShowCardDialog] = useState(false);
	const [showPrintDialog, setShowPrintDialog] = useState(false);
	const [showProfileDialog, setShowProfileDialog] = useState(false);

	// ── Data ────────────────────────────────────────────────────
	const {
		results: registrations,
		status: paginationStatus,
		loadMore,
		isLoading,
	} = usePaginatedConvexQuery(
		api.functions.consularRegistrations.listByOrg,
		activeOrgId ? { orgId: activeOrgId } : "skip",
		{ initialNumItems: 25 },
	);

	const {
		results: notifications,
		status: notifPaginationStatus,
		loadMore: loadMoreNotifs,
		isLoading: isLoadingNotifs,
	} = usePaginatedConvexQuery(
		api.functions.consularNotifications.listByOrg,
		activeOrgId ? { orgId: activeOrgId } : "skip",
		{ initialNumItems: 25 },
	);

	// ── Mutations ───────────────────────────────────────────────
	const { mutateAsync: generateCard } = useConvexMutationQuery(
		api.functions.consularRegistrations.generateCard,
	);
	const { mutateAsync: markAsPrinted } = useConvexMutationQuery(
		api.functions.consularRegistrations.markAsPrinted,
	);

	// ── Handlers ────────────────────────────────────────────────
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

	// ── Columns (with action callbacks wired in) ────────────────
	const registrationColumns = useMemo((): ColumnDef<RegistrationRow>[] => {
		const base = getRegistrationColumns(t, i18n.language);
		// Replace the placeholder actions column with a real one
		return base.map((col) =>
			col.id === "actions"
				? {
						...col,
						cell: ({ row }) => (
							<RegistrationActionsCell
								row={row.original}
								onViewProfile={(reg) => {
									setSelectedRegistration(reg);
									setShowProfileDialog(true);
								}}
								onGenerateCard={(reg) => {
									setSelectedRegistration(reg);
									setShowCardDialog(true);
								}}
								onMarkPrinted={(reg) => {
									setSelectedRegistration(reg);
									setShowPrintDialog(true);
								}}
							/>
						),
					}
				: col,
		);
	}, [t, i18n.language]);

	const notificationColumns = useMemo((): ColumnDef<NotificationRow>[] => {
		const base = getNotificationColumns(t, i18n.language);
		return base.map((col) =>
			col.id === "actions"
				? {
						...col,
						cell: ({ row }) => (
							<NotificationActionsCell
								row={row.original}
								onViewProfile={(notif) => {
									setSelectedNotification(notif);
									setShowProfileDialog(true);
								}}
							/>
						),
					}
				: col,
		);
	}, [t, i18n.language]);

	// ── Filterable Columns ──────────────────────────────────────
	const statusFilterOptions = useMemo(
		() => [
			{
				id: "status",
				title: t("dashboard.consularRegistry.table.statusPlaceholder"),
				options: [
					{
						label: t("dashboard.consularRegistry.statuses.requested"),
						value: "requested",
					},
					{
						label: t("dashboard.consularRegistry.statuses.active"),
						value: "active",
					},
					{
						label: t("dashboard.consularRegistry.statuses.expired"),
						value: "expired",
					},
				],
			},
		],
		[t],
	);

	// ── Stats ───────────────────────────────────────────────────
	const stats = {
		total: registrations?.length ?? 0,
		requested:
			registrations?.filter((r) => r.status === "requested").length ?? 0,
		active: registrations?.filter((r) => r.status === "active").length ?? 0,
		withCard: registrations?.filter((r) => r.cardNumber).length ?? 0,
	};

	const selectedName = selectedRegistration
		? `${selectedRegistration?.profile?.identity?.firstName ?? ""} ${selectedRegistration?.profile?.identity?.lastName ?? ""}`.trim()
		: selectedNotification
			? `${selectedNotification?.profile?.identity?.firstName ?? ""} ${selectedNotification?.profile?.identity?.lastName ?? ""}`.trim()
			: "";

	const selectedUserId =
		selectedRegistration?.user?._id ?? selectedNotification?.user?._id;

	return (
		<div className="flex flex-1 flex-col gap-4 p-4">
			{/* Header */}
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

			{/* Tabs: Registrations / Notifications */}
			<Tabs defaultValue="registrations" className="space-y-4">
				<TabsList>
					<TabsTrigger value="registrations" className="gap-1.5">
						<FileText className="h-4 w-4" />
						{t("dashboard.consularRegistry.tabs.registrations")}
					</TabsTrigger>
					<TabsTrigger value="notifications" className="gap-1.5">
						<Bell className="h-4 w-4" />
						{t("dashboard.consularRegistry.tabs.notifications")}
					</TabsTrigger>
				</TabsList>

				{/* ── Tab 1: Registrations ──────────────────────────────── */}
				<TabsContent value="registrations">
					<DataTable
						columns={registrationColumns}
						data={(registrations ?? []) as RegistrationRow[]}
						searchKey="citizen"
						searchPlaceholder={t(
							"dashboard.consularRegistry.table.searchPlaceholder",
						)}
						filterableColumns={statusFilterOptions}
						isLoading={isLoading && registrations.length === 0}
					/>

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
				</TabsContent>

				{/* ── Tab 2: Notifications ──────────────────────────────── */}
				<TabsContent value="notifications">
					<DataTable
						columns={notificationColumns}
						data={(notifications ?? []) as NotificationRow[]}
						searchKey="citizen"
						searchPlaceholder={t(
							"dashboard.consularRegistry.notificationsTable.searchPlaceholder",
						)}
						filterableColumns={statusFilterOptions}
						isLoading={isLoadingNotifs && notifications.length === 0}
					/>

					{notifPaginationStatus === "CanLoadMore" && (
						<div className="flex justify-center mt-4">
							<Button variant="outline" onClick={() => loadMoreNotifs(25)}>
								{t("dashboard.consularRegistry.notificationsTable.loadMore")}
							</Button>
						</div>
					)}
					{notifPaginationStatus === "LoadingMore" && (
						<div className="flex justify-center mt-4">
							<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
						</div>
					)}
				</TabsContent>
			</Tabs>

			{/* ── Dialogs ──────────────────────────────────────────── */}

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
					{selectedUserId && <UserProfileCard userId={selectedUserId} />}
				</DialogContent>
			</Dialog>
		</div>
	);
}
