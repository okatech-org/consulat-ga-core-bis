import { Link } from '@tanstack/react-router'
import { ArrowRight, type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'

interface ServiceCardProps {
  icon: LucideIcon
  title: string
  description: string
  href?: string
  color?: string
  price?: string
  delay?: string
  badge?: string
}

export function ServiceCard({ 
  icon: Icon, 
  title, 
  description, 
  href = '/',
  color = 'bg-primary/10 text-primary',
  price,
  delay,
  badge
}: ServiceCardProps) {
  return (
    <Link to={href} className="block group">
      <Card className="h-full hover:border-primary/50 hover:shadow-lg transition-all duration-200">
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            {badge && (
              <Badge variant="secondary" className="text-xs bg-muted/50">
                {badge}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-base mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {price && <span className="font-medium">{price}</span>}
              {delay && <span>• {delay}</span>}
            </div>
            
            <div className="flex items-center gap-1 text-primary text-sm font-medium">
              <span>En savoir plus</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default ServiceCard
