import { createRouter, Link } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import * as TanstackQuery from './integrations/tanstack-query/root-provider'

import * as Sentry from '@sentry/tanstackstart-react'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Default 404 component
function NotFoundComponent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-foreground mb-2">Page non trouvée</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link
        to="/"
        className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Retour à l'accueil
      </Link>
    </div>
  )
}

// Create a new router instance
export const getRouter = () => {
  const rqContext = TanstackQuery.getContext()

  const router = createRouter({
    routeTree,
    context: {
      ...rqContext,
    },
    defaultNotFoundComponent: NotFoundComponent,
    defaultPreload: 'intent',
  })

  setupRouterSsrQueryIntegration({ router, queryClient: rqContext.queryClient })

  if (!router.isServer) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [],
      tracesSampleRate: 1.0,
      sendDefaultPii: true,
    })
  }

  return router
}
