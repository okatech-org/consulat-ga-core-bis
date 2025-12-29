import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  BookOpen,
  BookOpenCheck,
  FileCheck,
  FileText,
  Globe,
  ShieldAlert,
} from 'lucide-react'
import { ServiceCard } from './ServiceCard'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'

export function ServicesSection() {
  const { t } = useTranslation()

  const services = [
    {
      icon: BookOpenCheck,
      title: t('services.passport.title'),
      description: t('services.passport.description'),
      href: '/services/passeport',
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      icon: Globe,
      title: t('services.visa.title'),
      description: t('services.visa.description'),
      href: '/services/visa',
      color: 'bg-green-500/10 text-green-600 dark:text-green-400',
    },
    {
      icon: FileText,
      title: t('services.civilStatus.title'),
      description: t('services.civilStatus.description'),
      href: '/services/etat-civil',
      color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    },
    {
      icon: BookOpen,
      title: t('services.registration.title'),
      description: t('services.registration.description'),
      href: '/services/inscription',
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
    {
      icon: FileCheck,
      title: t('services.legalization.title'),
      description: t('services.legalization.description'),
      href: '/services/legalisation',
      color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    },
    {
      icon: ShieldAlert,
      title: t('services.emergency.title'),
      description: t('services.emergency.description'),
      href: '/services/urgence',
      color: 'bg-red-500/10 text-red-600 dark:text-red-400',
    },
  ]

  return (
    <section className="py-20 px-6 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary">
            {t('services.badge')}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('services.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('services.description')}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service.title}
              icon={service.icon}
              title={service.title}
              description={service.description}
              href={service.href}
              color={service.color}
            />
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-12">
          <Button asChild size="lg" className="h-12 px-8 rounded-xl shadow-lg shadow-primary/20">
            <Link to="/">
              {t('services.viewAll')}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default ServicesSection
