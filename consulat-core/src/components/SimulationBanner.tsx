import { useDemo } from '@/contexts/DemoContext';
import { COUNTRY_FLAGS } from '@/types/entity';
import { Button } from '@/components/ui/button';
import { X, TestTube2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslation } from 'react-i18next';

export function SimulationBanner() {
  const { t } = useTranslation();
  const { currentUser, currentEntity, clearSimulation, isSimulating } = useDemo();

  if (!isSimulating) return null;

  return (
    <Alert className="fixed top-0 left-0 right-0 z-50 rounded-none border-b-2 border-primary bg-accent/95 backdrop-blur-sm animate-slide-down">
      <TestTube2 className="h-5 w-5" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <span className="font-semibold">{t('simulation.active')}</span>
          <span className="text-lg">{currentUser?.badge}</span>
          <span className="font-medium">{currentUser?.name}</span>
          {currentEntity && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>{COUNTRY_FLAGS[currentEntity.countryCode]}</span>
              <span>{currentEntity.city}</span>
            </span>
          )}
        </div>
        <Button
          onClick={clearSimulation}
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          <X className="h-4 w-4" />
          {t('simulation.exit')}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
