/**
 * InlineAuth — Embedded sign-in / sign-up form for registration wizards.
 *
 * Replaces the old Clerk <SignUp>/<SignIn> embeds so users never leave the
 * multi-step registration flow.  When authentication succeeds the parent's
 * useConvexAuth() will flip isAuthenticated → true and the wizard auto-advances.
 */

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

type AuthMode = "sign-up" | "sign-in";

interface InlineAuthProps {
	/** Which form to show first */
	defaultMode?: AuthMode;
}

export function InlineAuth({ defaultMode = "sign-up" }: InlineAuthProps) {
	const { t } = useTranslation();
	const [mode, setMode] = useState<AuthMode>(defaultMode);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			if (mode === "sign-up") {
				const result = await authClient.signUp.email({
					email,
					password,
					name,
				});
				if (result.error) {
					setError(result.error.message || t("errors.auth.signUpFailed"));
				}
				// On success, useConvexAuth() in parent will detect the new session
			} else {
				const result = await authClient.signIn.email({
					email,
					password,
				});
				if (result.error) {
					setError(result.error.message || t("errors.auth.signInFailed"));
				}
			}
		} catch {
			setError(
				mode === "sign-up"
					? t("errors.auth.signUpFailed")
					: t("errors.auth.signInFailed"),
			);
		} finally {
			setLoading(false);
		}
	};

	const toggleMode = () => {
		setMode(mode === "sign-up" ? "sign-in" : "sign-up");
		setError(null);
	};

	return (
		<div className="w-full max-w-md mx-auto">
			<form
				onSubmit={handleSubmit}
				className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm p-6 space-y-4"
			>
				{error && (
					<div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
						{error}
					</div>
				)}

				{/* Name field — sign-up only */}
				{mode === "sign-up" && (
					<div className="space-y-2">
						<Label
							htmlFor="inline-auth-name"
							className="text-foreground font-medium"
						>
							{t("common.name")}
						</Label>
						<Input
							id="inline-auth-name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder={t(
								"register.inline.namePlaceholder",
								"Prénom et Nom",
							)}
							required
							autoComplete="name"
						/>
					</div>
				)}

				{/* Email */}
				<div className="space-y-2">
					<Label
						htmlFor="inline-auth-email"
						className="text-foreground font-medium"
					>
						{t("common.email")}
					</Label>
					<Input
						id="inline-auth-email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="email@example.com"
						required
						autoComplete="email"
					/>
				</div>

				{/* Password */}
				<div className="space-y-2">
					<Label
						htmlFor="inline-auth-password"
						className="text-foreground font-medium"
					>
						{t("common.password")}
					</Label>
					<Input
						id="inline-auth-password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						autoComplete={
							mode === "sign-up" ? "new-password" : "current-password"
						}
					/>
				</div>

				{/* Submit */}
				<Button
					type="submit"
					className="w-full bg-[#009639] hover:bg-[#007a2f] text-white font-medium"
					disabled={loading}
				>
					{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					{mode === "sign-up"
						? t("errors.auth.createAccount")
						: t("header.nav.signIn")}
				</Button>

				{/* Toggle mode */}
				<div className="text-center text-sm text-muted-foreground">
					{mode === "sign-up"
						? t("errors.auth.alreadyHaveAccount")
						: t("errors.auth.noAccount")}{" "}
					<button
						type="button"
						onClick={toggleMode}
						className="text-[#009639] hover:text-[#007a2f] font-medium underline-offset-4 hover:underline"
					>
						{mode === "sign-up"
							? t("header.nav.signIn")
							: t("errors.auth.createAccount")}
					</button>
				</div>
			</form>
		</div>
	);
}
