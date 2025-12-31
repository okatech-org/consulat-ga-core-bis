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
  ArrowRight,
  type LucideIcon,
} from 'lucide-react'
import { api } from '@convex/_generated/api'
import { ServiceCategory } from '@convex/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Footer } from '@/components/Footer'

export const Route = createFileRoute('/services/')({
  component: ServicesPage,
})

// Map service categories to icons and colors
const categoryConfig: Record<string, { icon: LucideIcon; color: string; bgColor: string }> = {
  [ServiceCategory.PASSPORT]: {
    icon: BookOpenCheck,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  [ServiceCategory.VISA]: {
    icon: Globe,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-500/10',
  },
  [ServiceCategory.CIVIL_STATUS]: {
    icon: FileText,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-500/10',
  },
  [ServiceCategory.REGISTRATION]: {
    icon: BookOpen,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
  [ServiceCategory.LEGALIZATION]: {
    icon: FileCheck,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-500/10',
  },
  [ServiceCategory.EMERGENCY]: {
    icon: ShieldAlert,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-500/10',
  },
  [ServiceCategory.OTHER]: {
    icon: FileText,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-500/10',
  },
}

const categoryLabels: Record<string, string> = {
  [ServiceCategory.PASSPORT]: 'Passeport',
  [ServiceCategory.VISA]: 'Visa',
  [ServiceCategory.CIVIL_STATUS]: 'État Civil',
  [ServiceCategory.REGISTRATION]: 'Inscription Consulaire',
  [ServiceCategory.LEGALIZATION]: 'Légalisation',
  [ServiceCategory.EMERGENCY]: 'Assistance d\'Urgence',
  [ServiceCategory.OTHER]: 'Autre',
}

function ServiceCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  )
}

function ServicesPage() {
  const { t } = useTranslation()
  const services = useQuery(api.services.listCommonServices, {})

  const isLoading = services === undefined

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary">
            {t('services.badge', 'Services Consulaires')}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('services.pageTitle', 'Nos Services')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('services.pageDescription', 'Découvrez l\'ensemble des services consulaires proposés par la République Gabonaise pour ses citoyens à l\'étranger.')}
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <>
                <ServiceCardSkeleton />
                <ServiceCardSkeleton />
                <ServiceCardSkeleton />
                <ServiceCardSkeleton />
                <ServiceCardSkeleton />
                <ServiceCardSkeleton />
              </>
            ) : services.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                {t('services.empty', 'Aucun service disponible pour le moment.')}
              </div>
            ) : (
              services.map((service) => {
                const config = categoryConfig[service.category] || categoryConfig[ServiceCategory.OTHER]
                const Icon = config.icon
                const categoryLabel = categoryLabels[service.category] || service.category

                return (
                  <Link
                    key={service._id}
                    to="/services/$slug"
                    params={{ slug: service.slug }}
                    className="block group"
                  >
                    <Card className="h-full transition-all hover:shadow-lg hover:border-primary/30">
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl ${config.bgColor} ${config.color}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">
                              {service.name}
                            </CardTitle>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {categoryLabel}
                            </Badge>
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="line-clamp-2">
                          {service.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
