import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'convex/react'
import {
  BookOpen,
  BookOpenCheck,
  FileCheck,
  FileText,
  Globe,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react'
import { api } from '@convex/_generated/api'
import { ServiceCategory } from '@convex/lib/validators'
import { ServiceCard } from './ServiceCard'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Skeleton } from '../ui/skeleton'


const categoryConfig: Record<string, { icon: LucideIcon; color: string }> = {
  [ServiceCategory.PASSPORT]: {
    icon: BookOpenCheck,
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  [ServiceCategory.VISA]: {
    icon: Globe,
    color: 'bg-green-500/10 text-green-600 dark:text-green-400',
  },
  [ServiceCategory.CIVIL_STATUS]: {
    icon: FileText,
    color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  },
  [ServiceCategory.REGISTRATION]: {
    icon: BookOpen,
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
  [ServiceCategory.LEGALIZATION]: {
    icon: FileCheck,
    color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  },
  [ServiceCategory.EMERGENCY]: {
    icon: ShieldAlert,
    color: 'bg-red-500/10 text-red-600 dark:text-red-400',
  },
  [ServiceCategory.OTHER]: {
    icon: FileText,
    color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
  },
}

function ServiceSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 space-y-4">
      <Skeleton className="h-12 w-12 rounded-xl" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}

export function ServicesSection() {
  const { t } = useTranslation()
  const services = useQuery(api.services.listCommonServices, {})

  const isLoading = services === undefined

  return (
    <section className="py-16 px-6 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-3 bg-primary/10 text-primary">
            {t('services.badge')}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {t('services.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('services.description')}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <>
              <ServiceSkeleton />
              <ServiceSkeleton />
              <ServiceSkeleton />
              <ServiceSkeleton />
              <ServiceSkeleton />
              <ServiceSkeleton />
            </>
          ) : services.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              {t('services.empty', 'Aucun service disponible pour le moment.')}
            </div>
          ) : (
            services.slice(0, 6).map((service) => {
              const config = categoryConfig[service.category] || categoryConfig[ServiceCategory.OTHER]
              return (
                <ServiceCard
                  key={service._id}
                  icon={config.icon}
                  title={service.name}
                  description={service.description}
                  href={`/services/${service.slug}`}
                  color={config.color}
                />
              )
            })
          )}
        </div>

        {/* View All Link */}
        <div className="text-center mt-12">
          <Button asChild size="lg" className="h-12 px-8 rounded-xl shadow-lg shadow-primary/20">
            <Link to="/services">
              {t('services.viewAll')}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default ServicesSection
