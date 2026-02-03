/**
 * Auth Context for Consulat.ga-core
 * Unified authentication with user type detection and entity binding
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

// ============================================================================
// TYPES
// ============================================================================

export type UserType = 'citizen' | 'staff' | 'admin';

export type EntityType =
    | 'ambassade'
    | 'consulat_general'
    | 'consulat'
    | 'consulat_honoraire'
    | 'delegation_permanente';

export type StaffRole =
    | 'AMBASSADEUR'
    | 'PREMIER_CONSEILLER'
    | 'CONSEILLER'
    | 'CONSUL_GENERAL'
    | 'CONSUL'
    | 'VICE_CONSUL'
    | 'CHANCELIER'
    | 'AGENT'
    | 'SECRETAIRE'
    | 'REPRESENTANT_PERMANENT'
    | 'DELEGUE';

export interface AuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    type: UserType;
    // For staff users
    entityId?: string;
    entityType?: EntityType;
    entityName?: string;
    role?: StaffRole;
    countryCode?: string;
}

export interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    getRedirectPath: () => string;
    hasAccessToEntity: (entityId: string) => boolean;
    isStaffOf: (entityType: EntityType) => boolean;
}

// ============================================================================
// CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextType | null>(null);

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get URL path prefix for entity type
 */
function getEntityTypePath(type: EntityType): string {
    const paths: Record<EntityType, string> = {
        'ambassade': 'ambassade',
        'consulat_general': 'consulat',
        'consulat': 'consulat',
        'consulat_honoraire': 'consulat',
        'delegation_permanente': 'representation',
    };
    return paths[type];
}

/**
 * Determine redirect path after login based on user type
 */
function computeRedirectPath(user: AuthUser): string {
    switch (user.type) {
        case 'citizen':
            return '/me';
        case 'staff':
            if (user.entityId && user.entityType) {
                const entityPath = getEntityTypePath(user.entityType);
                return `/${entityPath}/${user.entityId}`;
            }
            return '/me'; // Fallback
        case 'admin':
            return '/admin';
        default:
            return '/';
    }
}

// ============================================================================
// PROVIDER
// ============================================================================

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [state, setState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
    });

    // Check for existing session on mount
    useEffect(() => {
        const checkSession = async () => {
            try {
                // Check localStorage for demo/dev mode
                const savedUser = localStorage.getItem('consulat_auth_user');
                if (savedUser) {
                    const user = JSON.parse(savedUser) as AuthUser;
                    setState({
                        user,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                } else {
                    setState(prev => ({ ...prev, isLoading: false }));
                }
            } catch (error) {
                console.error('Session check failed:', error);
                setState(prev => ({ ...prev, isLoading: false }));
            }
        };

        checkSession();
    }, []);

    /**
     * Login with email and password
     */
    const login = async (email: string, password: string): Promise<void> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // TODO: Replace with actual Supabase auth
            // For now, simulate login with demo detection

            // Demo: Detect user type from email pattern
            let user: AuthUser;

            if (email.includes('@admin') || email.includes('superadmin')) {
                user = {
                    id: 'admin-001',
                    email,
                    firstName: 'Super',
                    lastName: 'Admin',
                    type: 'admin',
                };
            } else if (email.includes('@consulat') || email.includes('@ambassade')) {
                // Staff user - extract entity from email or use default
                const isAmbassy = email.includes('ambassade');
                user = {
                    id: 'staff-001',
                    email,
                    firstName: 'Agent',
                    lastName: 'Diplomatique',
                    type: 'staff',
                    entityId: isAmbassy ? 'fr-ambassade-paris' : 'fr-consulat-paris',
                    entityType: isAmbassy ? 'ambassade' : 'consulat_general',
                    entityName: isAmbassy ? 'Ambassade du Gabon à Paris' : 'Consulat Général du Gabon à Paris',
                    role: isAmbassy ? 'CONSEILLER' : 'AGENT',
                    countryCode: 'FR',
                };
            } else {
                // Default: Citizen
                user = {
                    id: 'citizen-001',
                    email,
                    firstName: 'Jean',
                    lastName: 'Moussavou',
                    type: 'citizen',
                };
            }

            // Save to localStorage for persistence
            localStorage.setItem('consulat_auth_user', JSON.stringify(user));

            setState({
                user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Login failed',
            }));
            throw error;
        }
    };

    /**
     * Logout current user
     */
    const logout = () => {
        localStorage.removeItem('consulat_auth_user');
        setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
        });
    };

    /**
     * Get redirect path for current user
     */
    const getRedirectPath = (): string => {
        if (!state.user) return '/login';
        return computeRedirectPath(state.user);
    };

    /**
     * Check if user has access to specific entity
     */
    const hasAccessToEntity = (entityId: string): boolean => {
        if (!state.user) return false;
        if (state.user.type === 'admin') return true; // Admin has access to all
        if (state.user.type === 'staff') {
            return state.user.entityId === entityId;
        }
        return false;
    };

    /**
     * Check if user is staff of specific entity type
     */
    const isStaffOf = (entityType: EntityType): boolean => {
        if (!state.user || state.user.type !== 'staff') return false;
        return state.user.entityType === entityType;
    };

    const value: AuthContextType = {
        ...state,
        login,
        logout,
        getRedirectPath,
        hasAccessToEntity,
        isStaffOf,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// ============================================================================
// HOOK
// ============================================================================

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// ============================================================================
// DEMO HELPERS
// ============================================================================

/**
 * Login as demo citizen (for testing)
 */
export function createDemoCitizen(): AuthUser {
    return {
        id: 'demo-citizen',
        email: 'demo@citoyen.ga',
        firstName: 'Marie',
        lastName: 'Ondo',
        type: 'citizen',
    };
}

/**
 * Login as demo staff (for testing)
 */
export function createDemoStaff(entityId: string, entityType: EntityType, role: StaffRole): AuthUser {
    return {
        id: 'demo-staff',
        email: 'demo@consulat.ga',
        firstName: 'Agent',
        lastName: 'Demo',
        type: 'staff',
        entityId,
        entityType,
        role,
        entityName: `Demo ${entityType}`,
    };
}

/**
 * Login as demo admin (for testing)
 */
export function createDemoAdmin(): AuthUser {
    return {
        id: 'demo-admin',
        email: 'admin@consulat.ga',
        firstName: 'Super',
        lastName: 'Admin',
        type: 'admin',
    };
}
