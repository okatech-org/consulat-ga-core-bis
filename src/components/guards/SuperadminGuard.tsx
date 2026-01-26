import { Link } from '@tanstack/react-router'
import { useUserData } from '@/hooks/use-user-data'
import { Loader2, ShieldX, ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

interface SuperadminGuardProps {
  children: React.ReactNode
}

/**
 * Route guard that protects superadmin-only routes.
 * Shows an error message with a back button if user is not a superadmin.
 */
export function SuperadminGuard({ children }: SuperadminGuardProps) {
  const { t } = useTranslation()
  const { userData, isSuperAdmin, isPending } = useUserData()

  // Show loading state while checking permissions
  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">
            {t('common.loading', 'Chargement...')}
          </p>
        </div>
      </div>
    )
  }

  // Show unauthorized message with back button
  if (!userData || !isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6">
          <ShieldX className="h-12 w-12 mx-auto text-destructive" />
          <div className="space-y-2">
            <h1 className="text-xl font-semibold">
              {t('errors.unauthorized', 'Accès non autorisé')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('errors.superadminRequired', 'Vous devez être superadmin pour accéder à cette page.')}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('common.back', 'Retour')}
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  // User is authorized - render children
  return <>{children}</>
}
