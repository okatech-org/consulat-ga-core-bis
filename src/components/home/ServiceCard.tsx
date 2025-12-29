import { Link } from '@tanstack/react-router'
import { ArrowRight, type LucideIcon } from 'lucide-react'
import { Card, CardFooter, CardHeader, CardTitle, CardDescription } from '../ui/card'

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
  color = 'bg-primary/10 text-primary'
}: ServiceCardProps) {
  return (
    <Link to={href} className="block group">
      <Card className="relative h-full hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
        
        <CardHeader className="relative z-10 pb-2">
          {/* Icon */}
          <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${color} mb-2`}>
            <Icon className="w-7 h-7" />
          </div>
          <CardTitle className="text-xl group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          <CardDescription className="leading-relaxed">
            {description}
          </CardDescription>
        </CardHeader>

        <CardFooter className="relative z-10 pt-0">
          <span className="inline-flex items-center gap-2 text-primary font-medium text-sm">
            En savoir plus
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  )
}

export default ServiceCard
