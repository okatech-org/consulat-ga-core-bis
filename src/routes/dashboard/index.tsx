import { api } from "@convex/_generated/api";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Activity,
	ArrowRight,
	Building2,
	CalendarCheck,
	ClipboardList,
	FileText,
	Plus,
	Settings,
	TrendingUp,
	User,
	Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
	useAuthenticatedPaginatedQuery,
} from "@/integrations/convex/hooks";
import { getLocalizedValue } from "@/lib/i18n-utils";

// ─── Status colors ─────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
	draft: "#94a3b8",
	pending: "#f59e0b",
	pending_completion: "#fb923c",
	edited: "#a78bfa",
	submitted: "#3b82f6",
	under_review: "#6366f1",
	in_production: "#8b5cf6",
	validated: "#10b981",
	rejected: "#ef4444",
	appointment_scheduled: "#06b6d4",
	ready_for_pickup: "#14b8a6",
	completed: "#22c55e",
	cancelled: "#64748b",
	processing: "#6366f1",
};

const STATUS_LABELS: Record<string, { fr: string; en: string }> = {
	draft: { fr: "Brouillon", en: "Draft" },
	pending: { fr: "En attente", en: "Pending" },
	pending_completion: { fr: "Compléments", en: "Pending Completion" },
	edited: { fr: "Modifié", en: "Edited" },
	submitted: { fr: "Soumis", en: "Submitted" },
	under_review: { fr: "En examen", en: "Under Review" },
	in_production: { fr: "En production", en: "In Production" },
	validated: { fr: "Validé", en: "Validated" },
	rejected: { fr: "Rejeté", en: "Rejected" },
	appointment_scheduled: { fr: "RDV planifié", en: "Appointment" },
	ready_for_pickup: { fr: "Prêt", en: "Ready" },
	completed: { fr: "Terminé", en: "Completed" },
	cancelled: { fr: "Annulé", en: "Cancelled" },
	processing: { fr: "Traitement", en: "Processing" },
};

// ─── KPI Card ──────────────────────────────────────────────────────────────
function KpiCard({
	icon: Icon,
	label,
	value,
	sub,
	accent,
	loading,
}: {
	icon: React.ElementType;
	label: string;
	value: number | string;
	sub: string;
	accent: string;
	loading?: boolean;
}) {
	return (
		<Card className="relative overflow-hidden">
			<div
				className="absolute left-0 top-0 h-full w-1 rounded-l-xl"
				style={{ background: accent }}
			/>
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="text-sm font-medium text-muted-foreground">
					{label}
				</CardTitle>
				<div
					className="flex h-9 w-9 items-center justify-center rounded-lg"
					style={{ background: `${accent}18` }}
				>
					<Icon className="h-4 w-4" style={{ color: accent }} />
				</div>
			</CardHeader>
			<CardContent>
				{loading ? (
					<Skeleton className="h-8 w-20" />
				) : (
					<div className="text-3xl font-bold tracking-tight">{value}</div>
				)}
				<p className="mt-1 text-xs text-muted-foreground">{sub}</p>
			</CardContent>
		</Card>
	);
}

// ─── Status Badge ──────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
	const { i18n } = useTranslation();
	const lang = i18n.language === "fr" ? "fr" : "en";
	const color = STATUS_COLORS[status] ?? "#94a3b8";
	const label = STATUS_LABELS[status]?.[lang] ?? status;

	return (
		<span
			className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
			style={{
				background: `${color}18`,
				color,
			}}
		>
			<span
				className="h-1.5 w-1.5 rounded-full"
				style={{ background: color }}
			/>
			{label}
		</span>
	);
}

