import { ServiceType } from '@/types/services';
import { getEntityById } from '@/data/mock-entities';

export function useEntityServices(entityId?: string): ServiceType[] {
  if (!entityId) return [];
  
  const entity = getEntityById(entityId);
  return (entity?.enabledServices as ServiceType[]) || [];
}
