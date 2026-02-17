"use client";

import { api } from "@convex/_generated/api";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	Calendar,
	ChevronRight,
	Clock,
	FileText,
	Inbox,
	Kanban,
	LayoutList,
	Loader2,
	Search,
	User,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useOrg } from "@/components/org/org-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
import {
	useAuthenticatedConvexQuery,
	useAuthenticatedPaginatedQuery,
} from "@/integrations/convex/hooks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/requests/")({
	component: DashboardRequests,
});

// ─── Status configuration ────────────────────────────────────────────
const STATUS_CONFIG: Record<
	string,
	{ label: string; color: string; bgClass: string; textClass: string }
> = {
	draft: {
		label: "Brouillon",
		color: "slate",
		bgClass: "bg-slate-100 dark:bg-slate-800",
		textClass: "text-slate-700 dark:text-slate-300",
	},
	submitted: {
		label: "Soumis",
		color: "blue",
		bgClass: "bg-blue-100 dark:bg-blue-900/40",
		textClass: "text-blue-700 dark:text-blue-300",
	},
	pending: {
		label: "En attente",
		color: "amber",
		bgClass: "bg-amber-100 dark:bg-amber-900/40",
		textClass: "text-amber-700 dark:text-amber-300",
	},
	pending_completion: {
		label: "Incomplet",
		color: "orange",
		bgClass: "bg-orange-100 dark:bg-orange-900/40",
		textClass: "text-orange-700 dark:text-orange-300",
	},
	edited: {
		label: "Modifié",
		color: "indigo",
		bgClass: "bg-indigo-100 dark:bg-indigo-900/40",
		textClass: "text-indigo-700 dark:text-indigo-300",
	},
	under_review: {
		label: "En examen",
		color: "purple",
		bgClass: "bg-purple-100 dark:bg-purple-900/40",
		textClass: "text-purple-700 dark:text-purple-300",
	},
	in_production: {
		label: "En production",
		color: "cyan",
		bgClass: "bg-cyan-100 dark:bg-cyan-900/40",
		textClass: "text-cyan-700 dark:text-cyan-300",
	},
	validated: {
		label: "Validé",
		color: "emerald",
		bgClass: "bg-emerald-100 dark:bg-emerald-900/40",
		textClass: "text-emerald-700 dark:text-emerald-300",
	},
	rejected: {
		label: "Rejeté",
		color: "red",
		bgClass: "bg-red-100 dark:bg-red-900/40",
		textClass: "text-red-700 dark:text-red-300",
	},
	appointment_scheduled: {
		label: "RDV fixé",
		color: "teal",
		bgClass: "bg-teal-100 dark:bg-teal-900/40",
		textClass: "text-teal-700 dark:text-teal-300",
	},
	ready_for_pickup: {
		label: "Prêt",
		color: "green",
		bgClass: "bg-green-100 dark:bg-green-900/40",
		textClass: "text-green-700 dark:text-green-300",
	},
	completed: {
		label: "Terminé",
		color: "emerald",
		bgClass: "bg-emerald-100 dark:bg-emerald-900/40",
		textClass: "text-emerald-700 dark:text-emerald-300",
	},
	cancelled: {
		label: "Annulé",
		color: "gray",
		bgClass: "bg-gray-100 dark:bg-gray-800",
		textClass: "text-gray-600 dark:text-gray-400",
	},
	processing: {
		label: "Traitement",
		color: "purple",
		bgClass: "bg-purple-100 dark:bg-purple-900/40",
		textClass: "text-purple-700 dark:text-purple-300",
	},
};

// Status tabs — grouped for quick filtering
const STATUS_TABS = [
	{ key: "all", label: "Toutes" },
	{ key: "submitted", label: "Soumises" },
	{ key: "pending", label: "En attente" },
	{ key: "under_review", label: "En examen" },
	{ key: "in_production", label: "Production" },
	{ key: "validated", label: "Validées" },
	{ key: "ready_for_pickup", label: "Prêtes" },
	{ key: "completed", label: "Terminées" },
	{ key: "rejected", label: "Rejetées" },
	{ key: "cancelled", label: "Annulées" },
];

