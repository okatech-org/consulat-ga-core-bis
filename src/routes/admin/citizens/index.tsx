import { api } from "@convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Mail, Search, Users } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useOrg } from "@/components/org/org-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuthenticatedConvexQuery } from "@/integrations/convex/hooks";

export const Route = createFileRoute("/admin/citizens/")({
	component: DashboardCitizens,
});

function DashboardCitizens() {
	const { activeOrgId } = useOrg();
	const { t } = useTranslation();
	const [searchQuery, setSearchQuery] = useState("");
	const debouncedSearch = useDebounce(searchQuery, 300);

	const { data: citizens } = useAuthenticatedConvexQuery(
		api.functions.users.listByOrg,
		activeOrgId
			? { orgId: activeOrgId, search: debouncedSearch || undefined }
			: "skip",
	);

	return (
		<div className="flex flex-1 flex-col gap-4 p-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						{t("dashboard.citizens.title")}
					</h1>
					<p className="text-muted-foreground">
						{t("dashboard.citizens.description")}
					</p>
				</div>
			</div>

			<Card>
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<CardTitle className="flex items-center gap-2">
								<Users className="h-5 w-5" />
								{t("dashboard.citizens.listTitle")}
							</CardTitle>
							<CardDescription>
								{t("dashboard.citizens.listDescription")}
							</CardDescription>
						</div>
						<div className="relative w-64">
							<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder={t("dashboard.citizens.searchPlaceholder")}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-8"
							/>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>{t("dashboard.citizens.columns.user")}</TableHead>
								<TableHead>{t("dashboard.citizens.columns.email")}</TableHead>
								<TableHead>{t("dashboard.citizens.columns.joined")}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{citizens === undefined ? (
								<TableRow>
									<TableCell colSpan={3} className="h-24 text-center">
										<div className="flex justify-center items-center gap-2">
											<Loader2 className="h-4 w-4 animate-spin" />
											{t("common.loading")}
										</div>
									</TableCell>
								</TableRow>
							) : citizens.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={3}
										className="h-24 text-center text-muted-foreground"
									>
										{t("dashboard.citizens.noCitizens")}
									</TableCell>
								</TableRow>
							) : (
								citizens.map((user) => (
									<TableRow key={user._id} className="hover:bg-muted/50">
										<TableCell>
											<div className="flex items-center gap-3">
												<Avatar className="h-8 w-8">
													<AvatarImage src={user.avatarUrl} />
													<AvatarFallback>
														{user.name?.[0]?.toUpperCase()}
													</AvatarFallback>
												</Avatar>
												<span className="font-medium">{user.name}</span>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2 text-muted-foreground">
												<Mail className="h-3 w-3" />
												{user.email}
											</div>
										</TableCell>
										<TableCell>
											{new Date(user._creationTime).toLocaleDateString()}
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
