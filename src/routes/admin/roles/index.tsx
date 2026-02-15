import { createFileRoute } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { OrgRolesPanel } from "@/components/admin/org-roles-panel";
import { useOrg } from "@/components/org/org-provider";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/roles/")({
	component: AdminRolesPage,
});

function AdminRolesPage() {
	const { t } = useTranslation();
	const { activeOrgId, activeOrg, isLoading } = useOrg();

	if (isLoading) {
		return (
			<div className="flex flex-1 flex-col gap-4 p-4 pt-6">
				<Skeleton className="h-8 w-64" />
				<Skeleton className="h-32" />
				<Skeleton className="h-48" />
			</div>
		);
	}

	if (!activeOrgId) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
				<Shield className="h-16 w-16 text-muted-foreground/30" />
				<p className="text-muted-foreground">{t("admin.roles.noOrg")}</p>
			</div>
		);
	}

	return (
		<div className="flex flex-1 flex-col gap-6 p-4 pt-6">
			<OrgRolesPanel
				orgId={activeOrgId}
				orgType={activeOrg?.type ?? "consulate"}
			/>
		</div>
	);
}
