import {
	SignedIn,
	SignedOut,
	SignInButton,
	UserButton,
} from "@clerk/clerk-react";
import { Link } from "@tanstack/react-router";
import { User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/hooks/use-user-data";

export default function HeaderUser() {
	const { t } = useTranslation();
	const { isAgent, isSuperAdmin } = useUserData();

	function getMySpacePath() {
		if (isSuperAdmin) return "/dashboard";
		if (isAgent) return "/admin";
		return "/my-space";
	}

	return (
		<div className="flex items-center gap-2">
			<SignedIn>
				<Button asChild variant="ghost" size="sm">
					<Link to={getMySpacePath()}>
						<User className="w-4 h-4 mr-2" />
						{t("header.nav.mySpace")}
					</Link>
				</Button>
				<UserButton />
			</SignedIn>
			<SignedOut>
				<SignInButton mode="modal">
					<Button variant="ghost" size="sm">
						{t("header.nav.signIn")}
					</Button>
				</SignInButton>
			</SignedOut>
		</div>
	);
}
