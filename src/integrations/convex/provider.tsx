import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ConvexQueryClient } from '@convex-dev/react-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-react'
import { useMemo, useEffect } from 'react'

const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL

if (!CONVEX_URL) {
  console.error('missing envar CONVEX_URL')
}


const convexQueryClient = new ConvexQueryClient(CONVEX_URL)


export { convexQueryClient }

export default function AppConvexProvider({
  children,
}: {
  children: React.ReactNode
}) {

  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {

        queryKeyHashFn: convexQueryClient.hashFn(),

        queryFn: convexQueryClient.queryFn(),
      },
    },
  }), [])


  useEffect(() => {
    try {
      convexQueryClient.connect(queryClient)
    } catch (e) {

      console.warn('Convex query client connection error (likely strict mode double-invoke):', e)
    }
  }, [queryClient])

  return (
    <ConvexProviderWithClerk client={convexQueryClient.convexClient} useAuth={useAuth}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ConvexProviderWithClerk>
  )
}
