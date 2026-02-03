
/**
 * Route Mapping for Super Admin Navigation Intelligence
 * Maps natural language queries to actual application routes
 */

export interface RouteInfo {
    path: string;
    aliases: string[];
    role?: string;
    description: string;
}

export const ROUTE_MAP: RouteInfo[] = [
    {
        path: '/',
        aliases: ['accueil', 'home', 'page d\'accueil', 'dashboard', 'tableau de bord', 'démarrage', 'start'],
        description: 'Page d\'accueil / Dashboard principal'
    },
    {
        path: '/dashboard/agent/requests',
        aliases: ['demandes', 'requêtes', 'agent requests'],
        description: 'Page des demandes agents'
    },
    {
        path: '/dashboard/admin/agents',
        aliases: ['agents', 'gestion agents', 'liste agents'],
        description: 'Page de gestion des agents'
    },
    {
        path: '/dashboard/super-admin/users',
        aliases: ['utilisateurs', 'users', 'gestion utilisateurs'],
        description: 'Gestion des utilisateurs (Super Admin)'
    },
    {
        path: '/dashboard/super-admin/organizations',
        aliases: ['organisations', 'orgs', 'gestion organisations'],
        description: 'Gestion des organisations (Super Admin)'
    },
    {
        path: '/settings',
        aliases: ['paramètres', 'settings', 'configuration'],
        description: 'Paramètres de l\'application'
    },
    {
        path: '/auth',
        aliases: ['connexion', 'login', 'authentification', 'auth', 'se connecter'],
        description: 'Page de connexion'
    }
];

/**
 * Resolve a natural language query to an actual route
 * Uses fuzzy matching on aliases
 */
export function resolveRoute(query: string): string | null {
    const normalizedQuery = query.toLowerCase().trim();

    // Exact path match first
    const exactMatch = ROUTE_MAP.find(route => route.path === normalizedQuery);
    if (exactMatch) return exactMatch.path;

    // Alias matching
    for (const route of ROUTE_MAP) {
        for (const alias of route.aliases) {
            if (normalizedQuery.includes(alias) || alias.includes(normalizedQuery)) {
                return route.path;
            }
        }
    }

    // Fuzzy matching on description
    const fuzzyMatch = ROUTE_MAP.find(route =>
        route.description.toLowerCase().includes(normalizedQuery) ||
        normalizedQuery.includes(route.description.toLowerCase())
    );

    return fuzzyMatch ? fuzzyMatch.path : null;
}

/**
 * Get route information for system prompt
 */
export function getRouteKnowledgePrompt(): string {
    const routeList = ROUTE_MAP.map(route =>
        `- **${route.path}** : ${route.description}\n  Aliases: ${route.aliases.join(', ')}`
    ).join('\n');

    return `# CARTOGRAPHIE DES ROUTES DISPONIBLES\n${routeList}\n\nIMPORTANT: Utilise TOUJOURS ces chemins exacts. Si l'utilisateur demande "page d'accueil" ou "home", utilise "/" et NON "/home".`;
}
