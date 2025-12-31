import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'convex/react'
import { MapPin, Phone, Clock, Building2, ArrowRight } from 'lucide-react'
import { api } from '@convex/_generated/api'
import { OrgType } from '@convex/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Footer } from '@/components/Footer'

export const Route = createFileRoute('/orgs/')({
  component: OrgsPage,
})

const countryNames: Record<string, string> = {
  FR: 'France',
  BE: 'Belgique',
  US: 'États-Unis',
  GB: 'Royaume-Uni',
  DE: 'Allemagne',
  ES: 'Espagne',
  IT: 'Italie',
  CH: 'Suisse',
  CA: 'Canada',
  GA: 'Gabon',
}

const orgTypeLabels: Record<string, string> = {
  [OrgType.CONSULATE]: 'Consulat',
  [OrgType.CONSULATE_GENERAL]: 'Consulat Général',
  [OrgType.HONORARY_CONSULATE]: 'Consulat Honoraire',
  [OrgType.EMBASSY]: 'Ambassade',
  [OrgType.MINISTRY]: 'Ministère',
  [OrgType.OTHER]: 'Autre',
}

function formatAddress(address: { street: string; city: string; postalCode: string }) {
  return `${address.street}, ${address.postalCode} ${address.city}`
}

function formatOpeningHours(openingHours?: { monday?: { open: string; close: string } }) {
  if (openingHours?.monday) {
    return `Lun-Ven: ${openingHours.monday.open}-${openingHours.monday.close}`
  }
  return 'Lun-Ven: 9h00-16h00'
}

function OrgCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-40" />
      </CardContent>
    </Card>
  )
}

function OrgsPage() {
  const { t } = useTranslation()
  const orgs = useQuery(api.orgs.list, {})

  const isLoading = orgs === undefined

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary">
            {t('consulates.badge', 'Représentations')}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('orgs.pageTitle', 'Nos Représentations')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('orgs.pageDescription', 'Retrouvez l\'ensemble des représentations diplomatiques et consulaires de la République Gabonaise à travers le monde.')}
          </p>
        </div>
      </section>

      {/* Orgs Grid */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <>
                <OrgCardSkeleton />
                <OrgCardSkeleton />
                <OrgCardSkeleton />
                <OrgCardSkeleton />
                <OrgCardSkeleton />
                <OrgCardSkeleton />
              </>
            ) : orgs.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                {t('orgs.empty', 'Aucune représentation disponible pour le moment.')}
              </div>
            ) : (
              orgs.map((org) => {
                const countryName = countryNames[org.address.country] || org.address.country
                const typeLabel = orgTypeLabels[org.type] || org.type
                const isPrimary = org.type === OrgType.EMBASSY || org.type === OrgType.CONSULATE_GENERAL

                return (
                  <Link
                    key={org._id}
                    to="/orgs/$slug"
                    params={{ slug: org.slug }}
                    className="block group"
                  >
                    <Card className={`h-full transition-all hover:shadow-lg hover:border-primary/30 ${
                      isPrimary ? 'bg-primary/5 border-primary/20' : ''
                    }`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-primary/10 text-primary">
                            <Building2 className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                {org.name}
                              </CardTitle>
                              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </div>
                            <CardDescription className="flex items-center gap-2">
                              <MapPin className="w-3 h-3" />
                              {org.address.city}, {countryName}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="w-fit mt-2">
                          {typeLabel}
                        </Badge>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>{formatAddress(org.address)}</span>
                        </div>
                        {org.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-4 h-4 shrink-0" />
                            <span>{org.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4 shrink-0" />
                          <span>{formatOpeningHours(org.openingHours)}</span>
                        </div>
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
