import { Link } from '@tanstack/react-router'
import { ArrowRight, type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '../ui/card'

interface ServiceCardProps {
  icon: LucideIcon
  title: string
  description: string
  href?: string
  color?: string
} 

export function ServiceCard({ 
  icon: Icon, 
  title, 
  description, 
  href = '/',
  color = 'bg-primary/10 text-primary'}: ServiceCardProps) {
  return (
    <Link to={href} className="block group">
      <Card className="hover:border-primary/50 hover:shadow-[0_4px_20px_rgba(59,130,246,0.12)] transition-all duration-200 hover:-translate-y-0.5">
        <CardContent>
          {/* Icon */}
          <div className={`w-12 h-12 rounded-[10px] flex items-center justify-center mb-4 ${color}`}>
            <Icon className="w-6 h-6" />
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-foreground mb-2">
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {description}
          </p>

          {/* Link */}
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2.5 transition-all">
            En savoir plus
            <ArrowRight className="w-4 h-4" />
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}

export default ServiceCard
