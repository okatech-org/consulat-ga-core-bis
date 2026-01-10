import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { SignedIn, SignedOut, SignUpButton } from '@clerk/clerk-react'
import {
  Calendar,
  FileText,
  HelpCircle,
  MapPin,
  Phone,
  UserPlus,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card, CardContent } from '../ui/card'

interface HeroProps {
  onServiceClick?: () => void
}

export function Hero({ onServiceClick }: HeroProps) {
  const { t } = useTranslation()

  return (
    <section className="relative min-h-[90vh] flex items-center">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero-background.png"
          alt="Gabon cityscape"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-3xl">
          {/* Badge */}
          <Badge variant="secondary" className="mb-6 bg-white/10 backdrop-blur-sm border-white/20 text-white/90 h-auto py-2 px-4 text-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-2" />
            {t('hero.badge')}
          </Badge>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            {t('hero.title')}{' '}
            <span className="text-[oklch(0.85_0.16_90)]">{t('hero.titleHighlight')}</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-white/80 mb-4 font-light">
            {t('hero.subtitle')}
          </p>
          <p className="text-lg text-white/60 mb-8 max-w-2xl">
            {t('hero.description')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mb-12">
            {/* Primary CTA - Changes based on auth state */}
            <SignedOut>
              <SignUpButton mode="modal" forceRedirectUrl="/my-space">
                <Button size="lg" className="h-12 px-6 rounded-xl shadow-lg shadow-primary/30">
                  <UserPlus className="w-5 h-5 mr-2" />
                  {t('hero.createSpace', 'Créer mon espace consulaire')}
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Button asChild size="lg" className="h-12 px-6 rounded-xl shadow-lg shadow-primary/30">
                <Link to="/my-space">
                  <UserPlus className="w-5 h-5 mr-2" />
                  {t('hero.accessSpace', 'Accéder à mon espace')}
                </Link>
              </Button>
            </SignedIn>

            <Button asChild size="lg" variant="outline" className="h-12 px-6 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-white/20 hover:text-white">
              <Link to="/">
                <Calendar className="w-5 h-5 mr-2" />
                {t('hero.bookAppointment')}
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={onServiceClick}
              className="h-12 px-6 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-white/20 hover:text-white"
            >
              <FileText className="w-5 h-5 mr-2" />
              {t('hero.ourServices')}
            </Button>
          </div>

          {/* Emergency Contact */}
          <Card className="inline-flex items-center gap-3 py-3 px-5 rounded-xl bg-red-500/20 backdrop-blur-sm border-red-500/30 shadow-none ring-0">
            <CardContent className="flex items-center gap-3 p-0">
              <Phone className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-white/60 text-sm">{t('hero.emergencyLabel')}</p>
                <p className="text-white font-semibold">+33 1 XX XX XX XX</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Access Cards - Floating over hero bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 translate-y-1/2">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAccessCard
              icon={<FileText className="w-6 h-6" />}
              title={t('hero.quickAccess.news')}
              description={t('hero.quickAccess.newsDesc')}
              color="bg-blue-500/20"
              iconColor="text-blue-400"
            />
            <QuickAccessCard
              icon={<Calendar className="w-6 h-6" />}
              title={t('hero.quickAccess.services')}
              description={t('hero.quickAccess.servicesDesc')}
              to="/services"
              color="bg-green-500/20"
              iconColor="text-green-400"
            />
            <QuickAccessCard
              icon={<MapPin className="w-6 h-6" />}
              title={t('hero.quickAccess.directory')}
              description={t('hero.quickAccess.directoryDesc')}
              to="/orgs"
              color="bg-yellow-500/20"
              iconColor="text-yellow-400"
            />
            <QuickAccessCard
              icon={<HelpCircle className="w-6 h-6" />}
              title={t('hero.quickAccess.faq')}
              description={t('hero.quickAccess.faqDesc')}
              color="bg-purple-500/20"
              iconColor="text-purple-400"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

interface QuickAccessCardProps {
  icon: React.ReactNode
  title: string
  description: string
  to?: string
  color: string
  iconColor: string
}

function QuickAccessCard({ icon, title, description, to = "/", color, iconColor }: QuickAccessCardProps) {
  return (
    <Link to={to} className="block">
      <Card className="group flex items-center gap-4 p-4 hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer">
        <CardContent className="flex items-center gap-4 p-0">
          <div className={`p-3 rounded-xl ${color} ${iconColor}`}>
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default Hero