// ─── Kanban column definitions ──────────────────────────────────────
// Each column groups multiple statuses for a cleaner board view
const KANBAN_COLUMNS = [
	{
		id: "incoming",
		label: "Nouvelles",
		icon: "📥",
		statuses: ["submitted", "pending", "pending_completion", "edited"],
		headerColor:
			"bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
		dotColor: "bg-amber-400",
	},
	{
		id: "review",
		label: "En examen",
		icon: "🔍",
		statuses: ["under_review", "processing"],
		headerColor:
			"bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800",
		dotColor: "bg-purple-400",
	},
	{
		id: "production",
		label: "Production",
		icon: "⚙️",
		statuses: [
			"in_production",
			"appointment_scheduled",
			"validated",
			"ready_for_pickup",
		],
		headerColor:
			"bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800",
		dotColor: "bg-cyan-400",
	},
	{
		id: "done",
		label: "Terminées",
		icon: "✅",
		statuses: ["completed"],
		headerColor:
			"bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
		dotColor: "bg-emerald-400",
	},
	{
		id: "closed",
		label: "Fermées",
		icon: "🚫",
		statuses: ["rejected", "cancelled"],
		headerColor:
			"bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700",
		dotColor: "bg-gray-400",
	},
];

// ─── Helpers ─────────────────────────────────────────────────────────

function getStatusConfig(status: string) {
	return (
		STATUS_CONFIG[status] ?? {
			label: status,
			color: "gray",
			bgClass: "bg-gray-100 dark:bg-gray-800",
			textClass: "text-gray-600 dark:text-gray-400",
		}
	);
}

function timeAgo(timestamp: number): string {
	const seconds = Math.floor((Date.now() - timestamp) / 1000);
	if (seconds < 60) return "À l'instant";
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `il y a ${minutes}min`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `il y a ${hours}h`;
	const days = Math.floor(hours / 24);
	if (days < 7) return `il y a ${days}j`;
	if (days < 30) return `il y a ${Math.floor(days / 7)}sem`;
	return new Date(timestamp).toLocaleDateString("fr-FR", {
		day: "numeric",
		month: "short",
	});
}

function getInitials(firstName?: string, lastName?: string): string {
	const f = firstName?.[0]?.toUpperCase() ?? "";
	const l = lastName?.[0]?.toUpperCase() ?? "";
	return f + l || "?";
}

// ─── Main Component ──────────────────────────────────────────────────

