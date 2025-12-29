import { Link } from '@tanstack/react-router'
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

const services = [
  {
    icon: BookOpenCheck,
    title: 'Passeport',
    description: 'Demande, renouvellement et suivi de votre passeport gabonais. Procédure simplifiée et sécurisée.',
    href: '/services/passeport',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  {
    icon: Globe,
    title: 'Visa',
    description: 'Demandes de visa pour le Gabon. Visa touristique, affaires, travail et autres catégories.',
    href: '/services/visa',
    color: 'bg-green-500/10 text-green-600 dark:text-green-400',
  },
  {
    icon: FileText,
    title: 'État Civil',
    description: 'Actes de naissance, mariage, décès. Transcription et légalisation des documents.',
    href: '/services/etat-civil',
    color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  },
  {
    icon: BookOpen,
    title: 'Inscription Consulaire',
    description: 'Inscrivez-vous au registre des Gabonais de l\'étranger. Restez informé et protégé.',
    href: '/services/inscription',
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
  {
    icon: FileCheck,
    title: 'Légalisation',
    description: 'Authentification et légalisation de vos documents officiels pour usage international.',
    href: '/services/legalisation',
    color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  },
  {
    icon: ShieldAlert,
    title: 'Assistance d\'Urgence',
    description: 'Aide consulaire en cas d\'urgence : perte de documents, difficultés à l\'étranger.',
    href: '/services/urgence',
    color: 'bg-red-500/10 text-red-600 dark:text-red-400',
  },
]

export function ServicesSection() {
  return (
    <section className="py-20 px-6 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary">
            Nos Services
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Services Consulaires
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez l'ensemble des services proposés par les représentations 
            consulaires de la République Gabonaise à l'étranger.
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
              Voir Tous les Services
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default ServicesSection