// ─── Recent Activity List ──────────────────────────────────────────────────
function RecentActivityList() {
	const { t } = useTranslation();
	const { results: logs, isLoading: isPending } =
		useAuthenticatedPaginatedQuery(
			api.functions.admin.getAuditLogs,
			{},
			{ initialNumItems: 6 },
		);

	if (isPending) {
		return (
			<div className="space-y-4">
				{[1, 2, 3, 4].map((i) => (
					<div key={i} className="flex items-center gap-3">
						<Skeleton className="h-9 w-9 rounded-full" />
						<div className="flex-1 space-y-1">
							<Skeleton className="h-4 w-36" />
							<Skeleton className="h-3 w-24" />
						</div>
					</div>
				))}
			</div>
		);
	}

	if (!logs || logs.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-8 text-center">
				<Activity className="mb-2 h-8 w-8 text-muted-foreground/40" />
				<p className="text-sm text-muted-foreground">
					{t("superadmin.common.noData")}
				</p>
			</div>
		);
	}

	const getActionIcon = (action: string) => {
		if (action.includes("user")) return <User className="h-4 w-4" />;
		if (action.includes("org")) return <Building2 className="h-4 w-4" />;
		if (action.includes("service")) return <FileText className="h-4 w-4" />;
		if (action.includes("request"))
			return <ClipboardList className="h-4 w-4" />;
		return <Settings className="h-4 w-4" />;
	};

	const getActionColor = (action: string) => {
		if (action.includes("created") || action.includes("submitted"))
			return "#22c55e";
		if (action.includes("updated") || action.includes("changed"))
			return "#3b82f6";
		if (action.includes("deleted") || action.includes("disabled"))
			return "#ef4444";
		return "#6366f1";
	};

	return (
		<div className="space-y-3">
			{logs.map((log) => {
				const color = getActionColor(log.action);
				return (
					<div
						key={log._id}
						className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/40"
					>
						<div
							className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
							style={{ background: `${color}14` }}
						>
							<span style={{ color }}>{getActionIcon(log.action)}</span>
						</div>
						<div className="min-w-0 flex-1">
							<p className="text-sm font-medium leading-tight">
								{t(`superadmin.auditLogs.actions.${log.action}`, log.action)}
							</p>
							<p className="mt-0.5 text-xs text-muted-foreground truncate">
								{log.user?.firstName} {log.user?.lastName} •{" "}
								{new Date(log.timestamp).toLocaleString()}
							</p>
						</div>
					</div>
				);
			})}
		</div>
	);
}

