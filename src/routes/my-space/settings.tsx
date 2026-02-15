import { useClerk } from "@clerk/clerk-react";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, Globe, LogOut, Moon, Palette, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { type ConsularTheme, useConsularTheme } from "@/hooks/useConsularTheme";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/my-space/settings")({
	component: SettingsPage,
});

/* -------------------------------------------------- */
/*  Theme preview thumbnails                          */
/* -------------------------------------------------- */

function ThemePreview({
	themeId,
	label,
	description,
	isActive,
	onClick,
}: {
	themeId: ConsularTheme;
	label: string;
	description: string;
	isActive: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer w-full text-left",
				isActive
					? "border-primary bg-primary/5 ring-2 ring-primary/20"
					: "border-border hover:border-muted-foreground/30 hover:bg-muted/30",
			)}
		>
			{/* Mini preview card */}
			<div
				className={cn(
					"w-16 h-12 rounded-lg overflow-hidden relative shrink-0",
					themeId === "default"
						? "bg-card border border-border"
						: "bg-[oklch(0.92_0.005_250)]",
				)}
			>
				{themeId === "default" ? (
					<div className="p-1.5 space-y-1">
						<div className="h-1.5 w-5 bg-primary/20 rounded" />
						<div className="h-2.5 bg-muted rounded border border-border" />
						<div className="flex gap-0.5">
							<div className="h-2 flex-1 bg-muted rounded border border-border" />
							<div className="h-2 flex-1 bg-muted rounded border border-border" />
						</div>
					</div>
				) : (
					<div className="p-1.5 space-y-1">
						<div className="h-1.5 w-5 bg-primary/20 rounded" />
						<div
							className="h-2.5 rounded"
							style={{
								background: "oklch(0.92 0.005 250)",
								boxShadow:
									"2px 2px 4px oklch(0.7 0.01 250 / 0.35), -2px -2px 4px oklch(1 0 0 / 0.7)",
							}}
						/>
						<div className="flex gap-0.5">
							<div
								className="h-2 flex-1 rounded"
								style={{
									background: "oklch(0.92 0.005 250)",
									boxShadow:
										"2px 2px 4px oklch(0.7 0.01 250 / 0.35), -2px -2px 4px oklch(1 0 0 / 0.7)",
								}}
							/>
							<div
								className="h-2 flex-1 rounded"
								style={{
									background: "oklch(0.92 0.005 250)",
									boxShadow:
										"2px 2px 4px oklch(0.7 0.01 250 / 0.35), -2px -2px 4px oklch(1 0 0 / 0.7)",
								}}
							/>
						</div>
					</div>
				)}
			</div>

			{/* Label + description */}
			<div className="flex-1 min-w-0">
				<p className="text-sm font-semibold">{label}</p>
				<p className="text-xs text-muted-foreground leading-tight truncate">
					{description}
				</p>
			</div>

			{/* Active indicator dot */}
			{isActive && <div className="w-3 h-3 rounded-full bg-primary shrink-0" />}
		</button>
	);
}

/* -------------------------------------------------- */
/*  Settings Page                                     */
/* -------------------------------------------------- */

