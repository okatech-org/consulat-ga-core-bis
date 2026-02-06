import { SignUp, useAuth } from "@clerk/clerk-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { PublicUserType } from "@convex/lib/constants";

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
    .optional()
    .default(PublicUserType.LongStay),
});

export const Route = createFileRoute("/register/")({
  component: RegisterPage,
  validateSearch: (search) => registerSearchSchema.parse(search),
});

const TYPE_LABELS: Record<string, { title: string; subtitle: string }> = {
  [PublicUserType.LongStay]: {
    title: "Inscription Résident",
    subtitle: "Gabonais résidant à l'étranger (> 6 mois)",
  },
  [PublicUserType.ShortStay]: {
    title: "Déclaration de Passage",
    subtitle: "Gabonais de passage temporaire (< 6 mois)",
  },
  [PublicUserType.VisaTourism]: {
    title: "Visa Tourisme",
    subtitle: "Demande de visa court séjour",
  },
  [PublicUserType.VisaBusiness]: {
    title: "Visa Affaires",
    subtitle: "Demande de visa professionnel",
  },
  [PublicUserType.VisaLongStay]: {
    title: "Visa Long Séjour",
    subtitle: "Demande de visa d'installation",
  },
  [PublicUserType.AdminServices]: {
    title: "Services Administratifs",
    subtitle: "Légalisation, apostille, certifications",
  },
};

function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const { type } = Route.useSearch();

  const typeInfo = TYPE_LABELS[type] || TYPE_LABELS[PublicUserType.LongStay];

  // If already signed in, redirect to my-space/registration
  if (isSignedIn) {
    navigate({ to: "/my-space/registration" });
    return null;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero-background.png"
          alt="Gabon cityscape"
          className="h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {typeInfo.title}
          </h1>
          <p className="text-white/80 text-lg">{typeInfo.subtitle}</p>
        </div>

        {/* Clerk SignUp with custom styling */}
        <div className="w-full">
          <SignUp
            forceRedirectUrl={`/my-space/registration?type=${type}`}
            appearance={{
              layout: {
                socialButtonsVariant: "iconButton",
              },
              elements: {
                card: "rounded-xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-xl w-full mx-auto p-6",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                formButtonPrimary:
                  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 w-full",
                socialButtonsBlockButton:
                  "border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 rounded-md transition-colors",
                socialButtonsBlockButtonText: "text-foreground font-medium",
                formFieldLabel:
                  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block text-foreground",
                formFieldInput:
                  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                footerActionText: "text-muted-foreground",
                footerActionLink:
                  "text-primary hover:text-primary/90 font-medium underline-offset-4 hover:underline",
                dividerLine: "bg-border",
                dividerText: "text-muted-foreground bg-card/80",
                formFieldAction: "text-primary hover:text-primary/90",
                alert:
                  "rounded-lg border border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
                alertText: "text-destructive-foreground",
              },
              variables: {
                borderRadius: "0.5rem",
              },
            }}
          />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground/60">
          <p>
            &copy; {new Date().getFullYear()} Consulat.ga - République Gabonaise
          </p>
        </div>
      </div>
    </div>
  );
}
