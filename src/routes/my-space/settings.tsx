import { createFileRoute } from "@tanstack/react-router";
import { Bell, Globe, Moon, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/my-space/settings")({
	component: SettingsPage,
});

function SettingsPage() {
	const { t } = useTranslation();
	const { theme, setTheme } = useTheme();

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

			{/* Display Settings */}
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

			{/* Language Settings */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2, delay: 0.1 }}
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
				transition={{ duration: 0.2, delay: 0.15 }}
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
		</div>
	);
}
