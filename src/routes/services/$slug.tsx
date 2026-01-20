import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'convex/react'
import {
  BookOpen,
  BookOpenCheck,
  FileCheck,
  FileText,
  Globe,
  ShieldAlert,
  ArrowLeft,
  FileWarning,
  type LucideIcon,
} from 'lucide-react'
import { api } from '@convex/_generated/api'
import { ServiceCategory } from '@convex/lib/validators'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Footer } from '@/components/Footer'
import { NearbyOrgs } from '@/components/NearbyOrgs'

export const Route = createFileRoute('/services/$slug')({
  component: ServiceDetailPage,
})

const categoryConfig: Record<string, { icon: LucideIcon; color: string; bgColor: string }> = {
  [ServiceCategory.Identity]: {
    icon: BookOpenCheck,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  [ServiceCategory.Visa]: {
    icon: Globe,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-500/10',
  },
  [ServiceCategory.CivilStatus]: {
    icon: FileText,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-500/10',
  },
  [ServiceCategory.Registration]: {
    icon: BookOpen,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
  [ServiceCategory.Certification]: {
    icon: FileCheck,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-500/10',
  },
  [ServiceCategory.Assistance]: {
    icon: ShieldAlert,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-500/10',
  },
  [ServiceCategory.Other]: {
    icon: FileText,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-500/10',
  },
}

const categoryLabels: Record<string, string> = {
  [ServiceCategory.Identity]: 'Passeport',
  [ServiceCategory.Visa]: 'Visa',
  [ServiceCategory.CivilStatus]: 'État Civil',
  [ServiceCategory.Registration]: 'Inscription Consulaire',
  [ServiceCategory.Certification]: 'Légalisation',
  [ServiceCategory.Assistance]: 'Assistance d\'Urgence',
  [ServiceCategory.Other]: 'Autre',
}

function ServiceDetailPage() {
  const { t } = useTranslation()
  const { slug } = Route.useParams()
  const service = useQuery(api.functions.services.getBySlug, { slug })

  const isLoading = service === undefined

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="flex items-start gap-6 mb-8">
            <Skeleton className="h-16 w-16 rounded-xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <FileWarning className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">{t('services.notFound', 'Service non trouvé')}</h1>
            <p className="text-muted-foreground mb-6">
              {t('services.notFoundDesc', 'Le service demandé n\'existe pas ou a été supprimé.')}
            </p>
            <Button asChild>
              <Link to="/services">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('services.backToServices', 'Retour aux services')}
              </Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const config = categoryConfig[service.category] || categoryConfig[ServiceCategory.Other]
  const Icon = config.icon
  const categoryLabel = categoryLabels[service.category] || service.category

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1">
        {/* Header */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-12 px-6">
          <div className="max-w-4xl mx-auto">
            <Button asChild variant="ghost" size="sm" className="mb-6">
              <Link to="/services">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('services.backToServices', 'Retour aux services')}
              </Link>
            </Button>

            <div className="flex items-start gap-6">
              <div className={`p-4 rounded-2xl ${config.bgColor} ${config.color}`}>
                <Icon className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {service.name.fr}
                </h1>
                <Badge variant="secondary" className={`${config.bgColor} ${config.color}`}>
                  {categoryLabel}
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>{t('services.descriptionTitle', 'Description')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">{service.description.fr}</p>
              </CardContent>
            </Card>

            {/* Required Documents */}
            {service.defaults?.requiredDocuments && service.defaults.requiredDocuments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('services.requiredDocuments', 'Documents requis')}</CardTitle>
                  <CardDescription>
                    {t('services.documentsDesc', 'Les documents suivants sont nécessaires pour cette demande.')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {service.defaults.requiredDocuments.map((doc, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">
                            {doc.label}
                            {doc.required && (
                              <Badge variant="destructive" className="ml-2 text-xs">
                                {t('services.required', 'Obligatoire')}
                              </Badge>
                            )}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Separator />

            {/* Nearby Orgs */}
            <NearbyOrgs />
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
