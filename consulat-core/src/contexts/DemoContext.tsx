import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DemoUser } from '@/types/roles';
import { Entity } from '@/types/entity';
import { ServiceType } from '@/types/services';
import { getUserById } from '@/data/mock-users';
import { getEntityById } from '@/data/mock-entities';

interface DemoContextValue {
  currentUser: DemoUser | null;
  currentEntity: Entity | null;
  availableServices: ServiceType[];
  simulateUser: (userId: string) => void;
  clearSimulation: () => void;
  isSimulating: boolean;
}

const DemoContext = createContext<DemoContextValue | undefined>(undefined);

const STORAGE_KEY = 'consulat_demo_simulation';

export function DemoProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null);
  const [currentEntity, setCurrentEntity] = useState<Entity | null>(null);

  // Charger la simulation depuis localStorage au montage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const { userId } = JSON.parse(stored);
        const user = getUserById(userId);
        if (user) {
          setCurrentUser(user);
          if (user.entityId) {
            const entity = getEntityById(user.entityId);
            setCurrentEntity(entity || null);
          }
        }
      } catch (error) {
        console.error('Error loading simulation:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const simulateUser = (userId: string) => {
    const user = getUserById(userId);
    if (!user) return;

    setCurrentUser(user);
    
    if (user.entityId) {
      const entity = getEntityById(user.entityId);
      setCurrentEntity(entity || null);
    } else {
      setCurrentEntity(null);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId }));
  };

  const clearSimulation = () => {
    setCurrentUser(null);
    setCurrentEntity(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const availableServices: ServiceType[] = currentEntity?.enabledServices as ServiceType[] || [];

  const value: DemoContextValue = {
    currentUser,
    currentEntity,
    availableServices,
    simulateUser,
    clearSimulation,
    isSimulating: currentUser !== null,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}
