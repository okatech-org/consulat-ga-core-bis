"use client";

import { api } from "@convex/_generated/api";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Filter, Loader2, Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useOrg } from "@/components/org/org-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
import { useAuthenticatedConvexQuery } from "@/integrations/convex/hooks";

export const Route = createFileRoute("/dashboard/requests/")({
	component: DashboardRequests,
});

function DashboardRequests() {
	const { activeOrgId } = useOrg();
	const navigate = useNavigate();
	const { t } = useTranslation();

	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [serviceFilter, setServiceFilter] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState("");

	const queryArgs = activeOrgId
		? {
				orgId: activeOrgId,
				status: statusFilter !== "all" ? (statusFilter as any) : undefined,
			}
		: "skip";

	const { data: requests } = useAuthenticatedConvexQuery(
		api.functions.requests.listByOrg,
		queryArgs,
	);

	const { data: services } = useAuthenticatedConvexQuery(
		api.functions.services.listByOrg,
		activeOrgId ? { orgId: activeOrgId, activeOnly: true } : "skip",
	);

	// Client-side filtering for Service & Search
	const filteredRequests = requests?.filter((req) => {
		const matchesService =
			serviceFilter === "all" || req.orgServiceId === serviceFilter;
		const matchesSearch =
			searchQuery === "" ||
			req.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			req.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			req.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			req.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());

		return matchesService && matchesSearch;
	});

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case "draft":
				return "outline";
			case "submitted":
				return "default"; // Blue/Primary
			case "under_review":
				return "secondary"; // Gray/Secondary
			case "pending":
				return "warning"; // Yellow? Need custom variant or stick to standard
			case "validated":
				return "success"; // Green?
			case "completed":
				return "default";
			case "rejected":
				return "destructive"; // Red
			case "cancelled":
				return "destructive";
			default:
				return "outline";
		}
	};

	const getStatusLabel = (status: string) => {
		const labels: Record<string, string> = {
			draft: "Brouillon",
			submitted: "Soumis",
			under_review: "En examen",
			pending: "En attente",
			pending_completion: "Incomplet",
			edited: "Modifié",
			in_production: "En production",
			validated: "Validé",
			ready_for_pickup: "Prêt",
			appointment_scheduled: "RDV fixé",
			completed: "Terminé",
			rejected: "Rejeté",
			cancelled: "Annulé",
		};
		return labels[status] || status;
	};

	return (
		<div className="flex flex-1 flex-col gap-4 p-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						{t("dashboard.requests.title")}
					</h1>
					<p className="text-muted-foreground">
						{t("dashboard.requests.description")}
					</p>
				</div>
			</div>

			<Card>
				<CardHeader className="pb-3">
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
						<div className="space-y-1">
							<CardTitle>{t("dashboard.requests.listTitle")}</CardTitle>
							<CardDescription>
								{t("dashboard.requests.listDescription")}
							</CardDescription>
						</div>

						<div className="flex flex-wrap items-center gap-2">
							{/* Text Search */}
							<div className="relative w-[200px]">
								<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Rechercher..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-8 h-9"
								/>
							</div>

							{/* Status Filter */}
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger className="w-[160px] h-9">
									<Filter className="mr-2 h-4 w-4" />
									<SelectValue placeholder="Statut" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Tous les statuts</SelectItem>
									<SelectItem value="draft">Brouillon</SelectItem>
									<SelectItem value="submitted">Soumis</SelectItem>
									<SelectItem value="under_review">En examen</SelectItem>
									<SelectItem value="pending">En attente</SelectItem>
									<SelectItem value="completed">Terminé</SelectItem>
									<SelectItem value="rejected">Rejeté</SelectItem>
								</SelectContent>
							</Select>

							{/* Service Filter */}
							<Select value={serviceFilter} onValueChange={setServiceFilter}>
								<SelectTrigger className="w-[180px] h-9">
									<SelectValue placeholder="Tous les services" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Tous les services</SelectItem>
									{services?.map((service) => (
										<SelectItem key={service._id} value={service._id}>
											{service.service?.name?.fr ?? "Service"}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Référence</TableHead>
								<TableHead>Service</TableHead>
								<TableHead>Demandeur</TableHead>
								<TableHead>Date</TableHead>
								<TableHead>Statut</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredRequests === undefined ? (
								<TableRow>
									<TableCell colSpan={6} className="h-24 text-center">
										<Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
									</TableCell>
								</TableRow>
							) : filteredRequests.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={6}
										className="h-24 text-center text-muted-foreground"
									>
										Aucune demande trouvée
									</TableCell>
								</TableRow>
							) : (
								filteredRequests.map((request) => (
									<TableRow
										key={request._id}
										className="cursor-pointer hover:bg-muted/50"
										onClick={() =>
											navigate({
												to: `/dashboard/requests/${request._id}` as any,
											})
										}
									>
										<TableCell className="font-mono text-sm font-medium">
											{request.reference || "—"}
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												{/* We could add service icon here if available */}
												<span>
													{(request.serviceName as any)?.fr ||
														(request.service as any)?.name?.fr ||
														"Service"}
												</span>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex flex-col">
												<span className="font-medium">
													{request.user
														? `${request.user.firstName} ${request.user.lastName}`
														: "Utilisateur inconnu"}
												</span>
												<span className="text-xs text-muted-foreground">
													{request.user?.email}
												</span>
											</div>
										</TableCell>
										<TableCell>
											{request.submittedAt
												? new Date(request.submittedAt).toLocaleDateString()
												: "-"}
										</TableCell>
										<TableCell>
											<Badge
												variant={getStatusBadgeVariant(request.status) as any}
											>
												{getStatusLabel(request.status)}
											</Badge>
										</TableCell>
										<TableCell className="text-right">
											<Button size="sm" variant="ghost" asChild>
												<Link
													to="/dashboard/requests/$requestId"
													params={{ requestId: request._id }}
												>
													Gérer
												</Link>
											</Button>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
