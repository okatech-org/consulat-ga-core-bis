import { useClerk, useSignIn, useUser } from "@clerk/clerk-react";
import { Bug, Loader2, LogIn, UserCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DevAccount {
	label: string;
	email: string;
	password: string;
	org?: string;
}

interface OrgGroup {
	org: string;
	accounts: DevAccount[];
}

function parseDevAccounts(): DevAccount[] {
	try {
		const raw = import.meta.env.VITE_DEV_ACCOUNTS;
		if (!raw) return [];
		return JSON.parse(raw) as DevAccount[];
	} catch {
		console.warn("[DevAccountSwitcher] Failed to parse VITE_DEV_ACCOUNTS");
		return [];
	}
}

/** Group accounts by their `org` field, preserving insertion order */
function groupByOrg(accounts: DevAccount[]): OrgGroup[] {
	const map = new Map<string, DevAccount[]>();
	for (const a of accounts) {
		const key = a.org ?? "Autres";
		if (!map.has(key)) map.set(key, []);
		map.get(key)!.push(a);
	}
	return Array.from(map, ([org, accounts]) => ({ org, accounts }));
}

export function DevAccountSwitcher() {
	if (!import.meta.env.DEV) return null;

	const accounts = parseDevAccounts();
	if (accounts.length === 0) return null;

	return <DevAccountSwitcherInner accounts={accounts} />;
}

function DevAccountSwitcherInner({ accounts }: { accounts: DevAccount[] }) {
	const { signIn, setActive } = useSignIn();
	const { signOut } = useClerk();
	const { user } = useUser();
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const groups = useMemo(() => groupByOrg(accounts), [accounts]);

	const handleSignIn = async (account: DevAccount) => {
		if (!signIn || !setActive) return;

		setLoading(account.email);
		setError(null);

		try {
			if (user) {
				await signOut();
			}

			const result = await signIn.create({
				identifier: account.email,
				password: account.password,
			});

			if (result.status === "complete" && result.createdSessionId) {
				await setActive({ session: result.createdSessionId });
				setOpen(false);
				toast.success(`Connecté en tant que ${account.label}`, {
					description: account.email,
				});
			} else {
				setError(`Connexion incomplète (status: ${result.status})`);
			}
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : "Erreur de connexion";
			setError(message);
			toast.error("Échec de connexion", { description: message });
		} finally {
			setLoading(null);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<button
					type="button"
					className="fixed bottom-4 left-4 z-[9999] flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-2 text-xs font-bold text-black shadow-lg transition-all hover:bg-amber-400 hover:scale-105 active:scale-95"
					title="Dev Account Switcher"
				>
					<Bug className="size-4" />
					<span>DEV</span>
				</button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-md p-0">
				<DialogHeader className="px-5 pt-5 pb-0">
					<DialogTitle className="flex items-center gap-2">
						<Bug className="size-5 text-amber-500" />
						Dev Account Switcher
					</DialogTitle>
					<DialogDescription>
						Connexion rapide aux comptes de test.
						{user && (
							<span className="mt-1 block text-xs text-emerald-500">
								Connecté : {user.primaryEmailAddress?.emailAddress}
							</span>
						)}
					</DialogDescription>
				</DialogHeader>

				{error && (
					<div className="mx-5 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
						{error}
					</div>
				)}

				<ScrollArea className="max-h-[60vh]">
					<div className="flex flex-col gap-1 px-5 pb-5">
						{groups.map((group, gi) => (
							<div key={group.org}>
								{/* Org header */}
								<div
									className={`sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2 text-xs font-semibold text-muted-foreground tracking-wide ${gi > 0 ? "mt-2 border-t border-border pt-3" : ""}`}
								>
									{group.org}
								</div>

								{/* Accounts in this org */}
								<div className="flex flex-col gap-1">
									{group.accounts.map((account) => {
										const isCurrentUser =
											user?.primaryEmailAddress?.emailAddress === account.email;
										const isLoading = loading === account.email;

										return (
											<button
												type="button"
												key={account.email}
												disabled={isLoading || isCurrentUser}
												onClick={() => handleSignIn(account)}
												className={`group flex items-center gap-3 rounded-lg border p-2.5 text-left transition-all ${
													isCurrentUser
														? "border-emerald-500/30 bg-emerald-500/10 cursor-default"
														: "border-border hover:border-amber-500/50 hover:bg-amber-500/5 cursor-pointer"
												}`}
											>
												<div
													className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
														isCurrentUser
															? "bg-emerald-500/20 text-emerald-500"
															: "bg-muted text-muted-foreground group-hover:bg-amber-500/20 group-hover:text-amber-500"
													}`}
												>
													<UserCircle className="size-4" />
												</div>

												<div className="flex-1 min-w-0">
													<div className="font-medium text-sm leading-tight">
														{account.label}
														{isCurrentUser && (
															<span className="ml-2 text-xs text-emerald-500">
																● actif
															</span>
														)}
													</div>
													<div className="text-[11px] text-muted-foreground truncate">
														{account.email}
													</div>
												</div>

												{!isCurrentUser && (
													<div className="shrink-0">
														{isLoading ? (
															<Loader2 className="size-4 animate-spin text-amber-500" />
														) : (
															<LogIn className="size-4 text-muted-foreground group-hover:text-amber-500 transition-colors" />
														)}
													</div>
												)}
											</button>
										);
									})}
								</div>
							</div>
						))}
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
