import { Link } from "@tanstack/react-router";
import { User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/hooks/use-user-data";
import { authClient } from "@/lib/auth-client";

export default function HeaderUser() {
	const { t } = useTranslation();
	const { isAgent, isSuperAdmin } = useUserData();
	const { data: session, isPending } = authClient.useSession();

	function getMySpacePath() {
		if (isSuperAdmin) return "/dashboard";
		if (isAgent) return "/admin";
		return "/my-space";
	}

	if (isPending) return null;

	return (
		<div className="flex items-center gap-2">
			{session ? (
				<>
					<Button asChild variant="ghost" size="sm">
						<Link to={getMySpacePath()}>
							<User className="w-4 h-4 mr-2" />
							{t("header.nav.mySpace")}
						</Link>
					</Button>
				</>
			) : (
				<Button asChild variant="ghost" size="sm">
					<Link to="/sign-in/$" params={{}}>
						{t("header.nav.signIn")}
					</Link>
				</Button>
			)}
		</div>
	);
}
