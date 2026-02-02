import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { FileText, Plus, Settings2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useAuthenticatedConvexQuery } from "@/integrations/convex/hooks";

export const Route = createFileRoute("/admin/services/")({
	component: DashboardServices,
});

function DashboardServices() {
	const { activeOrgId } = useOrg();
	const navigate = useNavigate();
	const { t } = useTranslation();
	const [addDialogOpen, setAddDialogOpen] = useState(false);
	const [selectedService, setSelectedService] = useState<string>("");
	const [activationForm, setActivationForm] = useState({
		fee: 0,
		currency: "XAF",
	})

	const { data: orgServices } = useAuthenticatedConvexQuery(
		api.functions.services.listByOrg,
		activeOrgId ? { orgId: activeOrgId, activeOnly: false } : "skip",
	)

	const { data: catalogServices } = useAuthenticatedConvexQuery(
		api.functions.services.listCatalog,
		{},
	)

	const toggleActive = useMutation(
		api.functions.services.toggleOrgServiceActive,
	)
	const activateService = useMutation(api.functions.services.activateForOrg);

	// Services not yet activated for this org
	const activatedServiceIds = orgServices?.map((s) => s.serviceId) || [];
	const availableServices =
		catalogServices?.filter((s) => !activatedServiceIds.includes(s._id)) || [];

	const handleToggle = async (service: any) => {
		if (!activeOrgId) return;

		if (!service.isActive && !service.pricing) {
			toast.info(t("dashboard.services.configureFirst"));
			navigate({
				to: "/admin/services/$serviceId/edit",
				params: { serviceId: service._id },
			})
			return
		}

		try {
			await toggleActive({
				orgServiceId: service._id,
			})
			toast.success(t("dashboard.services.statusUpdated"));
		} catch {
			toast.error(t("dashboard.services.updateError"));
		}
	}

	const handleActivateService = async () => {
		if (!selectedService || !activeOrgId) return;

		try {
			await activateService({
				orgId: activeOrgId,
				serviceId: selectedService as Id<"services">,
				pricing: {
					amount: activationForm.fee,
					currency: activationForm.currency,
				},
			})
			toast.success(t("dashboard.services.activated"));
			setAddDialogOpen(false);
			setSelectedService("");
			setActivationForm({ fee: 0, currency: "XAF" });
		} catch (error: any) {
			toast.error(t(error.message) || t("dashboard.services.updateError"));
		}
	}

	if (!orgServices) {
		return (
			<div className="p-4 space-y-4">
				<Skeleton className="h-8 w-64" />
				<Skeleton className="h-[400px] w-full" />
			</div>
		)
	}

	return (
		<>
			<div className="flex flex-1 flex-col gap-4 p-4">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold tracking-tight">
							{t("dashboard.services.title")}
						</h1>
						<p className="text-muted-foreground">
							{t("dashboard.services.description")}
						</p>
					</div>
					<Button
						onClick={() => setAddDialogOpen(true)}
						disabled={availableServices.length === 0}
					>
						<Plus className="mr-2 h-4 w-4" />
						{t("dashboard.services.activate")}
					</Button>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<FileText className="h-5 w-5" />
							{t("dashboard.services.listTitle")}
						</CardTitle>
						<CardDescription>
							{t("dashboard.services.listDescription")}
						</CardDescription>
					</CardHeader>
					<CardContent>
						{orgServices.length === 0 ? (
							<div className="text-center py-12">
								<FileText className="mx-auto h-12 w-12 text-muted-foreground" />
								<h3 className="mt-4 text-lg font-semibold">
									{t("dashboard.services.empty.title")}
								</h3>
								<p className="text-muted-foreground mt-2">
									{t("dashboard.services.empty.description")}
								</p>
								<Button
									className="mt-4"
									onClick={() => setAddDialogOpen(true)}
									disabled={availableServices.length === 0}
								>
									<Plus className="mr-2 h-4 w-4" />
									{t("dashboard.services.activate")}
								</Button>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>
											{t("dashboard.services.columns.service")}
										</TableHead>
										<TableHead>
											{t("dashboard.services.columns.category")}
										</TableHead>
										<TableHead>{t("dashboard.services.columns.fee")}</TableHead>
										<TableHead>
											{t("dashboard.services.columns.status")}
										</TableHead>
										<TableHead className="text-right">
											{t("dashboard.services.configure")}
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{orgServices.map((item) => (
										<TableRow key={item._id}>
											<TableCell className="font-medium">
												<div className="flex flex-col">
													<span>
														{typeof item.name === "string"
															? item.name
															: item.name?.fr || "Service"}
													</span>
												</div>
											</TableCell>
											<TableCell>
												<Badge variant="secondary" className="capitalize">
													{item.category?.replace("_", " ")}
												</Badge>
											</TableCell>
											<TableCell>
												<span>
													{item.pricing?.amount} {item.pricing?.currency}
												</span>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<Switch
														checked={item.isActive}
														onCheckedChange={() => handleToggle(item)}
													/>
													<span className="text-sm text-muted-foreground">
														{item.isActive
															? t("superadmin.common.active")
															: t("superadmin.common.inactive")}
													</span>
												</div>
											</TableCell>
											<TableCell className="text-right">
												<Button variant="ghost" size="sm" asChild>
													<Link
														to="/admin/services/$serviceId/edit"
														params={{ serviceId: item._id }}
													>
														<Settings2 className="mr-2 h-4 w-4" />
														{t("dashboard.services.configure")}
													</Link>
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Add Service Dialog */}
			<Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("dashboard.services.dialog.title")}</DialogTitle>
						<DialogDescription>
							{t("dashboard.services.dialog.description")}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label>{t("dashboard.services.dialog.selectService")}</Label>
							<Select
								value={selectedService}
								onValueChange={setSelectedService}
							>
								<SelectTrigger>
									<SelectValue
										placeholder={t(
											"dashboard.services.dialog.selectPlaceholder",
										)}
									/>
								</SelectTrigger>
								<SelectContent>
									{availableServices.length === 0 ? (
										<div className="p-2 text-center text-muted-foreground">
											{t("dashboard.services.dialog.allActivated")}
										</div>
									) : (
										availableServices.map((service) => (
											<SelectItem key={service._id} value={service._id}>
												{service.name?.fr || "Unknown"}
											</SelectItem>
										))
									)}
								</SelectContent>
							</Select>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>{t("dashboard.services.dialog.fee")}</Label>
								<Input
									type="number"
									value={activationForm.fee}
									onChange={(e) =>
										setActivationForm({
											...activationForm,
											fee: Number(e.target.value),
										})
									}
									min={0}
								/>
							</div>
							<div className="space-y-2">
								<Label>{t("dashboard.services.dialog.currency")}</Label>
								<Select
									value={activationForm.currency}
									onValueChange={(v) =>
										setActivationForm({ ...activationForm, currency: v })
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="XAF">XAF (FCFA)</SelectItem>
										<SelectItem value="EUR">EUR</SelectItem>
										<SelectItem value="USD">USD</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setAddDialogOpen(false)}>
							{t("superadmin.common.cancel")}
						</Button>
						<Button onClick={handleActivateService} disabled={!selectedService}>
							{t("dashboard.services.dialog.submit")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}
