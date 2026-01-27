import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useMatches,
} from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import Header from '../components/Header'
import { AIAssistant } from '../components/ai'
import { FormFillProvider } from '../components/ai/FormFillContext'

import ClerkProvider from '../integrations/clerk/provider'

import ConvexProvider from '../integrations/convex/provider'

import I18nProvider from '../integrations/i18n/provider'

import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()(({
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
}))


const routesWithOwnLayout = ['/admin', '/sign-in', '/sign-up', '/dashboard']

function RootLayout() {
  const matches = useMatches()
  
  const hasOwnLayout = matches.some(match => 
    routesWithOwnLayout.some(route => match.fullPath.startsWith(route))
  )

  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (hasOwnLayout) return

    const handleWheel = (e: WheelEvent) => {
      if (!mainRef.current) return
      
      let target = e.target as HTMLElement | null
      
      while (target) {
        if (target === mainRef.current) {
          return 
        }

        const style = window.getComputedStyle(target)
        const overflowY = style.overflowY
        const isScrollable = (overflowY === 'auto' || overflowY === 'scroll') && target.scrollHeight > target.clientHeight
        
        if (isScrollable) {
          return
        }
        
        target = target.parentElement
      }

      mainRef.current.scrollTop += e.deltaY
    }

    window.addEventListener('wheel', handleWheel)
    return () => window.removeEventListener('wheel', handleWheel)
  }, [hasOwnLayout])

  return (
    <>
      {!hasOwnLayout && <Header />}
      <main 
        ref={mainRef}
        className="overflow-y-auto"
        style={{ 
          marginTop: hasOwnLayout ? '0' : 'clamp(64px, calc(64px + 36px), 100px)',
          height: hasOwnLayout ? '100vh' : 'calc(100vh - clamp(64px, calc(64px + 36px), 100px))'
        }}
      >
        <Outlet />
      </main>
      {!hasOwnLayout && <AIAssistant />}
    </>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full overflow-hidden">
      <head>
        <HeadContent />
      </head>
      <body className="h-full overflow-hidden">
        <I18nProvider>
          <ClerkProvider>
            <ConvexProvider>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <FormFillProvider>
                  {children}
                  <Toaster richColors />
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
                </FormFillProvider>
              </ThemeProvider>
            </ConvexProvider>
          </ClerkProvider>
        </I18nProvider>

        <Scripts />
      </body>
    </html>
  )
}
