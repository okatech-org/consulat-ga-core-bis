import { ClerkProvider } from '@clerk/clerk-react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env.local file')
}

import { frFR, enUS } from '@clerk/localizations'
import { useTranslation } from 'react-i18next'

const localesMap = {
  fr: frFR,
  en: enUS,
}

export default function AppClerkProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { i18n } = useTranslation()
  const localization = localesMap[i18n.language as keyof typeof localesMap]

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      localization={localization}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      appearance={{
        layout: {
          socialButtonsVariant: 'iconButton',
        },
        variables: {
          colorPrimary: '#015FC6',
        },
      }}
    >
      {children}
    </ClerkProvider>
  )
}
