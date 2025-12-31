import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'convex/react'
import { MapPin, Phone, Clock, ExternalLink } from 'lucide-react'
import { api } from '@convex/_generated/api'
import { OrgType } from '@convex/lib/types'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { Skeleton } from '../ui/skeleton'

// Country code to friendly name mapping
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

function formatAddress(address: { street: string; city: string; postalCode: string; country: string }) {
  return `${address.street}, ${address.postalCode} ${address.city}`
}

function formatOpeningHours(openingHours?: { monday?: { open: string; close: string } }) {
  if (openingHours?.monday) {
    return `Lun-Ven: ${openingHours.monday.open}-${openingHours.monday.close}`
  }
  return 'Lun-Ven: 9h00-16h00' // Default
}

function OrgCardSkeleton() {
  return (
    <Card className="relative">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
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

export function ConsulateLocations() {
  const { t } = useTranslation()
  const orgs = useQuery(api.orgs.list, {})

  const isLoading = orgs === undefined

  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary">
            {t('consulates.badge')}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('consulates.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('consulates.description')}
          </p>
        </div>

        {/* Orgs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {isLoading ? (
            <>
              <OrgCardSkeleton />
              <OrgCardSkeleton />
              <OrgCardSkeleton />
            </>
          ) : orgs.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              {t('consulates.empty', 'Aucune représentation disponible pour le moment.')}
            </div>
          ) : (
            orgs.slice(0, 3).map((org) => {
              const isPrimary = org.type === OrgType.EMBASSY || org.type === OrgType.CONSULATE_GENERAL
              const countryName = countryNames[org.address.country] || org.address.country
              
              return (
                <Card
                  key={org._id}
                  className={`relative ${
                    isPrimary
                      ? 'bg-primary/5 border-primary/20 hover:border-primary/40'
                      : 'hover:border-primary/30'
                  }`}
                >
                  {isPrimary && (
                    <Badge className="absolute top-4 right-4">
                      {org.type === OrgType.EMBASSY ? t('consulates.embassy', 'Ambassade') : t('consulates.headquarters')}
                    </Badge>
                  )}

                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-primary/10 text-primary">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{org.address.city}</CardTitle>
                        <CardDescription>{countryName}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="text-foreground">{formatAddress(org.address)}</span>
                    </div>
                    {org.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                        <a
                          href={`tel:${org.phone.replace(/\s/g, '')}`}
                          className="text-primary hover:underline"
                        >
                          {org.phone}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-foreground">{formatOpeningHours(org.openingHours)}</span>
                    </div>
                  </CardContent>

                  <Separator className="mx-6" />

                  <CardFooter className="pt-4">
                    <Link
                      to="/orgs/$slug"
                      params={{ slug: org.slug }}
                      className="inline-flex items-center gap-2 text-primary font-medium hover:underline text-sm"
                    >
                      {t('consulates.viewDetails')}
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </CardFooter>
                </Card>
              )
            })
          )}
        </div>

        {/* View All Link */}
        <div className="text-center">
          <Button asChild variant="outline" size="lg" className="h-12 px-6 rounded-xl border-2 border-primary text-primary hover:bg-primary hover:text-white">
            <Link to="/orgs">
              <MapPin className="w-5 h-5 mr-2" />
              {t('consulates.viewAll')}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default ConsulateLocations
