"use client";

import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
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
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useConvexMutationQuery } from "@/integrations/convex/hooks";

interface UserRoleDialogProps {
	user: Doc<"users">;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function UserRoleDialog({
	user,
	open,
	onOpenChange,
}: UserRoleDialogProps) {
	const { t } = useTranslation();
	const [selectedRole, setSelectedRole] = useState<"user" | "superadmin">(
		((user as any).role as "user" | "superadmin") || "user",
	);

	const { mutate: updateRole, isPending } = useConvexMutationQuery(
		api.functions.admin.updateUserRole,
	);

	const userName =
		user.firstName && user.lastName
			? `${user.firstName} ${user.lastName}`
			: user.email;

	const handleConfirm = async () => {
		try {
			await updateRole({ userId: user._id, role: selectedRole as any });
			toast.success(`${t("superadmin.users.actions.editRole")} ✓`);
			onOpenChange(false);
		} catch (error) {
			toast.error(t("superadmin.common.error"));
		}
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{t("superadmin.users.roleDialog.title")}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{t("superadmin.users.roleDialog.description", { name: userName })}
					</AlertDialogDescription>
				</AlertDialogHeader>

				<div className="py-4">
					<Label htmlFor="role-select" className="mb-2 block">
						{t("superadmin.users.columns.role")}
					</Label>
					<Select
						value={selectedRole}
						onValueChange={(value) =>
							setSelectedRole(value as "user" | "superadmin")
						}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="user">
								{t("superadmin.users.roles.user")}
							</SelectItem>
							<SelectItem value="superadmin">
								{t("superadmin.users.roles.superadmin")}
							</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>
						{t("superadmin.users.roleDialog.cancel")}
					</AlertDialogCancel>
					<AlertDialogAction onClick={handleConfirm} disabled={isPending}>
						{isPending
							? t("superadmin.common.loading")
							: t("superadmin.users.roleDialog.confirm")}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
