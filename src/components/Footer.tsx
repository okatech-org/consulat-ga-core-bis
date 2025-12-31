import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
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

const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
]

export function Footer() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { label: t('footer.links.passport'), href: '/services/passeport' },
    { label: t('footer.links.visa'), href: '/services/visa' },
    { label: t('footer.links.civilStatus'), href: '/services/etat-civil' },
    { label: t('footer.links.registration'), href: '/services/inscription' },
    { label: t('footer.links.legalization'), href: '/services/legalisation' },
    { label: t('footer.links.appointment'), href: '/rendez-vous' },
  ]

  const resourceLinks = [
    { label: t('footer.links.faq'), href: '/faq' },
    { label: t('footer.links.fees'), href: '/tarifs' },
    { label: t('footer.links.forms'), href: '/formulaires' },
    { label: t('footer.links.news'), href: '/actualites' },
    { label: t('footer.links.directory'), href: '/orgs' },
  ]

  const legalLinks = [
    { label: t('footer.links.legal'), href: '/mentions-legales' },
    { label: t('footer.links.privacy'), href: '/confidentialite' },
    { label: t('footer.links.accessibility'), href: '/accessibilite' },
    { label: t('footer.links.sitemap'), href: '/plan-du-site' },
  ]

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
                <div className="font-bold text-lg">{t('footer.brand.name')}</div>
                <div className="text-sm text-background/60">{t('footer.brand.country')}</div>
              </div>
            </div>
            <p className="text-background/70 text-sm leading-relaxed mb-6">
              {t('footer.brand.description')}
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
            <h3 className="font-semibold text-lg mb-6">{t('footer.services')}</h3>
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
            <h3 className="font-semibold text-lg mb-6">{t('footer.resources')}</h3>
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
            <h3 className="font-semibold text-lg mb-6">{t('footer.newsletter.title')}</h3>
            <p className="text-background/70 text-sm mb-4">
              {t('footer.newsletter.description')}
            </p>
            <form className="flex flex-col gap-3">
              <Input
                type="email"
                placeholder={t('footer.newsletter.placeholder')}
                className="bg-background/10 border-background/20 text-background placeholder:text-background/50 focus-visible:ring-primary h-11 rounded-xl"
              />
              <Button type="submit" className="h-11 rounded-xl">
                {t('footer.newsletter.subscribe')}
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
            {t('footer.copyright', { year: currentYear })}
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
