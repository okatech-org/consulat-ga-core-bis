import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'convex/react'
import {
  BookOpen,
  BookOpenCheck,
  FileCheck,
  FileText,
  Globe,
  ShieldAlert,
  Search,
  Filter,
  X,
  type LucideIcon,
} from 'lucide-react'
import { api } from '@convex/_generated/api'
import { ServiceCategory } from '@convex/lib/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Footer } from '@/components/Footer'
import { ServiceCard } from '@/components/home/ServiceCard'
import { z } from 'zod'
import { useState, useEffect } from 'react'

const servicesSearchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(), // comma-separated
})

export const Route = createFileRoute('/services/')({
  component: ServicesPage,
  validateSearch: (search) => servicesSearchSchema.parse(search),
})

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
  const navigate = useNavigate({ from: Route.fullPath })
  const search = Route.useSearch()
  const services = useQuery(api.services.listCommonServices, {})

  const [searchQuery, setSearchQuery] = useState(search.query || '')

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

  const selectedCategories = search.category ? search.category.split(',') : []

  const toggleCategory = (cat: string) => {
    const current = selectedCategories
    const next = current.includes(cat) 
      ? current.filter(c => c !== cat)
      : [...current, cat]
    updateFilters({ category: next.join(',') || undefined })
  }

  const isLoading = services === undefined

  const filteredServices = services?.filter(service => {
    const matchesQuery = !search.query || 
      service.name.toLowerCase().includes(search.query.toLowerCase()) ||
      service.description.toLowerCase().includes(search.query.toLowerCase())
    
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(service.category)

    return matchesQuery && matchesCategory
  })

  const clearFilters = () => {
    setSearchQuery('')
    updateFilters({ query: undefined, category: undefined })
  }

  const activeFiltersCount = (search.query ? 1 : 0) + selectedCategories.length

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
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {t('services.pageDescription', 'Découvrez l\'ensemble des services consulaires proposés par la République Gabonaise pour ses citoyens à l\'étranger.')}
          </p>

           {/* Search Bar */}
           <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input 
              className="h-14 pl-12 pr-4 rounded-2xl bg-background shadow-lg border-primary/10 text-lg placeholder:text-muted-foreground/50 focus-visible:ring-primary/20"
              placeholder={t('services.searchPlaceholder', 'Rechercher un service...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-64 shrink-0 space-y-8">
              <div className="lg:sticky lg:top-24 space-y-6">
                <div className="flex items-center justify-between">
                   <h3 className="font-semibold text-lg flex items-center gap-2">
                     <Filter className="w-4 h-4" />
                     Filtres
                   </h3>
                   {activeFiltersCount > 0 && (
                     <Button 
                       variant="ghost" 
                       size="sm" 
                       className="h-8 px-2 text-muted-foreground hover:text-foreground"
                       onClick={clearFilters}
                     >
                       Tout effacer
                     </Button>
                   )}
                </div>

                <div className="space-y-4">
                  <div className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                    Catégories
                  </div>
                  <div className="space-y-3">
                    {Object.values(ServiceCategory).map((category) => {
                      const label = categoryLabels[category] || category
                      const config = categoryConfig[category] || categoryConfig[ServiceCategory.OTHER]
                      const Icon = config.icon
                      const isSelected = selectedCategories.includes(category)

                      return (
                        <div key={category} className="flex items-center space-x-3">
                          <Checkbox 
                            id={`cat-${category}`} 
                            checked={isSelected}
                            onCheckedChange={() => toggleCategory(category)}
                          />
                          <Label 
                            htmlFor={`cat-${category}`}
                            className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer w-full py-1"
                          >
                            <span className={`p-1 rounded ${config.bgColor} ${config.color.split(' ')[0]}`}>
                              <Icon className="w-3 h-3" />
                            </span>
                            {label}
                          </Label>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </aside>

            {/* Services Grid */}
            <div className="flex-1">
               <div className="mb-6 flex items-center justify-between">
                 <h2 className="text-xl font-semibold">
                   {filteredServices ? `${filteredServices.length} service${filteredServices.length > 1 ? 's' : ''}` : 'Chargement...'}
                 </h2>
                 {/* Mobile Filter Toggle could go here if needed */}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {isLoading ? (
                   Array.from({ length: 6 }).map((_, i) => <ServiceCardSkeleton key={i} />)
                 ) : filteredServices?.length === 0 ? (
                   <div className="col-span-full py-12 text-center rounded-xl bg-muted/30 border-2 border-dashed">
                      <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 border">
                        <Search className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Aucun service trouvé</h3>
                      <p className="text-muted-foreground mb-4">
                        Essayez de modifier vos filtres ou votre recherche.
                      </p>
                      <Button onClick={clearFilters} variant="outline">
                        Voir tous les services
                      </Button>
                   </div>
                 ) : (
                   filteredServices?.map((service) => {
                     const config = categoryConfig[service.category] || categoryConfig[ServiceCategory.OTHER]
                     const categoryLabel = categoryLabels[service.category] || service.category

                     return (
                       <ServiceCard
                         key={service._id}
                         icon={config.icon}
                         title={service.name}
                         description={service.description}
                         href={`/services/${service.slug}`}
                         color={config.color}
                         badge={categoryLabel}
                         price={service.defaultFee ? `${service.defaultFee} ${service.defaultCurrency || 'FCFA'}` : undefined}
                         delay={service.defaultEstimatedDays ? `${service.defaultEstimatedDays} jours` : undefined}
                       />
                     )
                   })
                 )}
               </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
