import React from 'react';
import { useDemo } from '@/contexts/DemoContext';
import IAstedInterface from './IAstedInterface';

/**
 * Wrapper qui injecte le rôle de l'utilisateur actuel dans IAstedInterface
 * Adapte les rôles du système consulaire aux rôles attendus par iAsted
 */
export default function IAstedInterfaceWrapper() {
  const { currentUser } = useDemo();

  // Mapper les rôles du système consulaire vers les rôles iAsted
  const mapUserRole = (role?: string): string => {
    if (!role) return 'citizen';

    switch (role.toUpperCase()) {
      case 'ADMIN':
      case 'CONSUL_GENERAL':
        return 'super_admin';
      
      case 'CONSUL':
      case 'VICE_CONSUL':
      case 'CHARGE_AFFAIRES_CONSULAIRES':
        return 'admin';
      
      case 'AGENT_CONSULAIRE':
      case 'AGENT':
      case 'CHANCELIER':
      case 'ATTACHE':
        return 'agent';
      
      case 'CITIZEN':
      case 'GABONAIS':
        return 'citizen';
      
      case 'FOREIGNER':
      case 'ETRANGER':
        return 'foreigner';
      
      case 'AMBASSADEUR':
      case 'MINISTRE_CONSEILLER':
      case 'CONSEILLER':
        return 'diplomat';
      
      default:
        return 'citizen';
    }
  };

  const mappedRole = mapUserRole(currentUser?.role);

  return <IAstedInterface userRole={mappedRole} />;
}
