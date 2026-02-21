import { createFileRoute } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/dashboard/settings/")({
	component: SettingsPage,
});

function SettingsPage() {
	const { t } = useTranslation();

	const [showLogoutDialog, setShowLogoutDialog] = useState(false);

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						{t("superadmin.settings.title")}
					</h1>
					<p className="text-muted-foreground">
						{t("superadmin.settings.description")}
					</p>
				</div>
			</div>

			<Tabs defaultValue="general" className="space-y-4">
				<TabsList>
					<TabsTrigger value="general">
						{t("superadmin.settings.tabs.general")}
					</TabsTrigger>
					<TabsTrigger value="notifications">
						{t("superadmin.settings.tabs.notifications")}
					</TabsTrigger>
					<TabsTrigger value="security">
						{t("superadmin.settings.tabs.security")}
					</TabsTrigger>
				</TabsList>
				<TabsContent value="general" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>{t("superadmin.settings.general.title")}</CardTitle>
							<CardDescription>
								{t("superadmin.settings.general.description")}
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid gap-2">
								<Label htmlFor="siteName">Site Name</Label>
								<Input id="siteName" defaultValue="Consulat.ga" />
							</div>
							<div className="grid gap-2">
								<Label htmlFor="adminEmail">Admin Email</Label>
								<Input
									id="adminEmail"
									type="email"
									defaultValue="admin@consulat.ga"
								/>
							</div>
							<Button>{t("superadmin.common.save")}</Button>
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value="notifications">
					<Card>
						<CardHeader>
							<CardTitle>
								{t("superadmin.settings.notifications.title")}
							</CardTitle>
							<CardDescription>
								{t("superadmin.settings.notifications.description")}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">
								{t("superadmin.common.comingSoon")}
							</p>
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value="security">
					<Card>
						<CardHeader>
							<CardTitle>{t("superadmin.settings.security.title")}</CardTitle>
							<CardDescription>
								{t("superadmin.settings.security.description")}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">
								{t("superadmin.common.comingSoon")}
							</p>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Account / Logout */}
			<Card className="border-destructive/20">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<LogOut className="h-5 w-5" />
						{t("settings.account.title")}
					</CardTitle>
					<CardDescription>{t("settings.account.description")}</CardDescription>
				</CardHeader>
				<CardContent>
					<Button
						variant="destructive"
						onClick={() => setShowLogoutDialog(true)}
					>
						<LogOut className="mr-2 h-4 w-4" />
						{t("common.logout")}
					</Button>
				</CardContent>
			</Card>

			<AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{t("common.logoutConfirmTitle")}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{t(
								"common.logoutConfirmDescription",
								"Vous allez être déconnecté de votre session. Vous devrez vous reconnecter pour accéder à votre espace.",
							)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							onClick={() => authClient.signOut()}
						>
							{t("common.logout")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
