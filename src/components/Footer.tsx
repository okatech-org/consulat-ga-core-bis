"use client";

import { Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ModeToggle } from "./mode-toggle";

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="w-full border-t border-border bg-muted/30">
      <div className="container mx-auto py-12 md:py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-bold">{t("footer.brand.name")}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("footer.brand.description")}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">
              {t("footer.officialLinks.title")}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>{t("footer.officialLinks.ministry")}</li>
              <li>{t("footer.officialLinks.embassy")}</li>
              <li>{t("footer.officialLinks.consular")}</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("footer.contact.title")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>{t("footer.contact.email")}</li>
              <li>{t("footer.contact.phone")}</li>
              <li className="text-xs pt-2 text-muted-foreground/70">
                {t("footer.contact.license")}
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-border flex items-center justify-between">
          <div className="text-center flex-1 text-sm text-muted-foreground">
            <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
            <p className="text-xs mt-2">{t("footer.version")}</p>
          </div>
          <ModeToggle />
        </div>
      </div>
    </footer>
  );
};
