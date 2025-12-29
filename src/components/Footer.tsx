import { Link } from '@tanstack/react-router'
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Separator } from './ui/separator'

const quickLinks = [
  { label: 'Passeport', href: '/services/passeport' },
  { label: 'Visa', href: '/services/visa' },
  { label: 'État Civil', href: '/services/etat-civil' },
  { label: 'Inscription Consulaire', href: '/services/inscription' },
  { label: 'Légalisation', href: '/services/legalisation' },
  { label: 'Prendre Rendez-vous', href: '/rendez-vous' },
]

const resourceLinks = [
  { label: 'FAQ', href: '/faq' },
  { label: 'Tarifs Consulaires', href: '/tarifs' },
  { label: 'Formulaires', href: '/formulaires' },
  { label: 'Actualités', href: '/actualites' },
  { label: 'Annuaire des Consulats', href: '/consulats' },
]

const legalLinks = [
  { label: 'Mentions Légales', href: '/mentions-legales' },
  { label: 'Politique de Confidentialité', href: '/confidentialite' },
  { label: 'Accessibilité', href: '/accessibilite' },
  { label: 'Plan du Site', href: '/plan-du-site' },
]

const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              {/* Gabonese Emblem Placeholder */}
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg">GA</span>
              </div>
              <div>
                <div className="font-bold text-lg">Consulat.ga</div>
                <div className="text-sm text-background/60">République Gabonaise</div>
              </div>
            </div>
            <p className="text-background/70 text-sm leading-relaxed mb-6">
              Plateforme officielle des services consulaires de la République Gabonaise 
              pour les citoyens résidant à l'étranger.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-background/70">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>26 bis Avenue Raphaël, 75016 Paris</span>
              </div>
              <div className="flex items-center gap-3 text-background/70">
                <Phone className="w-4 h-4 shrink-0" />
                <a href="tel:+33142996868" className="hover:text-primary transition-colors">
                  +33 1 42 99 68 68
                </a>
              </div>
              <div className="flex items-center gap-3 text-background/70">
                <Mail className="w-4 h-4 shrink-0" />
                <a href="mailto:contact@consulat.ga" className="hover:text-primary transition-colors">
                  contact@consulat.ga
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Services</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-background/70 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Ressources</h3>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-background/70 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Restez Informé</h3>
            <p className="text-background/70 text-sm mb-4">
              Inscrivez-vous à notre newsletter pour recevoir les dernières actualités consulaires.
            </p>
            <form className="flex flex-col gap-3">
              <Input
                type="email"
                placeholder="Votre email"
                className="bg-background/10 border-background/20 text-background placeholder:text-background/50 focus-visible:ring-primary h-11 rounded-xl"
              />
              <Button type="submit" className="h-11 rounded-xl">
                S'inscrire
              </Button>
            </form>

            {/* Social Links */}
            <div className="flex items-center gap-2 mt-6">
              {socialLinks.map((social) => (
                <Button
                  key={social.label}
                  asChild
                  variant="ghost"
                  size="icon"
                  className="rounded-xl bg-background/10 hover:bg-primary text-background/70 hover:text-white"
                >
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <Separator className="bg-background/10" />
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/50 text-sm text-center md:text-left">
            © {currentYear} Consulat.ga - République Gabonaise. Tous droits réservés.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="text-background/50 hover:text-primary transition-colors text-sm"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
