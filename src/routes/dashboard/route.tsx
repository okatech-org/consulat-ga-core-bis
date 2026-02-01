import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { OrgProvider, useOrg } from "@/components/org/org-provider";
import { OrgSidebar } from "@/components/org/org-sidebar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";

export const Route = createFileRoute("/dashboard")({
	component: DashboardLayoutWrapper,
});

function DashboardLayoutWrapper() {
	return (
		<OrgProvider>
			<DashboardLayout />
		</OrgProvider>
	);
}

function DashboardLayout() {
	const { isLoading, activeOrg } = useOrg();
	const { t } = useTranslation();

	if (isLoading) {
		return (
			<div className="flex h-screen w-full items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (!activeOrg) {
		return (
			<div className="flex h-screen w-full flex-col items-center justify-center gap-4">
				<h1 className="text-2xl font-bold">{t("dashboard.noAccess.title")}</h1>
				<p className="text-muted-foreground">
					{t("dashboard.noAccess.description")}
				</p>
				<p className="text-sm">{t("dashboard.noAccess.contact")}</p>
			</div>
		);
	}

	return (
		<SidebarProvider>
			<OrgSidebar />
			<SidebarInset>
				<header className="relative flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
					<div className="fixed w-full top-0 py-2 z-50 backdrop-blur-sm flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator orientation="vertical" className="mr-2 h-4" />
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem className="hidden md:block">
									<BreadcrumbLink href="/dashboard">
										{t("dashboard.nav.dashboard")}
									</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator className="hidden md:block" />
								<BreadcrumbItem>
									<BreadcrumbPage>{activeOrg.name}</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>
				<div className="flex-1 overflow-y-auto h-[calc(100svh-4rem)]">
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
