import { ServiceType } from '@/types/services';
import { useDemo } from '@/contexts/DemoContext';

interface AccessCheck {
  allowed: boolean;
  reason?: string;
}

export function useCanAccessService(serviceType: ServiceType): AccessCheck {
  const { currentUser, currentEntity, availableServices } = useDemo();

  // Admin système a accès à tout
  if (currentUser?.role === 'ADMIN') {
    return { allowed: true };
  }

  // Pas d'entité = pas d'accès (sauf admin)
  if (!currentEntity) {
    return { allowed: false, reason: 'Aucune entité associée' };
  }

  // Vérifier si le service est activé pour cette entité
  if (!availableServices.includes(serviceType)) {
    return { 
      allowed: false, 
      reason: `Le service ${serviceType} n'est pas activé pour ${currentEntity.name}` 
    };
  }

  return { allowed: true };
}
