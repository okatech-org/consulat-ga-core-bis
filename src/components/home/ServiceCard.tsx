import { Link } from '@tanstack/react-router'
import { ArrowRight, Clock, type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { useTranslation } from 'react-i18next'

interface ServiceCardProps {
  icon: LucideIcon
  title: string
  description: string
  href?: string
  color?: string
  badge?: string
  price?: string
  delay?: string
  onClick?: () => void
} 

export function ServiceCard({ 
  icon: Icon, 
  title, 
  description, 
  href = '/',
  color = 'bg-primary/10 text-primary',
  badge,
  price,
  delay,
  onClick,
}: ServiceCardProps) {
  const { t } = useTranslation()

  const content = (
    <Card className="hover:border-primary/50 hover:shadow-[0_4px_20px_rgba(59,130,246,0.12)] transition-all duration-200 hover:-translate-y-0.5 h-full">
      <CardContent>
        {/* Header with icon and badge */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-[10px] flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
          {badge && (
            <Badge variant="outline" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-foreground mb-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
          {description}
        </p>

        {/* Footer with price and delay */}
        <div className="flex items-center justify-between text-sm mb-3">
          {delay && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>{delay}</span>
            </div>
          )}
          {price && (
            <span className={`font-medium ${price === 'Gratuit' || price === 'Free' ? 'text-green-600' : 'text-foreground'}`}>
              {price}
            </span>
          )}
        </div>

        {/* Link */}
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2.5 transition-all">
          {t('services.knowMore', 'En savoir plus')}
          <ArrowRight className="w-4 h-4" />
        </span>
      </CardContent>
    </Card>
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="block group text-left w-full cursor-pointer">
        {content}
      </button>
    )
  }

  return (
    <Link to={href} className="block group">
      {content}
    </Link>
  )
}

export default ServiceCard
