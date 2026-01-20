import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ServiceCategory } from '@convex/lib/validators'
import {
  Clock,
  FileText,
  Download,
  CheckCircle2,
  Users,
  BookOpenCheck,
  Globe,
  BookOpen,
  FileCheck,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'

const CATEGORY_CONFIG: Record<string, { icon: LucideIcon; color: string }> = {
  [ServiceCategory.IDENTITY]: { icon: BookOpenCheck, color: 'bg-blue-500' },
  [ServiceCategory.VISA]: { icon: Globe, color: 'bg-green-500' },
  [ServiceCategory.CIVIL_STATUS]: { icon: FileText, color: 'bg-yellow-500' },
  [ServiceCategory.REGISTRATION]: { icon: BookOpen, color: 'bg-purple-500' },
  [ServiceCategory.CERTIFICATION]: { icon: FileCheck, color: 'bg-orange-500' },
  [ServiceCategory.ASSISTANCE]: { icon: ShieldAlert, color: 'bg-red-500' },
  [ServiceCategory.OTHER]: { icon: FileText, color: 'bg-gray-500' },
}

const getServiceCategoryLabel = (category: string) => {
  switch (category) {
    case ServiceCategory.IDENTITY:
      return 'Identité & Passeport'
    case ServiceCategory.VISA:
      return 'Visa'
    case ServiceCategory.CIVIL_STATUS:
      return 'État Civil'
    case ServiceCategory.REGISTRATION:
      return 'Immatriculation'
    case ServiceCategory.CERTIFICATION:
      return 'Légalisation & Certification'
    case ServiceCategory.ASSISTANCE:
      return 'Assistance Consulaire'
    case ServiceCategory.OTHER:
      return 'Autre'
    default:
      return category
  }
}

interface RequiredDocument {
  type: string
  label: string
  required: boolean
}

interface ServiceInfo {
  _id: string
  name: string
  slug: string
  description: string
  category: string
  defaultDocuments?: RequiredDocument[]
  defaultFee?: number
  defaultCurrency?: string
  defaultEstimatedDays?: number
}

interface ServiceDetailModalProps {
  service: ServiceInfo | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateRequest?: (service: ServiceInfo) => void
}

export function ServiceDetailModal({
  service,
  open,
  onOpenChange,
  onCreateRequest,
}: ServiceDetailModalProps) {
  if (!service) return null

  const categoryConfig = CATEGORY_CONFIG[service.category] || CATEGORY_CONFIG[ServiceCategory.OTHER]
  const CategoryIcon = categoryConfig.icon
  const categoryLabel = getServiceCategoryLabel(service.category)

  const handleDownloadForm = () => {
    toast.success('Formulaire téléchargé', {
      description: `Formulaire de demande pour ${service.name}`,
    })
  }

  const handleCreateRequest = () => {
    if (onCreateRequest) {
      onCreateRequest(service)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:min-w-[700px] max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${categoryConfig.color}/10`}>
              <CategoryIcon className={`h-8 w-8 text-${categoryConfig.color.replace('bg-', '')}`} />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl">{service.name}</DialogTitle>
              <DialogDescription className="mt-2">
                {service.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Info badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1">
              <CategoryIcon className="h-3 w-3" />
              {categoryLabel}
            </Badge>
            {service.defaultEstimatedDays && (
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                {service.defaultEstimatedDays} jour{service.defaultEstimatedDays > 1 ? 's' : ''}
              </Badge>
            )}
            <Badge
              variant={service.defaultFee === 0 || !service.defaultFee ? 'default' : 'secondary'}
              className={service.defaultFee === 0 || !service.defaultFee ? 'bg-green-600' : ''}
            >
              {!service.defaultFee || service.defaultFee === 0
                ? 'Gratuit'
                : `${service.defaultFee.toLocaleString()} ${service.defaultCurrency || 'FCFA'}`}
            </Badge>
          </div>

          {/* Bénéficiaires éligibles */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Bénéficiaires éligibles
            </h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1 bg-green-600 text-white">
                <CheckCircle2 className="h-3 w-3" />
                Citoyens gabonais
              </Badge>
              <Badge variant="secondary" className="gap-1 bg-blue-600 text-white">
                <CheckCircle2 className="h-3 w-3" />
                Étrangers résidents
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Documents requis */}
          {service.defaultDocuments && service.defaultDocuments.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Documents requis ({service.defaultDocuments.length})
              </h4>
              <ul className="space-y-2">
                {service.defaultDocuments.map((doc, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <span className="text-sm">{doc.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {service.defaultDocuments && service.defaultDocuments.length > 0 && <Separator />}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleDownloadForm}
            >
              <Download className="h-4 w-4" />
              Télécharger le formulaire
            </Button>
            <Button className="flex-1 gap-2" onClick={handleCreateRequest}>
              <FileText className="h-4 w-4" />
              Créer une demande
            </Button>
          </div>

          {/* Info supplémentaire */}
          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Informations importantes</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Les documents doivent être originaux ou copies certifiées conformes</li>
              <li>Le délai de traitement est indicatif et peut varier selon le consulat</li>
              <li>Présentez-vous avec une pièce d'identité valide</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
