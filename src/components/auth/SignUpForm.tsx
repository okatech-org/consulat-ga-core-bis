import { useState } from "react";
import { useSignUp } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface SignUpFormProps {
  onComplete?: () => void;
}

export function SignUpForm({ onComplete }: SignUpFormProps) {
  const { t } = useTranslation();
  const { signUp, isLoaded, setActive } = useSignUp();

  const [step, setStep] = useState<"form" | "verify">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    setLoading(true);
    setError(null);

    try {
      await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      setError(clerkError.errors?.[0]?.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    setLoading(true);
    setError(null);

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        onComplete?.();
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      setError(clerkError.errors?.[0]?.message || "Code invalide");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">
            {step === "form" ?
              t("register.createAccount", "Créer un compte")
            : t("register.verifyEmail", "Vérification")}
          </CardTitle>
          <CardDescription>
            {step === "form" ?
              t(
                "register.createAccountDescription",
                "Renseignez vos informations pour commencer",
              )
            : t(
                "register.verifyEmailDescription",
                "Un code a été envoyé à votre adresse email",
              )
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === "form" ?
            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    {t("common.firstName", "Prénom")}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jean"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    {t("common.lastName", "Nom")}
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Dupont"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("common.email", "Email")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jean@exemple.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  {t("common.password", "Mot de passe")}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ?
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                : <ArrowRight className="mr-2 h-4 w-4" />}
                {t("register.continue", "Continuer")}
              </Button>
            </form>
          : <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
              </div>

              <p className="text-center text-sm text-muted-foreground mb-4">
                {t("register.codeSentTo", "Code envoyé à")}{" "}
                <strong>{email}</strong>
              </p>

              <div className="space-y-2">
                <Label htmlFor="code">
                  {t("register.verificationCode", "Code de vérification")}
                </Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  className="text-center text-2xl tracking-widest"
                  maxLength={6}
                  required
                />
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ?
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                : <CheckCircle2 className="mr-2 h-4 w-4" />}
                {t("register.verify", "Vérifier")}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep("form")}
              >
                {t("register.back", "Retour")}
              </Button>
            </form>
          }
        </CardContent>
      </Card>
    </div>
  );
}
