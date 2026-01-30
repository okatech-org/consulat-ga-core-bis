import { createFileRoute } from "@tanstack/react-router";
import { BellOff, Calendar, CheckCircle, FileText, Info } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/my-space/notifications")({
	component: NotificationsPage,
});

// Mock notifications for now
const mockNotifications = [
	{
		id: "1",
		type: "request",
		title: "Demande mise à jour",
		message: "Votre demande de passeport a été traitée.",
		date: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
		read: false,
		icon: FileText,
	},
	{
		id: "2",
		type: "appointment",
		title: "Rappel de rendez-vous",
		message: "Votre rendez-vous est prévu demain à 10h00.",
		date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
		read: false,
		icon: Calendar,
	},
	{
		id: "3",
		type: "info",
		title: "Bienvenue!",
		message: "Votre compte a été créé avec succès.",
		date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
		read: true,
		icon: Info,
	},
];

function NotificationsPage() {
	const { t } = useTranslation();

	const unreadCount = mockNotifications.filter((n) => !n.read).length;

	const formatDate = (date: Date) => {
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const minutes = Math.floor(diff / (1000 * 60));
		const hours = Math.floor(diff / (1000 * 60 * 60));
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));

		if (minutes < 60) {
			return t("notifications.time.minutesAgo", "Il y a {{count}} min", {
				count: minutes,
			});
		}
		if (hours < 24) {
			return t("notifications.time.hoursAgo", "Il y a {{count}}h", {
				count: hours,
			});
		}
		return t("notifications.time.daysAgo", "Il y a {{count}} jour(s)", {
			count: days,
		});
	};

	return (
		<div className="space-y-6 p-1">
			{/* Header with actions */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2 }}
				className="flex items-center justify-between"
			>
				<div className="flex items-center gap-2">
					{unreadCount > 0 && (
						<Badge variant="secondary">
							{t("notifications.unread", "{{count}} non lue(s)", {
								count: unreadCount,
							})}
						</Badge>
					)}
				</div>
				<Button variant="outline" size="sm">
					<CheckCircle className="mr-2 size-4" />
					{t("notifications.markAllRead", "Tout marquer comme lu")}
				</Button>
			</motion.div>

			{/* Notifications list */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2, delay: 0.1 }}
			>
				{mockNotifications.length === 0 ? (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-16 text-center">
							<BellOff className="h-16 w-16 mb-4 text-muted-foreground/30" />
							<h3 className="text-lg font-medium mb-2">
								{t("notifications.empty.title", "Aucune notification")}
							</h3>
							<p className="text-sm text-muted-foreground max-w-sm">
								{t(
									"notifications.empty.description",
									"Vous n'avez pas encore de notifications.",
								)}
							</p>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-3">
						{mockNotifications.map((notification) => (
							<Card
								key={notification.id}
								className={
									notification.read ? "opacity-60" : "border-primary/20"
								}
							>
								<CardContent className="flex items-start gap-4 p-4">
									<div
										className={`p-2 rounded-full ${
											notification.read ? "bg-muted" : "bg-primary/10"
										}`}
									>
										<notification.icon
											className={`size-5 ${
												notification.read
													? "text-muted-foreground"
													: "text-primary"
											}`}
										/>
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-start justify-between gap-2">
											<div>
												<h4 className="font-medium text-sm">
													{notification.title}
												</h4>
												<p className="text-sm text-muted-foreground mt-0.5">
													{notification.message}
												</p>
											</div>
											{!notification.read && (
												<div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
											)}
										</div>
										<p className="text-xs text-muted-foreground mt-2">
											{formatDate(notification.date)}
										</p>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</motion.div>
		</div>
	);
}
