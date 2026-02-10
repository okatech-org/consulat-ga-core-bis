import { useState } from "react";
import { useSignIn, useClerk, useUser } from "@clerk/clerk-react";
import { toast } from "sonner";
import { Bug, LogIn, Loader2, UserCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DevAccount {
  label: string;
  email: string;
  password: string;
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

export function DevAccountSwitcher() {
  // Guard: only render in dev mode
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

  const handleSignIn = async (account: DevAccount) => {
    if (!signIn || !setActive) return;

    setLoading(account.email);
    setError(null);

    try {
      // Sign out first if already signed in
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

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
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
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          {accounts.map((account) => {
            const isCurrentUser =
              user?.primaryEmailAddress?.emailAddress === account.email;
            const isLoading = loading === account.email;

            return (
              <button
                type="button"
                key={account.email}
                disabled={isLoading || isCurrentUser}
                onClick={() => handleSignIn(account)}
                className={`group flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                  isCurrentUser ?
                    "border-emerald-500/30 bg-emerald-500/10 cursor-default"
                  : "border-border hover:border-amber-500/50 hover:bg-amber-500/5 cursor-pointer"
                }`}
              >
                <div
                  className={`flex size-10 items-center justify-center rounded-full ${
                    isCurrentUser ?
                      "bg-emerald-500/20 text-emerald-500"
                    : "bg-muted text-muted-foreground group-hover:bg-amber-500/20 group-hover:text-amber-500"
                  }`}
                >
                  <UserCircle className="size-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">
                    {account.label}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-emerald-500">
                        ● actif
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {account.email}
                  </div>
                </div>

                {!isCurrentUser && (
                  <div className="shrink-0">
                    {isLoading ?
                      <Loader2 className="size-4 animate-spin text-amber-500" />
                    : <LogIn className="size-4 text-muted-foreground group-hover:text-amber-500 transition-colors" />
                    }
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
