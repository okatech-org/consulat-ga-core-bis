import { createFileRoute, Link } from "@tanstack/react-router"
import { useAuthenticatedConvexQuery } from "@/integrations/convex/hooks"
import { api } from "@convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, User, Calendar, ArrowRight, AlertCircle, Flag, Loader2 } from "lucide-react"
import { useTranslation } from "react-i18next"

export const Route = createFileRoute("/my-space/")({
  component: UserDashboard,
})

function UserDashboard() {
  const { t } = useTranslation()
  const { data: profile, isPending } = useAuthenticatedConvexQuery(api.profiles.getMyProfile, {})

  if (isPending) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in">
       <div>
         <h1 className="text-3xl font-bold tracking-tight">{t("common.dashboard", "Tableau de bord")}</h1>
         <p className="text-muted-foreground">
            {t("dashboard.welcome", "Bienvenue sur votre espace personnel.")}
         </p>
       </div>
       
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Profile Status Card */}
          <Card className="hover:border-primary/50 transition-colors">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("common.profile", "Mon Profil")}</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
                <div className="text-2xl font-bold">
                    {profile?.status === 'draft' ? t('status.incomplete', 'À compléter') : t('status.active', 'Actif')}
                </div>
                <p className="text-xs text-muted-foreground">
                    {profile?.isNational 
                        ? t("profile.national", "Nationalité Gabonaise") 
                        : t("profile.foreigner", "Ressortissant Étranger")}
                </p>
                <div className="mt-4">
                    <Button variant="outline" size="sm" asChild className="w-full">
                        <Link to="/my-space/profile">
                            {t("actions.manageProfile", "Gérer mon profil")} 
                            <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                    </Button>
                </div>
             </CardContent>
          </Card>

           {/* Requests Summary */}
          <Card className="hover:border-primary/50 transition-colors">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("common.requests", "Mes Demandes")}</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                    {t("dashboard.noRequests", "Aucune demande en cours")}
                </p>
                <div className="mt-4">
                     <Button variant="outline" size="sm" className="w-full" disabled>
                        {t("actions.viewRequests", "Voir mes demandes")}
                    </Button>
                </div>
             </CardContent>
          </Card>
          
           {/* Appointments Summary */}
          <Card className="hover:border-primary/50 transition-colors">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("common.appointments", "Mes Rendez-vous")}</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                    {t("dashboard.noAppointments", "Aucun rendez-vous prévu")}
                </p>
                <div className="mt-4">
                     <Button variant="outline" size="sm" className="w-full" disabled>
                        {t("actions.viewAppointments", "Voir mes rendez-vous")}
                    </Button>
                </div>
             </CardContent>
          </Card>
       </div>
       
       {/* Actions Rapides Section? */}
       {profile?.status === 'draft' && (
           <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
               <CardHeader>
                   <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-500">
                       <AlertCircle className="h-5 w-5" />
                       {t("dashboard.completeProfile.title", "Complétez votre profil")}
                   </CardTitle>
                   <CardDescription className="text-amber-700/80 dark:text-amber-400/80">
                       {t("dashboard.completeProfile.desc", "Pour faciliter vos démarches administratives, nous vous recommandons de compléter votre profil consulaire.")}
                   </CardDescription>
               </CardHeader>
               <CardContent>
                   <Button asChild variant="default" className="bg-amber-600 hover:bg-amber-700 text-white">
                       <Link to="/my-space/profile">{t("actions.completeProfile", "Compléter maintenant")}</Link>
                   </Button>
               </CardContent>
           </Card>
       )}

       {profile?.isNational && (!profile.registrations || profile.registrations.length === 0) && (
           <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 hover:border-blue-300 transition-colors">
               <CardHeader>
                   <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-400">
                       <Flag className="h-5 w-5" />
                       {t("dashboard.registration.title", "Immatriculation Consulaire")}
                   </CardTitle>
                   <CardDescription className="text-blue-700/80 dark:text-blue-400/80">
                       {t("dashboard.registration.desc", "En tant que ressortissant, vous pouvez demander votre carte consulaire directement en ligne.")}
                   </CardDescription>
               </CardHeader>
               <CardContent>
                   <Button asChild variant="default" className="bg-blue-600 hover:bg-blue-700 text-white">
                       <Link to="/my-space/registration">
                           {t("actions.startRegistration", "Commencer l'immatriculation")}
                           <ArrowRight className="ml-2 h-4 w-4" />
                       </Link>
                   </Button>
               </CardContent>
           </Card>
       )}
    </div>
  )
}
