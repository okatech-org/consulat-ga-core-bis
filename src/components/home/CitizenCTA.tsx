import { Link } from '@tanstack/react-router'
import {
  CheckCircle2,
  Clock,
  FileText,
  Shield,
  UserPlus,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card, CardContent } from '../ui/card'

const benefits = [
  {
    icon: Clock,
    title: 'Suivi en temps réel',
    description: 'Suivez l\'avancement de vos demandes à tout moment',
  },
  {
    icon: FileText,
    title: 'Documents dématérialisés',
    description: 'Accédez à vos documents officiels en ligne',
  },
  {
    icon: Shield,
    title: 'Paiement sécurisé',
    description: 'Réglez vos frais consulaires en toute sécurité',
  },
  {
    icon: CheckCircle2,
    title: 'Rendez-vous simplifiés',
    description: 'Réservez vos créneaux en quelques clics',
  },
]

export function CitizenCTA() {
  return (
    <section className="py-20 px-6 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <Badge variant="secondary" className="mb-4 bg-primary/20 text-primary">
              Compte Citoyen
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Créez votre Compte Citoyen Gabonais
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Un compte unique pour accéder à tous les services consulaires en ligne. 
              Simplifiez vos démarches administratives où que vous soyez dans le monde.
            </p>

            {/* Benefits Grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    <benefit.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="h-12 px-6 rounded-xl shadow-lg shadow-primary/20">
                <Link to="/">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Créer mon compte
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-6 rounded-xl">
                <Link to="/">
                  J'ai déjà un compte
                </Link>
              </Button>
            </div>
          </div>

          {/* Illustration / Stats Card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
            <Card className="relative p-8 shadow-2xl rounded-3xl">
              <CardContent className="p-0">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="text-center p-4 rounded-2xl bg-primary/5">
                    <div className="text-4xl font-bold text-primary mb-1">50K+</div>
                    <div className="text-sm text-muted-foreground">Citoyens inscrits</div>
                  </div>
                  <div className="text-center p-4 rounded-2xl bg-accent/10">
                    <div className="text-4xl font-bold text-accent-foreground mb-1">15+</div>
                    <div className="text-sm text-muted-foreground">Consulats connectés</div>
                  </div>
                  <div className="text-center p-4 rounded-2xl bg-green-500/10">
                    <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-1">98%</div>
                    <div className="text-sm text-muted-foreground">Satisfaction</div>
                  </div>
                  <div className="text-center p-4 rounded-2xl bg-blue-500/10">
                    <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">24/7</div>
                    <div className="text-sm text-muted-foreground">Disponibilité</div>
                  </div>
                </div>

                {/* Testimonial */}
                <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                  "Grâce à Consulat.ga, j'ai pu renouveler mon passeport depuis Londres 
                  sans avoir à me déplacer. Service rapide et efficace !"
                  <footer className="mt-2 text-sm font-medium text-foreground not-italic">
                    — Marie N., Londres
                  </footer>
                </blockquote>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CitizenCTA
