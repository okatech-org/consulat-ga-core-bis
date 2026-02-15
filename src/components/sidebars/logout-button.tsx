"use client";

import { useClerk } from "@clerk/clerk-react";
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
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface LogoutButtonProps {
	/** Tooltip direction — defaults to "top" */
	tooltipSide?: "top" | "right" | "left" | "bottom";
}

/**
 * Small icon button that opens a confirmation dialog before signing out.
 * Designed to sit inline next to user info in sidebar footers.
 */
export function LogoutButton({ tooltipSide = "top" }: LogoutButtonProps) {
	const { t } = useTranslation();
	const { signOut } = useClerk();
	const [open, setOpen] = useState(false);

	return (
		<>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
						onClick={() => setOpen(true)}
					>
						<LogOut className="size-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent side={tooltipSide}>
					{t("common.logout", "Déconnexion")}
				</TooltipContent>
			</Tooltip>

			<AlertDialog open={open} onOpenChange={setOpen}>
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
		</>
	);
}