function DashboardRequests() {
	const { activeOrgId } = useOrg();
	const navigate = useNavigate();
	const { t } = useTranslation();

	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [serviceFilter, setServiceFilter] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [viewMode, setViewMode] = useState<"table" | "kanban">("kanban");

	const {
		results: requests,
		status: paginationStatus,
		loadMore,
		isLoading,
	} = useAuthenticatedPaginatedQuery(
		api.functions.requests.listByOrg,
		activeOrgId
			? {
					orgId: activeOrgId,
					status: statusFilter !== "all" ? (statusFilter as any) : undefined,
				}
			: "skip",
		{ initialNumItems: 50 },
	);

	const { data: services } = useAuthenticatedConvexQuery(
		api.functions.services.listByOrg,
		activeOrgId ? { orgId: activeOrgId, activeOnly: true } : "skip",
	);

	// Client-side filtering for Service & Search
	const filteredRequests = useMemo(
		() =>
			requests?.filter((req: any) => {
				const matchesService =
					serviceFilter === "all" || req.orgServiceId === serviceFilter;
				const matchesSearch =
					searchQuery === "" ||
					req.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
					req.user?.firstName
						?.toLowerCase()
						.includes(searchQuery.toLowerCase()) ||
					req.user?.lastName
						?.toLowerCase()
						.includes(searchQuery.toLowerCase()) ||
					req.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());

				return matchesService && matchesSearch;
			}),
		[requests, serviceFilter, searchQuery],
	);

	// Count per status (from all loaded results)
	const statusCounts = useMemo(() => {
		const counts: Record<string, number> = {};
		for (const req of requests ?? []) {
			counts[(req as any).status] = (counts[(req as any).status] || 0) + 1;
		}
		return counts;
	}, [requests]);

	const totalCount = requests?.length ?? 0;

	// Group requests by kanban column
	const kanbanData = useMemo(() => {
		if (!filteredRequests) return {};
		const groups: Record<string, any[]> = {};
		for (const col of KANBAN_COLUMNS) {
			groups[col.id] = [];
		}
		for (const req of filteredRequests) {
			const status = (req as any).status;
			const col = KANBAN_COLUMNS.find((c) => c.statuses.includes(status));
			if (col) {
				groups[col.id].push(req);
			}
		}
		return groups;
	}, [filteredRequests]);

	return (
		<div className="flex min-h-full flex-col gap-6 p-4 md:p-6">
			{/* ── Header ─────────────────────────────────── */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						{t("dashboard.requests.title")}
					</h1>
					<p className="text-muted-foreground text-sm">
						{t(
							"dashboard.requests.description",
							"Gérez les demandes de services de votre organisation",
						)}
					</p>
				</div>
				<div className="flex items-center gap-2">
					{totalCount > 0 && (
						<Badge variant="outline" className="text-sm px-3 py-1 font-medium">
							{totalCount} demande{totalCount > 1 ? "s" : ""}
						</Badge>
					)}
					{/* View mode toggle */}
					<div className="flex items-center border rounded-lg overflow-hidden">
						<Button
							variant={viewMode === "table" ? "default" : "ghost"}
							size="sm"
							onClick={() => setViewMode("table")}
							className="rounded-none gap-1.5 h-9"
						>
							<LayoutList className="h-4 w-4" />
							<span className="hidden sm:inline text-xs">
								{t("dashboard.requests.viewTable")}
							</span>
						</Button>
						<Button
							variant={viewMode === "kanban" ? "default" : "ghost"}
							size="sm"
							onClick={() => setViewMode("kanban")}
							className="rounded-none gap-1.5 h-9"
						>
							<Kanban className="h-4 w-4" />
							<span className="hidden sm:inline text-xs">
								{t("dashboard.requests.viewKanban")}
							</span>
						</Button>
					</div>
				</div>
			</div>

			{/* ── Filters Container ────────────────────── */}
			<div className="space-y-4">
				{/* Search bar - prominent */}
				<div className="flex flex-col sm:flex-row gap-3">
					<div className="relative flex-1">
						<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder={t(
								"dashboard.requests.search",
								"Rechercher par référence, nom ou email…",
							)}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10 h-11 text-sm bg-card border-border shadow-sm"
						/>
					</div>
					<Select value={serviceFilter} onValueChange={setServiceFilter}>
						<SelectTrigger className="w-full sm:w-[240px] h-11 bg-card border-border shadow-sm">
							<SelectValue
								placeholder={t(
									"dashboard.requests.allServices",
									"Tous les services",
								)}
							/>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Tous les services</SelectItem>
							{services?.map((service: any) => (
								<SelectItem key={service._id} value={service._id}>
									{service.service?.name?.fr ?? "Service"}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Status pill tabs — only in table mode */}
				{viewMode === "table" && (
					<div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
						{STATUS_TABS.map((tab) => {
							const isActive = statusFilter === tab.key;
							const count =
								tab.key === "all" ? totalCount : (statusCounts[tab.key] ?? 0);
							const config = getStatusConfig(tab.key);

							return (
								<button
									key={tab.key}
									onClick={() => setStatusFilter(tab.key)}
									className={cn(
										"inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 border",
										isActive
											? tab.key === "all"
												? "bg-primary text-primary-foreground border-primary shadow-sm"
												: `${config.bgClass} ${config.textClass} border-current/20 shadow-sm`
											: "bg-background hover:bg-muted/60 text-muted-foreground border-transparent hover:border-border/60",
									)}
								>
									{tab.label}
									{count > 0 && (
										<span
											className={cn(
												"inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-bold px-1",
												isActive
													? tab.key === "all"
														? "bg-primary-foreground/20 text-primary-foreground"
														: "bg-current/10"
													: "bg-muted text-muted-foreground",
											)}
										>
											{count}
										</span>
									)}
								</button>
							);
						})}
					</div>
				)}
			</div>

			{/* ── Content Area ───────────────────────── */}
			{viewMode === "table" ? (
				<TableView
					requests={filteredRequests}
					isLoading={isLoading}
					paginationStatus={paginationStatus}
					loadMore={loadMore}
					searchQuery={searchQuery}
					statusFilter={statusFilter}
					navigate={navigate}
					t={t}
				/>
			) : (
				<KanbanView
					kanbanData={kanbanData}
					isLoading={isLoading}
					navigate={navigate}
					t={t}
				/>
			)}
		</div>
	);
}

// ─── Table View Component ────────────────────────────────────────────

function TableView({
	requests,
	isLoading,
	paginationStatus,
	loadMore,
	searchQuery,
	statusFilter,
	navigate,
	t,
}: {
	requests: any[] | undefined;
	isLoading: boolean;
	paginationStatus: string;
	loadMore: (n: number) => void;
	searchQuery: string;
	statusFilter: string;
	navigate: any;
	t: any;
}) {
	return (
		<div className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden">
			<Table>
				<TableHeader>
					<TableRow className="bg-muted/30 hover:bg-muted/30">
						<TableHead className="font-semibold">
							{t("dashboard.requests.table.reference")}
						</TableHead>
						<TableHead className="font-semibold">
							{t("dashboard.requests.table.service")}
						</TableHead>
						<TableHead className="font-semibold">
							{t("dashboard.requests.table.requester")}
						</TableHead>
						<TableHead className="font-semibold">
							{t("dashboard.requests.table.date")}
						</TableHead>
						<TableHead className="font-semibold">
							{t("dashboard.requests.table.status")}
						</TableHead>
						<TableHead className="text-right font-semibold">
							{t("dashboard.requests.table.actions")}
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{isLoading && (requests?.length ?? 0) === 0 ? (
						<TableRow>
							<TableCell colSpan={6} className="h-32 text-center">
								<div className="flex flex-col items-center gap-2">
									<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
									<span className="text-sm text-muted-foreground">
										{t(
											"dashboard.requests.loading",
											"Chargement des demandes…",
										)}
									</span>
								</div>
							</TableCell>
						</TableRow>
					) : requests?.length === 0 ? (
						<TableRow>
							<TableCell colSpan={6} className="h-32 text-center">
								<div className="flex flex-col items-center gap-3 py-8">
									<div className="rounded-full bg-muted/60 p-3">
										<Inbox className="h-6 w-6 text-muted-foreground" />
									</div>
									<div>
										<p className="font-medium text-foreground/80">
											{t("dashboard.requests.empty")}
										</p>
										<p className="text-xs text-muted-foreground mt-1">
											{searchQuery || statusFilter !== "all"
												? t(
														"dashboard.requests.emptyFiltered",
														"Essayez de modifier vos filtres",
													)
												: t(
														"dashboard.requests.emptyAll",
														"Les nouvelles demandes apparaîtront ici",
													)}
										</p>
									</div>
								</div>
							</TableCell>
						</TableRow>
					) : (
						requests?.map((request: any) => {
							const statusConf = getStatusConfig(request.status);
							const userName = request.user
								? `${request.user.firstName ?? ""} ${request.user.lastName ?? ""}`.trim()
								: null;

							return (
								<TableRow
									key={request._id}
									className="cursor-pointer hover:bg-muted/40 transition-colors group"
									onClick={() =>
										navigate({
											to: `/admin/requests/${request.reference}` as any,
										})
									}
								>
									{/* Reference */}
									<TableCell>
										<div className="flex items-center gap-2">
											<div className="rounded-md bg-primary/10 p-1.5">
												<FileText className="h-3.5 w-3.5 text-primary" />
											</div>
											<span className="font-mono text-xs font-semibold">
												{request.reference || "—"}
											</span>
										</div>
									</TableCell>

									{/* Service */}
									<TableCell>
										<span className="text-sm">
											{(request.serviceName as any)?.fr ??
												(request.service as any)?.name?.fr ??
												"Service"}
										</span>
									</TableCell>

									{/* Requester */}
									<TableCell>
										<div className="flex items-center gap-2.5">
											<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-xs font-bold shrink-0">
												{userName ? (
													getInitials(
														request.user?.firstName,
														request.user?.lastName,
													)
												) : (
													<User className="h-3.5 w-3.5" />
												)}
											</div>
											<div className="flex flex-col min-w-0">
												<span className="font-medium text-sm truncate">
													{userName || "Utilisateur inconnu"}
												</span>
												{request.user?.email && (
													<span className="text-xs text-muted-foreground truncate">
														{request.user.email}
													</span>
												)}
											</div>
										</div>
									</TableCell>

									{/* Date */}
									<TableCell>
										<div className="flex items-center gap-1.5 text-muted-foreground">
											<Clock className="h-3.5 w-3.5 shrink-0" />
											<span className="text-xs whitespace-nowrap">
												{request.submittedAt
													? timeAgo(request.submittedAt)
													: request._creationTime
														? timeAgo(request._creationTime)
														: "-"}
											</span>
										</div>
									</TableCell>

									{/* Status */}
									<TableCell>
										<span
											className={cn(
												"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
												statusConf.bgClass,
												statusConf.textClass,
											)}
										>
											{statusConf.label}
										</span>
									</TableCell>

									{/* Actions */}
									<TableCell className="text-right">
										<Button
											size="sm"
											variant="ghost"
											className="opacity-0 group-hover:opacity-100 transition-opacity"
											asChild
										>
											<Link
												to="/admin/requests/$reference"
												params={{ reference: request.reference }}
											>
												{t("dashboard.requests.manage")}
												<ChevronRight className="h-4 w-4 ml-1" />
											</Link>
										</Button>
									</TableCell>
								</TableRow>
							);
						})
					)}
				</TableBody>
			</Table>

			{/* Load More */}
			{paginationStatus === "CanLoadMore" && (
				<div className="flex justify-center py-4 border-t border-border/40">
					<Button
						variant="outline"
						size="sm"
						onClick={() => loadMore(25)}
						className="gap-2"
					>
						<Calendar className="h-4 w-4" />
						{t("dashboard.requests.loadMore")}
					</Button>
				</div>
			)}
			{paginationStatus === "LoadingMore" && (
				<div className="flex justify-center py-4 border-t border-border/40">
					<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
				</div>
			)}
		</div>
	);
}

// ─── Kanban View Component ───────────────────────────────────────────

function KanbanView({
	kanbanData,
	isLoading,
	navigate,
	t,
}: {
	kanbanData: Record<string, any[]>;
	isLoading: boolean;
	navigate: any;
	t: any;
}) {
	if (isLoading && Object.values(kanbanData).every((col) => col.length === 0)) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="flex-1 flex flex-col min-h-0">
			<ScrollArea className="w-full flex-1">
				<div className="flex gap-4 pb-4 h-[calc(100vh-240px)]">
					{KANBAN_COLUMNS.map((column) => {
						const cards = kanbanData[column.id] ?? [];

						return (
							<div
								key={column.id}
								className="flex flex-col min-w-[280px] w-[280px] shrink-0"
							>
								{/* Column Header */}
								<div
									className={cn(
										"flex items-center gap-2 px-3 py-2.5 rounded-t-lg border border-b-0",
										column.headerColor,
									)}
								>
									<div
										className={cn("w-2 h-2 rounded-full", column.dotColor)}
									/>
									<span className="text-sm font-semibold">{column.label}</span>
									<Badge
										variant="secondary"
										className="ml-auto text-[10px] h-5 min-w-[20px] justify-center"
									>
										{cards.length}
									</Badge>
								</div>

								{/* Column Body */}
								<div className="flex-1 bg-muted/20 border border-t-0 border-border/60 rounded-b-lg p-2 space-y-2 overflow-y-auto">
									{cards.length === 0 ? (
										<div className="flex flex-col items-center justify-center py-8 text-center">
											<Inbox className="h-5 w-5 text-muted-foreground/30 mb-2" />
											<p className="text-xs text-muted-foreground/50">
												{t("dashboard.requests.kanban.empty")}
											</p>
										</div>
									) : (
										cards.map((request: any) => (
											<KanbanCard
												key={request._id}
												request={request}
												navigate={navigate}
												t={t}
											/>
										))
									)}
								</div>
							</div>
						);
					})}
				</div>
				<ScrollBar orientation="horizontal" />
			</ScrollArea>
		</div>
	);
}

// ─── Kanban Card Component ───────────────────────────────────────────

function KanbanCard({
	request,
	navigate,
	t,
}: {
	request: any;
	navigate: any;
	t: any;
}) {
	const statusConf = getStatusConfig(request.status);
	const userName = request.user
		? `${request.user.firstName ?? ""} ${request.user.lastName ?? ""}`.trim()
		: null;

	const serviceName =
		(request.serviceName as any)?.fr ??
		(request.service as any)?.name?.fr ??
		"Service";

	return (
		<div
			onClick={() =>
				navigate({ to: `/admin/requests/${request.reference}` as any })
			}
			className="group cursor-pointer bg-card rounded-lg border border-border/60 p-3 shadow-sm hover:shadow-md hover:border-border transition-all duration-200 hover:-translate-y-0.5"
		>
			{/* Service name (like "Product area" in Refero) */}
			<div className="flex items-center justify-between gap-2 mb-2">
				<span
					className={cn(
						"inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium",
						statusConf.bgClass,
						statusConf.textClass,
					)}
				>
					{statusConf.label}
				</span>
				<ChevronRight className="h-3.5 w-3.5 text-muted-foreground/0 group-hover:text-muted-foreground transition-all" />
			</div>

			{/* Reference (title) */}
			<p className="text-sm font-medium leading-snug mb-1.5 line-clamp-2">
				{request.reference || "Sans référence"}
			</p>

			{/* Service tag */}
			<Badge
				variant="secondary"
				className="text-[10px] font-normal mb-3 max-w-full truncate"
			>
				{serviceName}
			</Badge>

			{/* Footer: user avatar + metadata */}
			<div className="flex items-center justify-between pt-2 border-t border-border/40">
				<div className="flex items-center gap-2 min-w-0">
					<div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-[9px] font-bold shrink-0">
						{userName ? (
							getInitials(request.user?.firstName, request.user?.lastName)
						) : (
							<User className="h-3 w-3" />
						)}
					</div>
					<span className="text-xs text-muted-foreground truncate">
						{userName || "Inconnu"}
					</span>
				</div>
				<span className="text-[10px] text-muted-foreground whitespace-nowrap">
					{request.submittedAt
						? timeAgo(request.submittedAt)
						: request._creationTime
							? timeAgo(request._creationTime)
							: ""}
				</span>
			</div>
		</div>
	);
}
