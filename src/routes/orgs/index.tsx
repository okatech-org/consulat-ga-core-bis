import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'convex/react'
import { MapPin, Phone, Clock, Building2, ArrowRight, Search, LayoutGrid, List as ListIcon, Globe } from 'lucide-react'
import { api } from '@convex/_generated/api'
import { OrgType } from '@convex/lib/types'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Footer } from '@/components/Footer'
import { z } from 'zod'
import { useState, useEffect } from 'react'

const orgsSearchSchema = z.object({
  query: z.string().optional(),
  country: z.string().optional(),
  view: z.enum(['grid', 'list']).optional().default('grid'),
})

export const Route = createFileRoute('/orgs/')({
  component: OrgsPage,
  validateSearch: (search) => orgsSearchSchema.parse(search),
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

function OrgCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="text-center pb-2">
        <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
        <Skeleton className="h-6 w-32 mx-auto mb-2" />
        <Skeleton className="h-4 w-24 mx-auto" />
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3 mx-auto" />
      </CardContent>
    </Card>
  )
}

function OrgsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate({ from: Route.fullPath })
  const search = Route.useSearch()
  const orgs = useQuery(api.orgs.list, {})
  
  const [searchQuery, setSearchQuery] = useState(search.query || '')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(search.view || 'grid')

  // Sync state with URL params
  const updateFilters = (updates: Partial<typeof search>) => {
    navigate({
      search: (prev) => ({ ...prev, ...updates }),
      replace: true,
    })
  }

  // Debounced search update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== search.query) {
        updateFilters({ query: searchQuery || undefined })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // View mode update
  const handleViewModeChange = (value: string) => {
    const mode = value as 'grid' | 'list'
    setViewMode(mode)
    updateFilters({ view: mode })
  }

  const isLoading = orgs === undefined

  // Filter orgs
  const filteredOrgs = orgs?.filter(org => {
     const matchesQuery = !search.query || 
       org.name.toLowerCase().includes(search.query.toLowerCase()) ||
       org.address.city.toLowerCase().includes(search.query.toLowerCase()) ||
       countryNames[org.address.country]?.toLowerCase().includes(search.query.toLowerCase())
       
    const matchesCountry = !search.country || org.address.country === search.country
    
    return matchesQuery && matchesCountry
  })

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
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {t('orgs.pageDescription', 'Retrouvez l\'ensemble des représentations diplomatiques et consulaires de la République Gabonaise à travers le monde.')}
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input 
              className="h-14 pl-12 pr-4 rounded-2xl bg-background shadow-lg border-primary/10 text-lg placeholder:text-muted-foreground/50 focus-visible:ring-primary/20"
              placeholder={t('orgs.searchPlaceholder', 'Rechercher une ambassade, un consulat, une ville...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Orgs Content */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Filters & View Toggle */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
             <div className="flex items-center gap-2 text-muted-foreground">
               <Globe className="w-4 h-4" />
               <span className="text-sm font-medium">
                 {filteredOrgs ? `${filteredOrgs.length} représentation${filteredOrgs.length > 1 ? 's' : ''}` : 'Chargement...'}
               </span>
             </div>
             
             <Tabs value={viewMode} onValueChange={handleViewModeChange} className="w-full md:w-auto">
              <TabsList className="grid w-full grid-cols-2 item-center">
                <TabsTrigger value="grid" className="gap-2">
                  <LayoutGrid className="w-4 h-4" />
                  Grille
                </TabsTrigger>
                <TabsTrigger value="list" className="gap-2">
                  <ListIcon className="w-4 h-4" />
                  Liste
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <OrgCardSkeleton key={i} />)
            ) : filteredOrgs?.length === 0 ? (
              <div className="col-span-full py-12 text-center">
                 <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                   <Search className="w-8 h-8 text-muted-foreground" />
                 </div>
                 <h3 className="text-lg font-semibold mb-2">{t('orgs.noResults', 'Aucun résultat trouvé')}</h3>
                 <p className="text-muted-foreground">
                   {t('orgs.noResultsDesc', 'Essayez de modifier votre recherche.')}
                 </p>
                 <Button 
                   variant="outline" 
                   className="mt-4"
                   onClick={() => {
                     setSearchQuery('')
                     updateFilters({ query: undefined, country: undefined })
                   }}
                 >
                   Voir toutes les représentations
                 </Button>
              </div>
            ) : (
              filteredOrgs?.map((org) => {
                const countryName = countryNames[org.address.country] || org.address.country
                const typeLabel = orgTypeLabels[org.type] || org.type
                const isPrimary = org.type === OrgType.EMBASSY || org.type === OrgType.CONSULATE_GENERAL

                if (viewMode === 'list') {
                  return (
                    <Link
                      key={org._id}
                      to="/orgs/$slug"
                      params={{ slug: org.slug }}
                      className="block group"
                    >
                      <Card className={`transition-all hover:shadow-md ${isPrimary ? 'border-primary/20 bg-primary/5' : 'hover:border-primary/30'}`}>
                        <div className="p-4 sm:p-6 flex items-start sm:items-center gap-4 sm:gap-6">
                           <div className="p-3 rounded-full bg-primary/10 text-primary shrink-0 group-hover:scale-110 transition-transform">
                             <Building2 className="w-6 h-6" />
                           </div>
                           <div className="flex-1 min-w-0">
                             <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                               <h3 className="text-lg font-semibold truncate group-hover:text-primary transition-colors">
                                 {org.name}
                               </h3>
                               {isPrimary && (
                                 <Badge variant="secondary" className="text-xs">
                                   {org.type === OrgType.EMBASSY ? 'Siège' : 'Principal'}
                                 </Badge>
                               )}
                             </div>
                             <div className="flex items-center gap-4 text-sm text-muted-foreground">
                               <span className="flex items-center gap-1">
                                 <MapPin className="w-3.5 h-3.5" />
                                 {org.address.city}, {countryName}
                               </span>
                               {org.phone && (
                                 <span className="hidden sm:flex items-center gap-1">
                                   <Phone className="w-3.5 h-3.5" />
                                   {org.phone}
                                 </span>
                               )}
                             </div>
                           </div>
                           <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                        </div>
                      </Card>
                    </Link>
                  )
                }

                return (
                  <Link
                    key={org._id}
                    to="/orgs/$slug"
                    params={{ slug: org.slug }}
                    className="block group h-full"
                  >
                    <Card className={`h-full relative transition-all hover:shadow-lg ${
                      isPrimary ? 'bg-primary/5 border-primary/20 hover:border-primary/40' : 'hover:border-primary/30'
                    }`}>
                       {isPrimary && (
                        <Badge className="absolute top-4 right-4 z-10">
                          {org.type === OrgType.EMBASSY ? t('consulates.embassy', 'Ambassade') : t('consulates.headquarters')}
                        </Badge>
                      )}

                      <CardHeader className="text-center pb-2">
                        <div className="mx-auto p-4 rounded-full bg-primary/10 text-primary w-16 h-16 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <MapPin className="w-8 h-8" />
                        </div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {org.address.city}
                        </CardTitle>
                        <CardDescription className="flex items-center justify-center gap-2">
                           <span className={`fi fi-${org.address.country.toLowerCase()} rounded-sm`}></span>
                           {countryName}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-4 text-sm text-center">
                        <div className="flex flex-col gap-1 items-center text-muted-foreground">
                          <span className="font-medium text-foreground">{org.name}</span>
                          <span>{formatAddress(org.address)}</span>
                        </div>
                        
                        {(org.phone || org.openingHours) && (
                          <div className="pt-4 border-t w-full flex flex-wrap justify-center gap-3">
                             {org.phone && (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Phone className="w-3.5 h-3.5" />
                                <span>{org.phone}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>

                      <CardFooter className="justify-center pt-2 pb-6">
                        <span className="inline-flex items-center gap-2 text-primary font-medium group-hover:underline text-sm">
                          {t('consulates.viewDetails', 'Voir les détails')}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </CardFooter>
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
