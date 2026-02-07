import { createFileRoute } from "@tanstack/react-router";
import { Inbox, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { PageHeader } from "@/components/my-space/page-header";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/my-space/iboite")({
  component: IBoitePage,
});

function IBoitePage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 p-1">
      <PageHeader
        title={t("mySpace.screens.iboite.heading", "iBoîte")}
        subtitle={t(
          "mySpace.screens.iboite.subtitle",
          "Votre messagerie consulaire sécurisée",
        )}
        icon={<Inbox className="h-6 w-6 text-primary" />}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Clock className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {t(
                "mySpace.screens.iboite.comingSoon",
                "Fonctionnalité bientôt disponible",
              )}
            </h3>
            <p className="text-muted-foreground max-w-md">
              {t(
                "mySpace.screens.iboite.description",
                "iBoîte vous permettra de communiquer de manière sécurisée avec votre consulat, recevoir des notifications importantes et gérer votre correspondance officielle.",
              )}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
