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
import { Separator } from './ui/separator'
import { ModeToggle } from './mode-toggle'

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
    { label: t('footer.links.passport'), href: '/services?category=passport' },
    { label: t('footer.links.visa'), href: '/services?category=visa' },
    { label: t('footer.links.civilStatus'), href: '/services?category=civil_status' },
    { label: t('footer.links.registration'), href: '/services?category=registration' },
    { label: t('footer.links.legalization'), href: '/services?category=legalization' },
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
    <footer className="bg-muted/30 border-t border-border/40">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              {/* Gabonese Emblem Placeholder */}
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">GA</span>
              </div>
              <div>
                <div className="font-bold text-lg text-foreground">{t('footer.brand.name')}</div>
                <div className="text-sm text-muted-foreground">{t('footer.brand.country')}</div>
              </div>
            </div>
            
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              {t('footer.brand.description')}
            </p>

            {/* Social Links */}
             <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <Button
                  key={social.label}
                  asChild
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-primary/10 hover:text-primary text-muted-foreground w-8 h-8"
                >
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                </Button>
              ))}
            </div>

            <div className="space-y-2 text-sm text-muted-foreground pt-4">
               <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  26 bis Avenue Raphaël, 75016 Paris
               </p>
               <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <a href="tel:+33142996868" className="hover:text-primary">+33 1 42 99 68 68</a>
               </p>
               <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:contact@consulat.ga" className="hover:text-primary">contact@consulat.ga</a>
               </p>
            </div>
          </div>

          {/* Links Column */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
               <h3 className="font-semibold text-foreground mb-4">{t('footer.services')}</h3>
               <ul className="space-y-2">
                 {quickLinks.map((link) => (
                   <li key={link.label}>
                     <Link
                       to={link.href}
                       className="text-muted-foreground hover:text-primary transition-colors text-sm"
                     >
                       {link.label}
                     </Link>
                   </li>
                 ))}
               </ul>
            </div>
            
            <div>
               <h3 className="font-semibold text-foreground mb-4">{t('footer.resources')}</h3>
               <ul className="space-y-2">
                 {resourceLinks.map((link) => (
                   <li key={link.label}>
                     <Link
                       to={link.href}
                       className="text-muted-foreground hover:text-primary transition-colors text-sm"
                     >
                       {link.label}
                     </Link>
                   </li>
                 ))}
               </ul>
            </div>

             <div>
               <h3 className="font-semibold text-foreground mb-4">Légal</h3>
               <ul className="space-y-2">
                 {legalLinks.map((link) => (
                   <li key={link.label}>
                     <Link
                       to={link.href}
                       className="text-muted-foreground hover:text-primary transition-colors text-sm"
                     >
                       {link.label}
                     </Link>
                   </li>
                 ))}
               </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <Separator className="bg-border/40" />
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground/60 text-xs text-center md:text-left">
            {t('footer.copyright', { year: currentYear })}
          </p>
          <div className="flex items-center gap-4">
             <ModeToggle />
             <p className="text-muted-foreground/40 text-xs text-center md:text-left">
              v1.0.0
             </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
