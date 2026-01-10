import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useMatches,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import Header from '../components/Header'

import ClerkProvider from '../integrations/clerk/provider'

import ConvexProvider from '../integrations/convex/provider'

import I18nProvider from '../integrations/i18n/provider'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Consulat.ga - Services Consulaires Digitalisés | République Gabonaise',
      },
      {
        name: 'description',
        content: 'Plateforme officielle des services consulaires de la République Gabonaise. Demandes de passeport, visa, état civil, inscription consulaire et légalisation de documents en ligne.',
      },
      {
        property: 'og:title',
        content: 'Consulat.ga - Services Consulaires Digitalisés',
      },
      {
        property: 'og:description',
        content: 'Plateforme officielle des services consulaires de la République Gabonaise pour les citoyens à l\'étranger.',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        name: 'theme-color',
        content: '#3b82f6',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
  component: RootLayout,
})


const routesWithOwnLayout = ['/superadmin', '/sign-in', '/sign-up', '/dashboard', '/my-space']

function RootLayout() {
  const matches = useMatches()
  

  const hasOwnLayout = matches.some(match => 
    routesWithOwnLayout.some(route => match.fullPath.startsWith(route))
  )

  return (
    <>
      {!hasOwnLayout && <Header />}
      <Outlet />
    </>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        <I18nProvider>
          <ClerkProvider>
            <ConvexProvider>
              {children}
              <TanStackDevtools
                config={{
                  position: 'bottom-right',
                }}
                plugins={[
                  {
                    name: 'Tanstack Router',
                    render: <TanStackRouterDevtoolsPanel />,
                  },
                  TanStackQueryDevtools,
                ]}
              />
            </ConvexProvider>
          </ClerkProvider>
        </I18nProvider>

        <Scripts />
      </body>
    </html>
  )
}
