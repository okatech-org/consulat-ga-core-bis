import { Link } from '@tanstack/react-router'
import { MapPin, Phone, Clock, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'

const consulates = [
  {
    city: 'Paris',
    country: 'France',
    address: '26 bis Avenue Raphaël, 75016 Paris',
    phone: '+33 1 42 99 68 68',
    hours: 'Lun-Ven: 9h00-16h00',
    isPrimary: true,
  },
  {
    city: 'Bruxelles',
    country: 'Belgique',
    address: 'Avenue Franklin Roosevelt 112, 1050 Bruxelles',
    phone: '+32 2 743 00 40',
    hours: 'Lun-Ven: 9h00-15h00',
    isPrimary: false,
  },
  {
    city: 'Washington D.C.',
    country: 'États-Unis',
    address: '2034 20th Street NW, Washington, DC 20009',
    phone: '+1 202 797 1000',
    hours: 'Lun-Ven: 9h00-17h00',
    isPrimary: false,
  },
  {
    city: 'Londres',
    country: 'Royaume-Uni',
    address: '27 Elvaston Place, London SW7 5NL',
    phone: '+44 20 7823 9986',
    hours: 'Lun-Ven: 9h30-16h30',
    isPrimary: false,
  },
]

export function ConsulateLocations() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary">
            Nos Représentations
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Consulats du Gabon dans le Monde
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trouvez le consulat gabonais le plus proche de chez vous pour 
            effectuer vos démarches administratives.
          </p>
        </div>

        {/* Consulates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {consulates.map((consulate) => (
            <Card
              key={consulate.city}
              className={`relative ${
                consulate.isPrimary
                  ? 'bg-primary/5 border-primary/20 hover:border-primary/40'
                  : 'hover:border-primary/30'
              }`}
            >
              {consulate.isPrimary && (
                <Badge className="absolute top-4 right-4">
                  Siège Principal
                </Badge>
              )}

              <CardHeader className="pb-2">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{consulate.city}</CardTitle>
                    <CardDescription>{consulate.country}</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-foreground">{consulate.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                  <a
                    href={`tel:${consulate.phone.replace(/\s/g, '')}`}
                    className="text-primary hover:underline"
                  >
                    {consulate.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground">{consulate.hours}</span>
                </div>
              </CardContent>

              <Separator className="mx-6" />

              <CardFooter className="pt-4">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-primary font-medium hover:underline text-sm"
                >
                  Voir les détails
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center">
          <Button asChild variant="outline" size="lg" className="h-12 px-6 rounded-xl border-2 border-primary text-primary hover:bg-primary hover:text-white">
            <Link to="/">
              <MapPin className="w-5 h-5 mr-2" />
              Voir Tous les Consulats
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default ConsulateLocations
