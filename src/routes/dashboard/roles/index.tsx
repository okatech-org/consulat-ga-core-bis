import {
	DEFAULT_ROLE_MODULES,
	getPositionTasks,
	getTasksByCategory,
	ORGANIZATION_TEMPLATES,
	type OrganizationTemplate,
	type PositionTemplate,
	type RoleModuleDefinition,
	TASK_CATALOG,
	TASK_CATEGORY_META,
	type TaskCategory,
	type TaskDefinition,
} from "@convex/lib/roles";
import { createFileRoute } from "@tanstack/react-router";
import {
	AlertTriangle,
	Building2,
	CheckCircle2,
	ChevronDown,
	ChevronRight,
	Layers,
	Package,
	Shield,
	Users,
	Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLocalizedValue } from "@/lib/i18n-utils";
import { DynamicLucideIcon } from "@/lib/lucide-icon";

export const Route = createFileRoute("/dashboard/roles/")({
	component: RolesConfigPage,
});

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════

function RolesConfigPage() {
	const { t, i18n } = useTranslation();
	const lang = i18n.language?.startsWith("fr") ? "fr" : "en";

	return (
		<div className="flex flex-1 flex-col gap-6 p-4 pt-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
					<Shield className="h-8 w-8 text-primary" />
					{t("superadmin.roles.title")}
				</h1>
				<p className="text-muted-foreground mt-1">
					{t("superadmin.roles.subtitle")}
				</p>
			</div>

			{/* Tab Bar */}
			<Tabs defaultValue="overview">
				<TabsList>
					<TabsTrigger value="overview">
						<Layers className="h-4 w-4" />
						{t("superadmin.roles.tabs.overview")}
					</TabsTrigger>
					<TabsTrigger value="modules">
						<Package className="h-4 w-4" />
						{t("superadmin.roles.tabs.modules")}
					</TabsTrigger>
					<TabsTrigger value="templates">
						<Building2 className="h-4 w-4" />
						{t("superadmin.roles.tabs.templates")}
					</TabsTrigger>
					<TabsTrigger value="tasks">
						<Zap className="h-4 w-4" />
						{t("superadmin.roles.tabs.tasks")}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="overview">
					<OverviewTab lang={lang} />
				</TabsContent>
				<TabsContent value="modules">
					<ModulesTab lang={lang} />
				</TabsContent>
				<TabsContent value="templates">
					<TemplatesTab lang={lang} />
				</TabsContent>
				<TabsContent value="tasks">
					<TasksTab lang={lang} />
				</TabsContent>
			</Tabs>
		</div>
	);
}

// ═══════════════════════════════════════════════════════════════
// VUE D'ENSEMBLE
// ═══════════════════════════════════════════════════════════════

