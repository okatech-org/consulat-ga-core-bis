import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ConvexQueryClient } from '@convex-dev/react-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-react'
import { useMemo, useEffect } from 'react'

const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL

if (!CONVEX_URL) {
  console.error('missing envar CONVEX_URL')
}

// Create the Convex query client (connects to Convex backend)
const convexQueryClient = new ConvexQueryClient(CONVEX_URL)

// Export for use in hooks
export { convexQueryClient }

export default function AppConvexProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // Create TanStack QueryClient with Convex integration
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Use Convex's hash function for query keys
        queryKeyHashFn: convexQueryClient.hashFn(),
        // Use Convex's query function for fetching
        queryFn: convexQueryClient.queryFn(),
      },
    },
  }), [])

  // Connect Convex to TanStack Query for live updates
  useEffect(() => {
    try {
      convexQueryClient.connect(queryClient)
    } catch (e) {
      // Ignore already subscribed error in strict mode
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
