import { ClerkProvider } from "@clerk/clerk-react";
import { frFR, enUS } from "@clerk/localizations";
import { useTranslation } from "react-i18next";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error("Add your Clerk Publishable Key to the .env.local file");
}

const localesMap = {
  fr: frFR,
  en: enUS,
};

export default function AppClerkProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { i18n } = useTranslation();
  const localization = localesMap[i18n.language as keyof typeof localesMap];

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      localization={localization}
      signInUrl="/sign-in"
      signUpUrl="/register"
      afterSignInUrl="/my-space"
      afterSignUpUrl="/register"
      appearance={{
        layout: {
          socialButtonsVariant: "iconButton",
          logoPlacement: "inside",
          showOptionalFields: true,
          privacyPageUrl: "/privacy",
          termsPageUrl: "/terms",
        },
        variables: {
          // Gabon Green as primary color
          colorPrimary: "#009639",
          colorDanger: "#EF4444",
          colorSuccess: "#10B981",
          colorWarning: "#F59E0B",

          // Background colors
          colorBackground: "#FFFFFF",
          colorInputBackground: "#FFFFFF",
          colorNeutral: "#6B7280",

          // Text colors
          colorText: "#1A1D26",
          colorTextOnPrimaryBackground: "#FFFFFF",
          colorTextSecondary: "#6B7280",

          // Typography
          fontFamily:
            '"Plus Jakarta Sans Variable", "Inter Variable", system-ui, sans-serif',
          fontFamilyButtons:
            '"Plus Jakarta Sans Variable", "Inter Variable", system-ui, sans-serif',
          fontSize: "0.875rem",

          // Border radius - matches app's 16px base
          borderRadius: "1rem",

          // Spacing
          spacingUnit: "1rem",
        },
        elements: {
          // Root card styling
          rootBox: "w-full",
          card: "shadow-xl border border-border/50 backdrop-blur-xl",

          // Header
          headerTitle: "text-2xl font-bold text-foreground",
          headerSubtitle: "text-muted-foreground",

          // Form fields
          formFieldInput: "border-border focus:ring-2 focus:ring-primary/20",
          formFieldLabel: "text-foreground font-medium",

          // Buttons
          formButtonPrimary:
            "bg-primary hover:bg-primary/90 text-white font-medium transition-all duration-200",

          // Social buttons
          socialButtonsBlockButton:
            "border border-border hover:bg-muted/50 transition-all duration-200",
          socialButtonsBlockButtonText: "text-foreground font-medium",

          // Footer
          footerAction: "text-muted-foreground",
          footerActionLink: "text-primary hover:text-primary/80",

          // Divider
          dividerLine: "bg-border",
          dividerText: "text-muted-foreground text-sm",

          // Alert/Error styling
          alert: "bg-destructive/10 border-destructive text-destructive",

          // OTP input
          otpCodeFieldInput: "border-border text-2xl font-mono",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