function SettingsPage() {
	const { t } = useTranslation();
	const { theme, setTheme } = useTheme();
	const { consularTheme, setConsularTheme } = useConsularTheme();
	const { signOut } = useClerk();
	const [showLogoutDialog, setShowLogoutDialog] = useState(false);

	return (
		<div className="space-y-6 p-1">
			{/* Page title */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2 }}
			>
				<h1 className="text-2xl font-bold">
					{t("mySpace.screens.settings.heading", "Paramètres")}
				</h1>
				<p className="text-muted-foreground text-sm mt-1">
					{t(
						"mySpace.screens.settings.subtitle",
						"Personnalisez votre expérience",
					)}
				</p>
			</motion.div>

			{/* Notifications Settings */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2 }}
			>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Bell className="size-5" />
							{t("settings.notifications.title", "Notifications")}
						</CardTitle>
						<CardDescription>
							{t(
								"settings.notifications.description",
								"Gérez vos préférences de notifications.",
							)}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>
									{t("settings.notifications.email", "Notifications par email")}
								</Label>
								<p className="text-sm text-muted-foreground">
									{t(
										"settings.notifications.emailDesc",
										"Recevez des emails pour les mises à jour importantes.",
									)}
								</p>
							</div>
							<Switch defaultChecked />
						</div>
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>
									{t("settings.notifications.push", "Notifications push")}
								</Label>
								<p className="text-sm text-muted-foreground">
									{t(
										"settings.notifications.pushDesc",
										"Recevez des notifications sur votre appareil.",
									)}
								</p>
							</div>
							<Switch defaultChecked />
						</div>
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>
									{t("settings.notifications.sms", "Notifications SMS")}
								</Label>
								<p className="text-sm text-muted-foreground">
									{t(
										"settings.notifications.smsDesc",
										"Recevez des SMS pour les rendez-vous.",
									)}
								</p>
							</div>
							<Switch />
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Display Settings — Dark Mode */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2, delay: 0.05 }}
			>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Moon className="size-5" />
							{t("settings.display.title", "Affichage")}
						</CardTitle>
						<CardDescription>
							{t(
								"settings.display.description",
								"Personnalisez l'apparence de l'application.",
							)}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>{t("settings.display.darkMode", "Mode sombre")}</Label>
								<p className="text-sm text-muted-foreground">
									{t(
										"settings.display.darkModeDesc",
										"Activez le thème sombre pour réduire la fatigue visuelle.",
									)}
								</p>
							</div>
							<Switch
								checked={theme === "dark"}
								onCheckedChange={(checked) =>
									setTheme(checked ? "dark" : "light")
								}
							/>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Consular Theme Selector */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2, delay: 0.1 }}
			>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Palette className="size-5" />
							{t(
								"settings.consularTheme.title",
								"Thème de l'espace consulaire",
							)}
						</CardTitle>
						<CardDescription>
							{t(
								"settings.consularTheme.description",
								"Choisissez le style visuel de votre espace MySpace.",
							)}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<ThemePreview
								themeId="default"
								label={t("settings.consularTheme.default", "Classique")}
								description={t(
									"settings.consularTheme.defaultDesc",
									"Style plat et moderne",
								)}
								isActive={consularTheme === "default"}
								onClick={() => setConsularTheme("default")}
							/>
							<ThemePreview
								themeId="homeomorphism"
								label={t("settings.consularTheme.homeomorphism", "Homorphisme")}
								description={t(
									"settings.consularTheme.homeomorphismDesc",
									"Surfaces en relief et ombres douces",
								)}
								isActive={consularTheme === "homeomorphism"}
								onClick={() => setConsularTheme("homeomorphism")}
							/>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Language Settings */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2, delay: 0.15 }}
			>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Globe className="size-5" />
							{t("settings.language.title", "Langue")}
						</CardTitle>
						<CardDescription>
							{t(
								"settings.language.description",
								"Choisissez la langue de l'interface.",
							)}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">
							{t("settings.language.current", "Langue actuelle : Français")}
						</p>
					</CardContent>
				</Card>
			</motion.div>

			{/* Privacy Settings */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2, delay: 0.2 }}
			>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Shield className="size-5" />
							{t("settings.privacy.title", "Confidentialité")}
						</CardTitle>
						<CardDescription>
							{t(
								"settings.privacy.description",
								"Gérez vos paramètres de confidentialité.",
							)}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>{t("settings.privacy.analytics", "Analytiques")}</Label>
								<p className="text-sm text-muted-foreground">
									{t(
										"settings.privacy.analyticsDesc",
										"Aidez-nous à améliorer l'application en partageant des données anonymes.",
									)}
								</p>
							</div>
							<Switch defaultChecked />
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Account / Logout */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2, delay: 0.25 }}
			>
				<Card className="border-destructive/20">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<LogOut className="size-5" />
							{t("settings.account.title", "Compte")}
						</CardTitle>
						<CardDescription>
							{t("settings.account.description", "Gérez votre session.")}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							variant="destructive"
							onClick={() => setShowLogoutDialog(true)}
						>
							<LogOut className="mr-2 size-4" />
							{t("common.logout", "Déconnexion")}
						</Button>
					</CardContent>
				</Card>
			</motion.div>

			<AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{t("common.logoutConfirmTitle", "Se déconnecter ?")}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{t(
								"common.logoutConfirmDescription",
								"Vous allez être déconnecté de votre session. Vous devrez vous reconnecter pour accéder à votre espace.",
							)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>
							{t("common.cancel", "Annuler")}
						</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							onClick={() => signOut()}
						>
							{t("common.logout", "Déconnexion")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
