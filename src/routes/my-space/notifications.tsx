import { createFileRoute } from "@tanstack/react-router";
import { Bell, Construction } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/my-space/notifications")({
	component: NotificationsPage,
});

function NotificationsPage() {
	const { t } = useTranslation();

	return (
		<div className="space-y-6 p-1">
			{/* Page title */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2 }}
			>
				<h1 className="text-2xl font-bold">
					{t("mySpace.screens.notifications.heading", "Notifications")}
				</h1>
				<p className="text-muted-foreground text-sm mt-1">
					{t(
						"mySpace.screens.notifications.subtitle",
						"Restez informé de vos activités",
					)}
				</p>
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2 }}
			>
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-16 text-center">
						<div className="relative mb-6">
							<Bell className="h-16 w-16 text-muted-foreground/30" />
							<Construction className="h-8 w-8 text-amber-500 absolute -bottom-1 -right-1" />
						</div>
						<h3 className="text-lg font-medium mb-2">
							{t(
								"notifications.comingSoon.title",
								"Notifications bientôt disponibles",
							)}
						</h3>
						<p className="text-sm text-muted-foreground max-w-sm">
							{t(
								"notifications.comingSoon.description",
								"Cette fonctionnalité est en cours de développement. Vous serez bientôt notifié des mises à jour de vos demandes et rendez-vous.",
							)}
						</p>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}
