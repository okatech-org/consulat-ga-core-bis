import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { PublicUserType } from "@convex/lib/constants";
import { ProfileTypeSelector } from "@/components/auth/ProfileTypeSelector";
import { CitizenRegistrationForm } from "@/components/auth/CitizenRegistrationForm";
import { ForeignerRegistrationForm } from "@/components/auth/ForeignerRegistrationForm";
import { useAuth } from "@clerk/clerk-react";
import { useConvexQuery } from "@/integrations/convex/hooks";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight } from "lucide-react";

const registerSearchSchema = z.object({
  type: z
    .enum([
      PublicUserType.LongStay,
      PublicUserType.ShortStay,
      PublicUserType.VisaTourism,
      PublicUserType.VisaBusiness,
      PublicUserType.VisaLongStay,
      PublicUserType.AdminServices,
    ])
    .optional(),
  mode: z.enum(["sign-up", "sign-in"]).optional(),
});

export const Route = createFileRoute("/register/")({
  component: RegisterPage,
  validateSearch: (search) => registerSearchSchema.parse(search),
});

function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { type: urlType, mode: urlMode } = Route.useSearch();
  const { isSignedIn } = useAuth();

  // Check if user already has a profile
  const { data: profileResult } = useConvexQuery(
    api.functions.profiles.getMyProfileSafe,
    isSignedIn ? {} : "skip",
  );
  const hasProfile = !!profileResult?.profile;

  // Selected profile type (from URL or user selection)
  const [selectedType, setSelectedType] = useState<PublicUserType | null>(
    urlType || null,
  );

  // Sync URL param to state
  useEffect(() => {
    if (urlType) {
      setSelectedType(urlType);
    }
  }, [urlType]);

  const handleProfileSelect = (type: PublicUserType) => {
    setSelectedType(type);
    navigate({
      to: "/register",
      search: { type },
      replace: true,
    });
  };

  const handleComplete = () => {
    navigate({ to: "/my-space" });
  };

  const handleBack = () => {
    setSelectedType(null);
    navigate({
      to: "/register",
      search: {},
      replace: true,
    });
  };

  // Determine user type category
  const isForeigner =
    selectedType &&
    [
      PublicUserType.VisaTourism,
      PublicUserType.VisaBusiness,
      PublicUserType.VisaLongStay,
      PublicUserType.AdminServices,
    ].includes(selectedType);

  const isCitizen =
    selectedType &&
    [PublicUserType.LongStay, PublicUserType.ShortStay].includes(selectedType);

  // Guard: user already has a profile
  if (isSignedIn && hasProfile) {
    return (
      <div className="min-h-[calc(100vh-200px)] py-8 px-4 bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8 space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold">
                {t("register.alreadyRegistered.title", "Profil déjà créé")}
              </h2>
              <p className="text-muted-foreground">
                {t(
                  "register.alreadyRegistered.description",
                  "Vous avez déjà un profil consulaire. Accédez à votre espace pour suivre vos démarches.",
                )}
              </p>
            </div>
            <Button asChild size="lg" className="w-full gap-2">
              <Link to="/my-space">
                {t(
                  "register.alreadyRegistered.cta",
                  "Accéder à mon espace consulaire",
                )}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] py-8 px-4 bg-gradient-to-br from-background via-background to-muted/30">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Step 0: Profile selection (always shown first if no type selected) */}
      {!selectedType && (
        <div className="flex items-center justify-center min-h-[calc(100vh-300px)]">
          <ProfileTypeSelector onSelect={handleProfileSelect} />
        </div>
      )}

      {/* Citizen Registration Form (with SignUp embedded as Step 0) */}
      {isCitizen && (
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleBack}
            className="mb-4 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            {t("register.backToProfile")}
          </button>
          <CitizenRegistrationForm
            userType={
              selectedType as PublicUserType.LongStay | PublicUserType.ShortStay
            }
            authMode={urlMode || "sign-up"}
            onComplete={handleComplete}
          />
        </div>
      )}

      {/* Foreigner Registration Form (with SignUp embedded as Step 0) */}
      {isForeigner && (
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleBack}
            className="mb-4 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            {t("register.backToProfile")}
          </button>
          <ForeignerRegistrationForm
            initialVisaType={selectedType}
            onComplete={handleComplete}
          />
        </div>
      )}
    </div>
  );
}
