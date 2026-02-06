import { useAuth } from "@clerk/clerk-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { PublicUserType } from "@convex/lib/constants";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { ProfileTypeSelector } from "@/components/auth/ProfileTypeSelector";
import { CitizenRegistrationForm } from "@/components/auth/CitizenRegistrationForm";
import { ForeignerRegistrationForm } from "@/components/auth/ForeignerRegistrationForm";

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
});

export const Route = createFileRoute("/register/")({
  component: RegisterPage,
  validateSearch: (search) => registerSearchSchema.parse(search),
});

function RegisterPage() {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();
  const { type: urlType } = Route.useSearch();

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

  // Show loading while Clerk initializes
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const handleProfileSelect = (type: PublicUserType) => {
    setSelectedType(type);
    // Update URL without navigation
    navigate({
      to: "/register",
      search: { type },
      replace: true,
    });
  };

  const handleComplete = () => {
    navigate({ to: "/my-space" });
  };

  // Determine if foreigner type
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container py-12 px-4">
        {/* Step 0: SignUp if not signed in */}
        {!isSignedIn && (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Créer un compte</h1>
              <p className="text-muted-foreground">
                Commencez votre inscription sur le Portail Consulaire
              </p>
            </div>
            <SignUpForm />
          </div>
        )}

        {/* Step 1: Profile selection (if signed in but no type selected) */}
        {isSignedIn && !selectedType && (
          <ProfileTypeSelector onSelect={handleProfileSelect} />
        )}

        {/* Step 2+: Registration wizard (if signed in and type selected) */}
        {isSignedIn && isCitizen && (
          <CitizenRegistrationForm
            userType={
              selectedType as PublicUserType.LongStay | PublicUserType.ShortStay
            }
            onComplete={handleComplete}
          />
        )}

        {isSignedIn && isForeigner && (
          <ForeignerRegistrationForm
            initialVisaType={selectedType}
            onComplete={handleComplete}
          />
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-sm text-muted-foreground/60">
        <p>
          &copy; {new Date().getFullYear()} Consulat.ga - République Gabonaise
        </p>
      </div>
    </div>
  );
}