// ─── Status Pie Chart ──────────────────────────────────────────────────────
function RequestStatusChart({
	breakdown,
}: {
	breakdown: Record<string, number>;
}) {
	const { i18n } = useTranslation();
	const lang = i18n.language === "fr" ? "fr" : "en";

	const data = Object.entries(breakdown)
		.map(([status, count]) => ({
			name: STATUS_LABELS[status]?.[lang] ?? status,
			value: count,
			color: STATUS_COLORS[status] ?? "#94a3b8",
		}))
		.sort((a, b) => b.value - a.value);

	if (data.length === 0) {
		return (
			<div className="flex h-48 items-center justify-center">
				<p className="text-sm text-muted-foreground">Aucune donnée</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4 lg:flex-row lg:items-center">
			<div className="h-52 min-w-0 flex-1">
				<ResponsiveContainer width="100%" height="100%">
					<PieChart>
						<Pie
							data={data}
							cx="50%"
							cy="50%"
							innerRadius={55}
							outerRadius={85}
							paddingAngle={2}
							dataKey="value"
							strokeWidth={0}
						>
							{data.map((entry) => (
								<Cell key={entry.name} fill={entry.color} />
							))}
						</Pie>
						<Tooltip
							contentStyle={{
								background: "hsl(var(--popover))",
								border: "1px solid hsl(var(--border))",
								borderRadius: "8px",
								boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
								color: "hsl(var(--popover-foreground))",
							}}
						/>
					</PieChart>
				</ResponsiveContainer>
			</div>
			<div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm lg:grid-cols-1">
				{data.slice(0, 6).map((item) => (
					<div key={item.name} className="flex items-center gap-2">
						<span
							className="h-2.5 w-2.5 rounded-full shrink-0"
							style={{ background: item.color }}
						/>
						<span className="text-muted-foreground truncate">{item.name}</span>
						<span className="ml-auto font-semibold tabular-nums">
							{item.value}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

// ─── Recent Requests Table ─────────────────────────────────────────────────
function RecentRequestsTable({
	requests,
	loading,
}: {
	requests: Array<{
		_id: string;
		reference: string;
		status: string;
		priority: string;
		createdAt: number;
		userName: string;
		orgName: string;
		serviceName: string | Record<string, string>;
	}>;
	loading: boolean;
}) {
	const { t, i18n } = useTranslation();

	if (loading) {
		return (
			<div className="space-y-3">
				{[1, 2, 3, 4, 5].map((i) => (
					<Skeleton key={i} className="h-12 w-full" />
				))}
			</div>
		);
	}

	if (!requests || requests.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-8 text-center">
				<ClipboardList className="mb-2 h-8 w-8 text-muted-foreground/40" />
				<p className="text-sm text-muted-foreground">
					{t("superadmin.common.noData")}
				</p>
			</div>
		);
	}

	return (
		<div className="overflow-x-auto">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="min-w-[100px]">Référence</TableHead>
						<TableHead className="min-w-[140px]">Utilisateur</TableHead>
						<TableHead className="min-w-[140px]">Service</TableHead>
						<TableHead className="min-w-[140px]">Organisation</TableHead>
						<TableHead>Statut</TableHead>
						<TableHead className="text-right">Date</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{requests.map((r) => (
						<TableRow key={r._id} className="group">
							<TableCell className="font-mono text-xs font-medium">
								<Link
									to="/dashboard/requests/$requestId"
									params={{ requestId: r._id }}
									className="text-primary hover:underline"
								>
									{r.reference}
								</Link>
							</TableCell>
							<TableCell>
								<div className="flex items-center gap-2">
									<Avatar className="h-6 w-6">
										<AvatarFallback className="text-[10px] bg-primary/10">
											{r.userName
												.split(" ")
												.map((n) => n[0])
												.join("")
												.slice(0, 2)
												.toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<span className="text-sm truncate max-w-[120px]">
										{r.userName}
									</span>
								</div>
							</TableCell>
							<TableCell className="text-sm text-muted-foreground truncate max-w-[140px]">
								{typeof r.serviceName === "string"
									? r.serviceName
									: getLocalizedValue(r.serviceName, i18n.language)}
							</TableCell>
							<TableCell className="text-sm text-muted-foreground truncate max-w-[140px]">
								{r.orgName}
							</TableCell>
							<TableCell>
								<StatusBadge status={r.status} />
							</TableCell>
							<TableCell className="text-right text-xs text-muted-foreground tabular-nums">
								{new Date(r.createdAt).toLocaleDateString()}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

// ─── Main Dashboard ────────────────────────────────────────────────────────
export const Route = createFileRoute("/dashboard/")({
	component: SuperadminDashboard,
});

function SuperadminDashboard() {
	const { t, i18n } = useTranslation();

	const { data: stats, isPending } = useAuthenticatedConvexQuery(
		api.functions.admin.getStats,
		{},
	);

	const currentDate = new Date().toLocaleDateString(
		i18n.language === "fr" ? "fr-FR" : "en-US",
		{
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		},
	);

	return (
		<div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:p-6">
			{/* ── Header ──────────────────────────────────────────────── */}
			<div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						{t("superadmin.dashboard.title")}
					</h1>
					<p className="text-muted-foreground">
						{t("superadmin.dashboard.welcome")}
					</p>
				</div>
				<p className="text-sm text-muted-foreground capitalize">
					{currentDate}
				</p>
			</div>

			{/* ── KPI Cards ───────────────────────────────────────────── */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<KpiCard
					icon={Users}
					label={t("superadmin.dashboard.stats.users")}
					value={stats?.users.total ?? 0}
					sub={t("superadmin.dashboard.stats.totalUsers")}
					accent="#6366f1"
					loading={isPending}
				/>
				<KpiCard
					icon={Building2}
					label={t("superadmin.dashboard.stats.organizations")}
					value={stats?.orgs.total ?? 0}
					sub={t("superadmin.dashboard.stats.consulatesEmbassies")}
					accent="#f59e0b"
					loading={isPending}
				/>
				<KpiCard
					icon={FileText}
					label={t("superadmin.dashboard.stats.requests")}
					value={stats?.requests.total ?? 0}
					sub={t("superadmin.dashboard.stats.pendingRequests")}
					accent="#3b82f6"
					loading={isPending}
				/>
				<KpiCard
					icon={CalendarCheck}
					label={t("superadmin.dashboard.stats.registrations", "Inscriptions")}
					value={stats?.registrations?.total ?? 0}
					sub={t(
						"superadmin.dashboard.stats.totalRegistrations",
						"Inscriptions consulaires",
					)}
					accent="#10b981"
					loading={isPending}
				/>
			</div>

			{/* ── Chart + Activity ────────────────────────────────────── */}
			<div className="grid gap-4 lg:grid-cols-7">
				{/* Status Chart */}
				<Card className="lg:col-span-4">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrendingUp className="h-4 w-4 text-muted-foreground" />
							{t(
								"superadmin.dashboard.requestsByStatus",
								"Demandes par statut",
							)}
						</CardTitle>
						<CardDescription>
							{t(
								"superadmin.dashboard.requestsByStatusDesc",
								"Répartition des demandes selon leur statut de traitement",
							)}
						</CardDescription>
					</CardHeader>
					<CardContent>
						{isPending ? (
							<Skeleton className="h-52 w-full" />
						) : (
							<RequestStatusChart
								breakdown={stats?.requests.statusBreakdown ?? {}}
							/>
						)}
					</CardContent>
				</Card>

				{/* Recent Activity */}
				<Card className="lg:col-span-3">
					<CardHeader className="flex flex-row items-center justify-between">
						<div>
							<CardTitle>{t("superadmin.dashboard.recentActivity")}</CardTitle>
							<CardDescription>
								{t("superadmin.dashboard.recentActivityDesc")}
							</CardDescription>
						</div>
						<Button variant="ghost" size="sm" asChild>
							<Link to="/dashboard/audit-logs">
								<ArrowRight className="h-4 w-4" />
							</Link>
						</Button>
					</CardHeader>
					<CardContent>
						<RecentActivityList />
					</CardContent>
				</Card>
			</div>

			{/* ── Recent Requests Table ───────────────────────────────── */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<div>
						<CardTitle>
							{t("superadmin.dashboard.recentRequests", "Demandes récentes")}
						</CardTitle>
						<CardDescription>
							{t(
								"superadmin.dashboard.recentRequestsDesc",
								"Les 10 dernières demandes sur la plateforme",
							)}
						</CardDescription>
					</div>
					<Button variant="outline" size="sm" asChild>
						<Link to="/dashboard/requests">
							{t("superadmin.dashboard.viewAll", "Voir tout")}
							<ArrowRight className="ml-1 h-4 w-4" />
						</Link>
					</Button>
				</CardHeader>
				<CardContent>
					<RecentRequestsTable
						requests={stats?.recentRequests ?? []}
						loading={isPending}
					/>
				</CardContent>
			</Card>

			{/* ── Quick Actions ───────────────────────────────────────── */}
			<Card>
				<CardHeader>
					<CardTitle>{t("superadmin.dashboard.quickActions")}</CardTitle>
					<CardDescription>
						{t("superadmin.dashboard.quickActionsDesc")}
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
					<Button variant="outline" asChild className="justify-start h-10">
						<Link to="/dashboard/users">
							<Users className="mr-2 h-4 w-4" />
							{t("superadmin.nav.users")}
						</Link>
					</Button>
					<Button variant="outline" asChild className="justify-start h-10">
						<Link to="/dashboard/orgs/new">
							<Plus className="mr-2 h-4 w-4" />
							{t("superadmin.dashboard.addOrg")}
						</Link>
					</Button>
					<Button variant="outline" asChild className="justify-start h-10">
						<Link to="/dashboard/services">
							<FileText className="mr-2 h-4 w-4" />
							{t("superadmin.nav.services")}
						</Link>
					</Button>
					<Button variant="outline" asChild className="justify-start h-10">
						<Link to="/dashboard/audit-logs">
							<ClipboardList className="mr-2 h-4 w-4" />
							{t("superadmin.dashboard.viewLogs")}
						</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
