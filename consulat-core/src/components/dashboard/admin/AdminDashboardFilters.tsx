import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Download, FileSpreadsheet, Filter, X } from 'lucide-react';
import { format, subDays, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export interface DashboardFilters {
  dateRange: { from: Date; to: Date };
  requestType?: string;
  status?: string;
  agent?: string;
  organization?: string;
}

interface AdminDashboardFiltersProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  onExportPDF: () => void;
  onExportExcel: () => void;
}

const REQUEST_TYPES = [
  { value: 'all', label: 'Tous les types' },
  { value: 'PASSPORT', label: 'Passeport' },
  { value: 'VISA', label: 'Visa' },
  { value: 'CIVIL_REGISTRY', label: 'État Civil' },
  { value: 'LEGALIZATION', label: 'Légalisation' },
  { value: 'CONSULAR_CARD', label: 'Carte Consulaire' },
];

const STATUSES = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'COMPLETED', label: 'Terminé' },
  { value: 'REJECTED', label: 'Rejeté' },
];

const DATE_PRESETS = [
  { label: '7 derniers jours', days: 7 },
  { label: '30 derniers jours', days: 30 },
  { label: '3 derniers mois', months: 3 },
  { label: '6 derniers mois', months: 6 },
  { label: '12 derniers mois', months: 12 },
];

export function AdminDashboardFilters({
  filters,
  onFiltersChange,
  onExportPDF,
  onExportExcel,
}: AdminDashboardFiltersProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const activeFiltersCount = [
    filters.requestType && filters.requestType !== 'all',
    filters.status && filters.status !== 'all',
    filters.agent,
    filters.organization,
  ].filter(Boolean).length;

  const handlePresetClick = (preset: typeof DATE_PRESETS[0]) => {
    const to = new Date();
    const from = preset.months 
      ? subMonths(to, preset.months)
      : subDays(to, preset.days || 7);
    
    onFiltersChange({
      ...filters,
      dateRange: { from, to },
    });
    setIsCalendarOpen(false);
  };

  const clearFilters = () => {
    onFiltersChange({
      dateRange: { from: subMonths(new Date(), 1), to: new Date() },
      requestType: 'all',
      status: 'all',
      agent: undefined,
      organization: undefined,
    });
  };

  return (
    <Card className="neu-raised">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Date Range */}
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 min-w-[240px] justify-start">
                <CalendarIcon className="h-4 w-4" />
                {format(filters.dateRange.from, 'dd MMM yyyy', { locale: fr })} - {format(filters.dateRange.to, 'dd MMM yyyy', { locale: fr })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="flex">
                <div className="border-r p-2 space-y-1">
                  <p className="text-sm font-medium px-2 py-1">Période</p>
                  {DATE_PRESETS.map((preset) => (
                    <Button
                      key={preset.label}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handlePresetClick(preset)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
                <Calendar
                  mode="range"
                  selected={{ from: filters.dateRange.from, to: filters.dateRange.to }}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      onFiltersChange({ ...filters, dateRange: { from: range.from, to: range.to } });
                    }
                  }}
                  locale={fr}
                  numberOfMonths={2}
                />
              </div>
            </PopoverContent>
          </Popover>

          {/* Request Type */}
          <Select
            value={filters.requestType || 'all'}
            onValueChange={(value) => onFiltersChange({ ...filters, requestType: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type de demande" />
            </SelectTrigger>
            <SelectContent>
              {REQUEST_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status */}
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Active Filters Badge */}
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Filter className="h-3 w-3" />
              {activeFiltersCount} filtre(s)
              <button onClick={clearFilters} className="ml-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Export Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onExportPDF} className="gap-2">
              <Download className="h-4 w-4" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={onExportExcel} className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