function OverviewTab({ lang }: { lang: string }) {
	const { t } = useTranslation();

	const riskLabels: Record<string, string> = {
		low: t("superadmin.roles.risk.low"),
		medium: t("superadmin.roles.risk.medium"),
		high: t("superadmin.roles.risk.high"),
		critical: t("superadmin.roles.risk.critical"),
	};

	return (
		<div className="space-y-6">
			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<StatCard
					icon={<Zap className="h-5 w-5 text-amber-500" />}
					label={t("superadmin.roles.stats.tasks")}
					value={TASK_CATALOG.length}
					description={t("superadmin.roles.stats.atomicPermissions")}
				/>
				<StatCard
					icon={<Package className="h-5 w-5 text-blue-500" />}
					label={t("superadmin.roles.stats.modules")}
					value={DEFAULT_ROLE_MODULES.length}
					description={t("superadmin.roles.stats.taskGroups")}
				/>
				<StatCard
					icon={<Building2 className="h-5 w-5 text-emerald-500" />}
					label={t("superadmin.roles.stats.templates")}
					value={ORGANIZATION_TEMPLATES.length}
					description={t("superadmin.roles.stats.orgModels")}
				/>
				<StatCard
					icon={<Users className="h-5 w-5 text-purple-500" />}
					label={t("superadmin.roles.stats.positions")}
					value={ORGANIZATION_TEMPLATES.reduce(
						(sum, tpl) => sum + tpl.positions.length,
						0,
					)}
					description={t("superadmin.roles.stats.acrossTemplates")}
				/>
			</div>

			{/* Architecture Diagram */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Layers className="h-5 w-5" />
						{t("superadmin.roles.architecture.title")}
					</CardTitle>
					<CardDescription>
						{t("superadmin.roles.architecture.description")}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<ArchLayer
							level={1}
							title={t("superadmin.roles.arch.tasks")}
							icon="⚡"
							color="border-amber-500/30 bg-amber-500/5"
							items={[
								"requests.validate",
								"documents.generate",
								"civil_status.register",
								"visas.approve",
								`...${TASK_CATALOG.length} ${t("superadmin.roles.arch.total")}`,
							]}
							description={t("superadmin.roles.arch.tasksDesc")}
						/>
						<ArchLayer
							level={2}
							title={t("superadmin.roles.arch.modules")}
							icon="📦"
							color="border-blue-500/30 bg-blue-500/5"
							renderItems={DEFAULT_ROLE_MODULES.slice(0, 5).map((m) => ({
								icon: m.icon,
								label: `${getLocalizedValue(m.label, lang)} (${m.tasks.length})`,
							}))}
							description={t("superadmin.roles.arch.modulesDesc")}
							extra={`...${DEFAULT_ROLE_MODULES.length} ${t("superadmin.roles.modules.label")}`}
						/>
						<ArchLayer
							level={3}
							title={t("superadmin.roles.arch.positions")}
							icon="👤"
							color="border-emerald-500/30 bg-emerald-500/5"
							items={[
								"Ambassadeur → Direction + Renseignement",
								"Vice-Consul → Validation + État Civil",
								"Agent d'Accueil → Réception",
							]}
							description={t("superadmin.roles.arch.positionsDesc")}
						/>
						<ArchLayer
							level={4}
							title="Templates"
							icon="🏛️"
							color="border-purple-500/30 bg-purple-500/5"
							renderItems={ORGANIZATION_TEMPLATES.map((tpl) => ({
								icon: tpl.icon,
								label: getLocalizedValue(tpl.label, lang),
							}))}
							description={t("superadmin.roles.arch.templatesDesc")}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Risk matrix */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5" />
						{t("superadmin.roles.riskMatrix.title")}
					</CardTitle>
					<CardDescription>
						{t("superadmin.roles.riskMatrix.description")}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
						{(["low", "medium", "high", "critical"] as const).map((risk) => {
							const tasks = TASK_CATALOG.filter(
								(taskItem) => taskItem.risk === risk,
							);
							const colors = {
								low: "bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-400",
								medium:
									"bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:text-yellow-400",
								high: "bg-orange-500/10 text-orange-700 border-orange-500/20 dark:text-orange-400",
								critical:
									"bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400",
							};
							return (
								<div
									key={risk}
									className={`rounded-xl border p-4 ${colors[risk]}`}
								>
									<div className="text-2xl font-bold">{tasks.length}</div>
									<div className="text-sm font-medium">{riskLabels[risk]}</div>
									<div className="mt-2 space-y-1">
										{tasks.slice(0, 3).map((taskItem) => (
											<div
												key={taskItem.code}
												className="text-xs opacity-70 truncate"
											>
												{getLocalizedValue(taskItem.label, lang)}
											</div>
										))}
										{tasks.length > 3 && (
											<div className="text-xs opacity-50">
												+{tasks.length - 3} {t("superadmin.roles.more")}
											</div>
										)}
									</div>
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

function StatCard({
	icon,
	label,
	value,
	description,
}: {
	icon: React.ReactNode;
	label: string;
	value: number;
	description: string;
}) {
	return (
		<Card>
			<CardContent className="pt-6">
				<div className="flex items-center gap-3">
					<div className="flex-shrink-0 p-2 rounded-lg bg-muted">{icon}</div>
					<div>
						<p className="text-2xl font-bold">{value}</p>
						<p className="text-sm font-medium">{label}</p>
						<p className="text-xs text-muted-foreground">{description}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function ArchLayer({
	level,
	title,
	icon,
	color,
	items,
	renderItems,
	description,
	extra,
}: {
	level: number;
	title: string;
	icon: string;
	color: string;
	items?: string[];
	renderItems?: { icon: string; label: string }[];
	description: string;
	extra?: string;
}) {
	const { t } = useTranslation();
	return (
		<div className={`rounded-xl border p-4 ${color} space-y-3`}>
			<div className="flex items-center gap-2">
				<span className="text-lg">{icon}</span>
				<div className="text-sm font-bold">
					{t("superadmin.roles.arch.level", { level })} — {title}
				</div>
			</div>
			<p className="text-xs text-muted-foreground">{description}</p>
			<div className="space-y-1">
				{items?.map((item) => (
					<div
						key={`item-${item}`}
						className="text-xs font-mono bg-background/50 rounded px-2 py-1 truncate"
					>
						{item}
					</div>
				))}
				{renderItems?.map((item) => (
					<div
						key={item.label}
						className="flex items-center gap-1.5 text-xs font-mono bg-background/50 rounded px-2 py-1 truncate"
					>
						<DynamicLucideIcon
							name={item.icon}
							className="h-3.5 w-3.5 shrink-0"
						/>
						<span className="truncate">{item.label}</span>
					</div>
				))}
				{extra && <div className="text-xs text-muted-foreground">{extra}</div>}
			</div>
		</div>
	);
}

// ═══════════════════════════════════════════════════════════════
// MODULES DE RÔLE
// ═══════════════════════════════════════════════════════════════

function ModulesTab({ lang }: { lang: string }) {
	const { t } = useTranslation();
	const [expandedModule, setExpandedModule] = useState<string | null>(null);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-semibold">
						{t("superadmin.roles.modules.title")}
					</h2>
					<p className="text-sm text-muted-foreground">
						{DEFAULT_ROLE_MODULES.length}{" "}
						{t("superadmin.roles.modules.subtitle")}
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-3">
				{DEFAULT_ROLE_MODULES.map((mod) => (
					<ModuleCard
						key={mod.code}
						module={mod}
						lang={lang}
						isExpanded={expandedModule === mod.code}
						onToggle={() =>
							setExpandedModule(expandedModule === mod.code ? null : mod.code)
						}
					/>
				))}
			</div>
		</div>
	);
}

function ModuleCard({
	module: mod,
	lang,
	isExpanded,
	onToggle,
}: {
	module: RoleModuleDefinition;
	lang: string;
	isExpanded: boolean;
	onToggle: () => void;
}) {
	const { t } = useTranslation();

	const tasksByCategory = useMemo(() => {
		const grouped: Record<string, TaskDefinition[]> = {};
		for (const taskCode of mod.tasks) {
			const task = TASK_CATALOG.find((taskItem) => taskItem.code === taskCode);
			if (task) {
				if (!grouped[task.category]) grouped[task.category] = [];
				grouped[task.category].push(task);
			}
		}
		return grouped;
	}, [mod.tasks]);

	return (
		<Card className="overflow-hidden">
			<button
				type="button"
				onClick={onToggle}
				className="w-full text-left px-6 py-4 flex items-center gap-4 hover:bg-muted/50 transition-colors"
			>
				<DynamicLucideIcon name={mod.icon} className="h-6 w-6" />
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<span className="font-semibold">
							{getLocalizedValue(mod.label, lang)}
						</span>
						<Badge variant="outline" className="text-xs">
							{mod.tasks.length} {t("superadmin.roles.taskCount")}
						</Badge>
						{mod.isSystem && (
							<Badge variant="secondary" className="text-xs">
								{t("superadmin.roles.system")}
							</Badge>
						)}
					</div>
					<p className="text-sm text-muted-foreground truncate">
						{getLocalizedValue(mod.description, lang)}
					</p>
				</div>
				{isExpanded ? (
					<ChevronDown className="h-5 w-5 text-muted-foreground" />
				) : (
					<ChevronRight className="h-5 w-5 text-muted-foreground" />
				)}
			</button>

			{isExpanded && (
				<CardContent className="border-t pt-4 pb-4">
					<div className="space-y-4">
						{Object.entries(tasksByCategory).map(([category, tasks]) => {
							const meta = TASK_CATEGORY_META[category as TaskCategory];
							return (
								<div key={category}>
									<div className="flex items-center gap-2 mb-2">
										<DynamicLucideIcon
											name={meta?.icon ?? "FileText"}
											className="h-4 w-4"
										/>
										<span className="text-sm font-medium">
											{meta ? getLocalizedValue(meta.label, lang) : category}
										</span>
									</div>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-6">
										{tasks.map((task) => (
											<TaskBadge key={task.code} task={task} lang={lang} />
										))}
									</div>
								</div>
							);
						})}
					</div>
				</CardContent>
			)}
		</Card>
	);
}

function TaskBadge({ task, lang }: { task: TaskDefinition; lang: string }) {
	const riskColors = {
		low: "bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-400",
		medium:
			"bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:text-yellow-400",
		high: "bg-orange-500/10 text-orange-700 border-orange-500/20 dark:text-orange-400",
		critical: "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400",
	};

	return (
		<div
			className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${riskColors[task.risk]}`}
		>
			<CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
			<div className="flex-1 min-w-0">
				<div className="font-medium truncate">
					{getLocalizedValue(task.label, lang)}
				</div>
				<div className="opacity-60 font-mono text-[10px]">{task.code}</div>
			</div>
		</div>
	);
}

// ═══════════════════════════════════════════════════════════════
// TEMPLATES D'ORGANISME
// ═══════════════════════════════════════════════════════════════

function TemplatesTab({ lang }: { lang: string }) {
	const { t } = useTranslation();
	const [selectedTemplate, setSelectedTemplate] = useState<string>(
		ORGANIZATION_TEMPLATES[0]?.type ?? "",
	);

	const template = ORGANIZATION_TEMPLATES.find(
		(tpl) => tpl.type === selectedTemplate,
	);

	return (
		<div className="space-y-6">
			{/* Template selector */}
			<div className="flex items-center gap-4">
				<h2 className="text-xl font-semibold">
					{t("superadmin.roles.templates.title")}
				</h2>
				<Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
					<SelectTrigger className="w-[280px]">
						<SelectValue placeholder={t("superadmin.roles.templates.select")} />
					</SelectTrigger>
					<SelectContent>
						{ORGANIZATION_TEMPLATES.map((tpl) => (
							<SelectItem key={tpl.type} value={tpl.type}>
								<span className="flex items-center gap-2">
									<DynamicLucideIcon name={tpl.icon} className="h-4 w-4" />
									<span>{getLocalizedValue(tpl.label, lang)}</span>
									<span className="text-muted-foreground">
										({tpl.positions.length} {t("superadmin.roles.postsCount")})
									</span>
								</span>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{template && <TemplateDetail template={template} lang={lang} />}
		</div>
	);
}

function TemplateDetail({
	template,
	lang,
}: {
	template: OrganizationTemplate;
	lang: string;
}) {
	const { t } = useTranslation();
	const [expandedPosition, setExpandedPosition] = useState<string | null>(null);

	return (
		<div className="space-y-4">
			{/* Template info */}
			<Card>
				<CardContent className="pt-6">
					<div className="flex items-center gap-4">
						<DynamicLucideIcon name={template.icon} className="h-10 w-10" />
						<div>
							<h3 className="text-lg font-bold">
								{getLocalizedValue(template.label, lang)}
							</h3>
							<p className="text-sm text-muted-foreground">
								{getLocalizedValue(template.description, lang)}
							</p>
							<div className="flex items-center gap-3 mt-2">
								<Badge variant="outline">
									{template.positions.length} {t("superadmin.roles.postsCount")}
								</Badge>
								<Badge variant="outline">
									{template.positions.filter((p) => p.isRequired).length}{" "}
									{t("superadmin.roles.required")}
								</Badge>
								<Badge variant="outline">
									{
										new Set(template.positions.flatMap((p) => p.roleModules))
											.size
									}{" "}
									{t("superadmin.roles.modulesUsed")}
								</Badge>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Position list */}
			<div className="space-y-2">
				{template.positions.map((pos) => (
					<PositionCard
						key={pos.code}
						position={pos}
						lang={lang}
						isExpanded={expandedPosition === pos.code}
						onToggle={() =>
							setExpandedPosition(
								expandedPosition === pos.code ? null : pos.code,
							)
						}
					/>
				))}
			</div>
		</div>
	);
}

function PositionCard({
	position,
	lang,
	isExpanded,
	onToggle,
}: {
	position: PositionTemplate;
	lang: string;
	isExpanded: boolean;
	onToggle: () => void;
}) {
	const { t } = useTranslation();
	const allTasks = useMemo(() => getPositionTasks(position), [position]);
	const modules = useMemo(
		() =>
			position.roleModules
				.map((code) => DEFAULT_ROLE_MODULES.find((m) => m.code === code))
				.filter(Boolean) as RoleModuleDefinition[],
		[position.roleModules],
	);

	const indent = Math.max(0, (position.level - 1) * 24);

	return (
		<Card
			className="overflow-hidden transition-all"
			style={{ marginLeft: `${indent}px` }}
		>
			<button
				type="button"
				onClick={onToggle}
				className="w-full text-left px-5 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors"
			>
				<div
					className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
						position.level === 1
							? "bg-amber-500/20 text-amber-700 dark:text-amber-400"
							: position.level === 2
								? "bg-blue-500/20 text-blue-700 dark:text-blue-400"
								: position.level <= 4
									? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
									: "bg-zinc-500/20 text-zinc-600 dark:text-zinc-400"
					}`}
				>
					N{position.level}
				</div>

				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<span className="font-semibold text-sm">
							{getLocalizedValue(position.title, lang)}
						</span>
						{position.isRequired && (
							<Badge variant="destructive" className="text-[10px] h-4 px-1.5">
								{t("superadmin.roles.required")}
							</Badge>
						)}
					</div>
					<div className="flex items-center gap-1.5 mt-0.5">
						{modules.map((mod) => (
							<span
								key={mod.code}
								className="inline-flex items-center gap-1 text-[10px] bg-muted rounded-full px-2 py-0.5"
							>
								<DynamicLucideIcon name={mod.icon} className="h-3 w-3" />{" "}
								{getLocalizedValue(mod.label, lang)}
							</span>
						))}
					</div>
				</div>

				<Badge variant="outline" className="text-xs">
					{allTasks.length} {t("superadmin.roles.taskCount")}
				</Badge>
				{isExpanded ? (
					<ChevronDown className="h-4 w-4 text-muted-foreground" />
				) : (
					<ChevronRight className="h-4 w-4 text-muted-foreground" />
				)}
			</button>

			{isExpanded && (
				<CardContent className="border-t pt-4 pb-4">
					<div className="space-y-4">
						{position.description && (
							<p className="text-sm text-muted-foreground">
								{getLocalizedValue(position.description, lang)}
							</p>
						)}

						{/* Modules assigned */}
						<div>
							<h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">
								{t("superadmin.roles.assignedModules")}
							</h4>
							<div className="flex flex-wrap gap-2">
								{modules.map((mod) => (
									<div
										key={mod.code}
										className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2"
									>
										<DynamicLucideIcon name={mod.icon} className="h-4 w-4" />
										<div>
											<div className="text-xs font-medium">
												{getLocalizedValue(mod.label, lang)}
											</div>
											<div className="text-[10px] text-muted-foreground">
												{mod.tasks.length} {t("superadmin.roles.taskCount")}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* All tasks */}
						<div>
							<h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">
								{t("superadmin.roles.allTasks")} ({allTasks.length})
							</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5">
								{allTasks
									.sort((a, b) => a.category.localeCompare(b.category))
									.map((task) => (
										<TaskBadge key={task.code} task={task} lang={lang} />
									))}
							</div>
						</div>
					</div>
				</CardContent>
			)}
		</Card>
	);
}

// ═══════════════════════════════════════════════════════════════
// CATALOGUE DE TÂCHES
// ═══════════════════════════════════════════════════════════════

function TasksTab({ lang }: { lang: string }) {
	const { t } = useTranslation();
	const tasksByCategory = useMemo(() => getTasksByCategory(), []);
	const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

	return (
		<div className="space-y-4">
			<div>
				<h2 className="text-xl font-semibold">
					{t("superadmin.roles.tasks.title")}
				</h2>
				<p className="text-sm text-muted-foreground">
					{TASK_CATALOG.length} {t("superadmin.roles.tasks.subtitle")}
				</p>
			</div>

			<div className="grid grid-cols-1 gap-3">
				{Object.entries(tasksByCategory).map(([category, tasks]) => {
					const meta = TASK_CATEGORY_META[category as TaskCategory];
					const isExpanded = expandedCategory === category;
					return (
						<Card key={category} className="overflow-hidden">
							<button
								type="button"
								onClick={() =>
									setExpandedCategory(isExpanded ? null : category)
								}
								className="w-full text-left px-6 py-4 flex items-center gap-4 hover:bg-muted/50 transition-colors"
							>
								<DynamicLucideIcon
									name={meta?.icon ?? "FileText"}
									className="h-6 w-6"
								/>
								<div className="flex-1">
									<div className="flex items-center gap-2">
										<span className="font-semibold">
											{meta ? getLocalizedValue(meta.label, lang) : category}
										</span>
										<Badge variant="outline" className="text-xs">
											{tasks.length} {t("superadmin.roles.taskCount")}
										</Badge>
									</div>
								</div>
								<div className="flex items-center gap-2">
									{(["critical", "high", "medium", "low"] as const).map(
										(risk) => {
											const count = tasks.filter(
												(taskItem) => taskItem.risk === risk,
											).length;
											if (count === 0) return null;
											const colors = {
												low: "bg-green-500",
												medium: "bg-yellow-500",
												high: "bg-orange-500",
												critical: "bg-red-500",
											};
											return (
												<span
													key={risk}
													className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white ${colors[risk]}`}
												>
													{count}
												</span>
											);
										},
									)}
								</div>
								{isExpanded ? (
									<ChevronDown className="h-5 w-5 text-muted-foreground" />
								) : (
									<ChevronRight className="h-5 w-5 text-muted-foreground" />
								)}
							</button>

							{isExpanded && (
								<CardContent className="border-t pt-4 pb-4">
									<div className="space-y-2">
										{tasks.map((task) => (
											<TaskDetailRow key={task.code} task={task} lang={lang} />
										))}
									</div>
								</CardContent>
							)}
						</Card>
					);
				})}
			</div>
		</div>
	);
}

function TaskDetailRow({ task, lang }: { task: TaskDefinition; lang: string }) {
	const { t } = useTranslation();
	const riskLabels: Record<string, string> = {
		low: t("superadmin.roles.risk.low"),
		medium: t("superadmin.roles.risk.medium"),
		high: t("superadmin.roles.risk.high"),
		critical: t("superadmin.roles.risk.critical"),
	};
	const riskColors: Record<string, string> = {
		low: "text-green-700 bg-green-500/10 dark:text-green-400",
		medium: "text-yellow-700 bg-yellow-500/10 dark:text-yellow-400",
		high: "text-orange-700 bg-orange-500/10 dark:text-orange-400",
		critical: "text-red-700 bg-red-500/10 dark:text-red-400",
	};

	// Find which modules include this task
	const inModules = DEFAULT_ROLE_MODULES.filter((m) =>
		m.tasks.includes(task.code),
	);

	return (
		<div className="flex items-center gap-3 rounded-lg border px-4 py-3 hover:bg-muted/30 transition-colors">
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2">
					<span className="font-medium text-sm">
						{getLocalizedValue(task.label, lang)}
					</span>
					<span className="font-mono text-[10px] text-muted-foreground">
						{task.code}
					</span>
				</div>
				<p className="text-xs text-muted-foreground mt-0.5">
					{getLocalizedValue(task.description, lang)}
				</p>
				{inModules.length > 0 && (
					<div className="flex items-center gap-1 mt-1">
						{inModules.map((mod) => (
							<span
								key={mod.code}
								className="text-[10px] bg-muted rounded-full px-2 py-0.5"
							>
								<DynamicLucideIcon name={mod.icon} className="h-3 w-3" />{" "}
								{getLocalizedValue(mod.label, lang)}
							</span>
						))}
					</div>
				)}
			</div>
			<Badge className={`text-[10px] ${riskColors[task.risk]}`}>
				{riskLabels[task.risk]}
			</Badge>
		</div>
	);
}
