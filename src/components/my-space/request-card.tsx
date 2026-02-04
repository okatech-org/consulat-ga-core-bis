import type { Id } from "@convex/_generated/dataModel";
import type { RequestStatus } from "@convex/lib/constants";
import { RequestStatus as RequestStatusEnum } from "@convex/lib/constants";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowRight, Building2, Calendar, PlayCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getLocalizedValue } from "@/lib/i18n-utils";
import { REQUEST_STATUS_CONFIG } from "@/lib/request-status-config";

export interface RequestCardData {
	_id: Id<"requests">;
	_creationTime: number;
	status: string;
	reference?: string;
	service?: {
		name?: Record<string, string>;
		[key: string]: unknown;
	} | null;
	org?: {
		name?: string;
		[key: string]: unknown;
	} | null;
}

interface RequestCardProps {
	request: RequestCardData;
}

export function RequestCard({ request }: RequestCardProps) {
	const { t, i18n } = useTranslation();

	const getStatusBadge = (status: string) => {
		const typedStatus = status as RequestStatus;
		const config = REQUEST_STATUS_CONFIG[typedStatus];

		return (
			<Badge variant="outline" className={config?.className ?? ""}>
				{config ? t(config.i18nKey, config.fallback) : status}
			</Badge>
		);
	};

	const isDraft = request.status === RequestStatusEnum.Draft;

	return (
		<Link
			to="/my-space/requests/$requestId"
			params={{ requestId: request._id }}
			className="block group h-full"
		>
			<Card className="h-full flex flex-col hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
				<CardHeader className="pb-3">
					<div className="flex items-start justify-between gap-2">
						<div className="flex-1 min-w-0">
							<h3 className="font-semibold truncate group-hover:text-primary transition-colors">
								{getLocalizedValue(
									request.service?.name as
										| { fr: string; en?: string }
										| undefined,
									i18n.language,
								) || t("requests.unknownService", "Service inconnu")}
							</h3>
							<p className="text-sm text-muted-foreground truncate flex items-center gap-1 mt-1">
								<Building2 className="h-3 w-3 shrink-0" />
								{request.org?.name || t("requests.unknownOrg", "Organisme")}
							</p>
						</div>
						{getStatusBadge(request.status)}
					</div>
				</CardHeader>
				<CardContent className="pt-0 flex-1 flex flex-col justify-end">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4 text-sm text-muted-foreground">
							<span className="flex items-center gap-1">
								<Calendar className="h-3.5 w-3.5" />
								{format(new Date(request._creationTime), "dd MMM yyyy", {
									locale: fr,
								})}
							</span>
							{request.reference && (
								<span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
									{request.reference}
								</span>
							)}
						</div>
						<ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
					</div>
					{isDraft && (
						<Button size="sm" className="w-full mt-3">
							<PlayCircle className="mr-2 h-4 w-4" />
							{t("requests.resumeDraft", "Reprendre la demande")}
						</Button>
					)}
				</CardContent>
			</Card>
		</Link>
	);
}
