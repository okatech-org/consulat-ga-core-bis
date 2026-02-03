/**
 * Route Guards for Consulat.ga-core
 * Protected route wrappers for different user spaces
 */

import React, { ReactNode } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth, EntityType } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

// ============================================================================
// LOADING COMPONENT
// ============================================================================

function AuthLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Vérification de l'authentification...</p>
            </div>
        </div>
    );
}

// ============================================================================
// UNAUTHORIZED COMPONENT
// ============================================================================

function Unauthorized({ message }: { message?: string }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center max-w-md p-8">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🚫</span>
                </div>
                <h1 className="text-2xl font-bold mb-2">Accès non autorisé</h1>
                <p className="text-muted-foreground mb-6">
                    {message || "Vous n'avez pas les permissions nécessaires pour accéder à cette page."}
                </p>
                <a href="/" className="text-primary hover:underline">
                    Retourner à l'accueil
                </a>
            </div>
        </div>
    );
}

// ============================================================================
// GUARD PROPS
// ============================================================================

interface GuardProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface EntityGuardProps extends GuardProps {
    entityId?: string;
    allowedEntityTypes?: EntityType[];
}

// ============================================================================
// CITIZEN GUARD
// ============================================================================

/**
 * Protects citizen routes (/me/*)
 * Redirects to login if not authenticated
 * Redirects to appropriate dashboard if not a citizen
 */
export function CitizenGuard({ children, fallback }: GuardProps) {
    const { isAuthenticated, isLoading, user, getRedirectPath } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return fallback || <AuthLoading />;
    }

    if (!isAuthenticated) {
        // Save the intended destination for post-login redirect
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    // If user is not a citizen, redirect to their appropriate space
    if (user?.type !== 'citizen') {
        return <Navigate to={getRedirectPath()} replace />;
    }

    return <>{children}</>;
}

// ============================================================================
// DIPLOMATIC GUARD
// ============================================================================

/**
 * Protects diplomatic routes (/ambassade/:id/*, /consulat/:id/*, /representation/:id/*)
 * Ensures user is staff of the specific entity
 */
export function DiplomaticGuard({ children, entityId, allowedEntityTypes, fallback }: EntityGuardProps) {
    const { isAuthenticated, isLoading, user, hasAccessToEntity, getRedirectPath } = useAuth();
    const location = useLocation();
    const params = useParams<{ entityId: string }>();

    const targetEntityId = entityId || params.entityId;

    if (isLoading) {
        return fallback || <AuthLoading />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    // Must be staff type
    if (user?.type !== 'staff' && user?.type !== 'admin') {
        return <Unauthorized message="Cet espace est réservé au personnel diplomatique." />;
    }

    // Admin has access to all entities
    if (user?.type === 'admin') {
        return <>{children}</>;
    }

    // Check entity access
    if (targetEntityId && !hasAccessToEntity(targetEntityId)) {
        return <Unauthorized message="Vous n'avez pas accès à cette représentation diplomatique." />;
    }

    // Check entity type if specified
    if (allowedEntityTypes && user?.entityType && !allowedEntityTypes.includes(user.entityType)) {
        return <Unauthorized message="Votre rôle ne permet pas d'accéder à cette section." />;
    }

    return <>{children}</>;
}

// ============================================================================
// ADMIN GUARD
// ============================================================================

/**
 * Protects admin routes (/admin/*)
 * Only super admins can access
 */
export function AdminGuard({ children, fallback }: GuardProps) {
    const { isAuthenticated, isLoading, user, getRedirectPath } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return fallback || <AuthLoading />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    if (user?.type !== 'admin') {
        return <Unauthorized message="Cet espace est réservé aux administrateurs." />;
    }

    return <>{children}</>;
}

// ============================================================================
// PUBLIC ONLY GUARD
// ============================================================================

/**
 * For login/register pages - redirects authenticated users to their dashboard
 */
export function PublicOnlyGuard({ children, fallback }: GuardProps) {
    const { isAuthenticated, isLoading, getRedirectPath } = useAuth();

    if (isLoading) {
        return fallback || <AuthLoading />;
    }

    if (isAuthenticated) {
        return <Navigate to={getRedirectPath()} replace />;
    }

    return <>{children}</>;
}

// ============================================================================
// ROLE-BASED GUARD
// ============================================================================

interface RoleGuardProps extends GuardProps {
    allowedRoles: string[];
}

/**
 * Checks for specific roles within diplomatic staff
 */
export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
        return fallback || <AuthLoading />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Admin bypasses role check
    if (user?.type === 'admin') {
        return <>{children}</>;
    }

    // Check role for staff
    if (user?.type === 'staff' && user.role && allowedRoles.includes(user.role)) {
        return <>{children}</>;
    }

    return <Unauthorized message="Votre rôle ne permet pas d'accéder à cette fonctionnalité." />;
}

// ============================================================================
// COMPOSED GUARDS
// ============================================================================

/**
 * Guard for embassy-specific routes
 */
export function AmbassyGuard({ children, fallback }: GuardProps) {
    return (
        <DiplomaticGuard
            allowedEntityTypes={['ambassade']}
            fallback={fallback}
        >
            {children}
        </DiplomaticGuard>
    );
}

/**
 * Guard for consulate-specific routes
 */
export function ConsulateGuard({ children, fallback }: GuardProps) {
    return (
        <DiplomaticGuard
            allowedEntityTypes={['consulat_general', 'consulat', 'consulat_honoraire']}
            fallback={fallback}
        >
            {children}
        </DiplomaticGuard>
    );
}

/**
 * Guard for representation-specific routes
 */
export function RepresentationGuard({ children, fallback }: GuardProps) {
    return (
        <DiplomaticGuard
            allowedEntityTypes={['delegation_permanente']}
            fallback={fallback}
        >
            {children}
        </DiplomaticGuard>
    );
}
