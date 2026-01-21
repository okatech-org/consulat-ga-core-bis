import ReactMarkdown from 'react-markdown'
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
import { useTranslation } from 'react-i18next'
import { getLocalizedValue } from '@/lib/i18n-utils'

const CATEGORY_CONFIG: Record<string, { icon: LucideIcon; color: string }> = {
  [ServiceCategory.Identity]: { icon: BookOpenCheck, color: 'bg-blue-500' },
  [ServiceCategory.Visa]: { icon: Globe, color: 'bg-green-500' },
  [ServiceCategory.CivilStatus]: { icon: FileText, color: 'bg-yellow-500' },
  [ServiceCategory.Registration]: { icon: BookOpen, color: 'bg-purple-500' },
  [ServiceCategory.Certification]: { icon: FileCheck, color: 'bg-orange-500' },
  [ServiceCategory.Assistance]: { icon: ShieldAlert, color: 'bg-red-500' },
  [ServiceCategory.Other]: { icon: FileText, color: 'bg-gray-500' },
}



interface RequiredDocument {
  type: string
  label: string
  required: boolean
}

interface ServiceInfo {
  _id: string
  name: { fr: string; en?: string } | string
  slug: string
  description: { fr: string; en?: string } | string
  category: string
  defaults?: {
    estimatedDays: number
    requiresAppointment: boolean
    requiredDocuments: RequiredDocument[]
  }
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
  const { t, i18n } = useTranslation()
  
  if (!service) return null

  // Handle potential case sensitivity or string vs enum issues by checking both original and mapped
  // Using explicit ServiceCategory enum values for safety
  const categoryKey = Object.values(ServiceCategory).includes(service.category as any) 
    ? service.category 
    : ServiceCategory.Other
    
  const categoryConfig = CATEGORY_CONFIG[categoryKey] || CATEGORY_CONFIG[ServiceCategory.Other]
  const CategoryIcon = categoryConfig.icon
  
  const suffix = service.category === ServiceCategory.Identity ? 'passport' :
               service.category === ServiceCategory.Certification ? 'legalization' :
               service.category === ServiceCategory.Assistance ? 'emergency' :
               service.category;
  const categoryLabel = t(`services.categoriesMap.${suffix}`)
  
  // Handle localized strings vs plain strings
  const serviceName = getLocalizedValue(service.name, i18n.language)
  const serviceDescription = getLocalizedValue(service.description, i18n.language)
  
  const defaults = service.defaults

  const handleDownloadForm = () => {
    toast.success(t('services.modal.formDownloaded'), {
      description: t('services.modal.formDownloadedDesc', { serviceName }),
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
              <DialogTitle className="text-2xl">{serviceName}</DialogTitle>
              <div className="mt-2 text-muted-foreground prose prose-sm dark:prose-invert max-w-none">
                 <ReactMarkdown>
                  {serviceDescription}
                </ReactMarkdown>
              </div>
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
            {!!defaults?.estimatedDays && (
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                {defaults.estimatedDays} {t('services.days', { count: defaults.estimatedDays })}
              </Badge>
            )}
            {/* Pricing removed as it is not in the schema */}
          </div>

          {/* Bénéficiaires éligibles */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              {t('services.modal.eligibleBeneficiaries')}
            </h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1 bg-green-600 text-white">
                <CheckCircle2 className="h-3 w-3" />
                {t('services.modal.citizens')}
              </Badge>
              <Badge variant="secondary" className="gap-1 bg-blue-600 text-white">
                <CheckCircle2 className="h-3 w-3" />
                {t('services.modal.residents')}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Documents requis */}
          {defaults?.requiredDocuments && defaults.requiredDocuments.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                {t('services.modal.requiredDocuments')} ({defaults.requiredDocuments.length})
              </h4>
              <ul className="space-y-2">
                {defaults.requiredDocuments.map((doc, index) => (
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

          {defaults?.requiredDocuments && defaults.requiredDocuments.length > 0 && <Separator />}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleDownloadForm}
            >
              <Download className="h-4 w-4" />
              {t('services.modal.downloadForm')}
            </Button>
            <Button className="flex-1 gap-2" onClick={handleCreateRequest}>
              <FileText className="h-4 w-4" />
              {t('services.modal.createRequest')}
            </Button>
          </div>

          {/* Info supplémentaire */}
          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">{t('services.modal.importantInfo')}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{t('services.modal.infoPoints.docs')}</li>
              <li>{t('services.modal.infoPoints.delay')}</li>
              <li>{t('services.modal.infoPoints.identity')}</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
