import { createFileRoute } from "@tanstack/react-router";
import { Bell, Globe, Moon, Shield } from "lucide-react";
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

	return (
		<div className="space-y-6 animate-in fade-in">
			{/* Notifications Settings */}
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

			{/* Display Settings */}
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
						<Switch />
					</div>
				</CardContent>
			</Card>

			{/* Language Settings */}
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

			{/* Privacy Settings */}
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
		</div>
	);
}
