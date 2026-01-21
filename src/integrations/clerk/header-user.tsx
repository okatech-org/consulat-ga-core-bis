import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  SignedIn,
  SignInButton,
  SignedOut,
  UserButton,
} from '@clerk/clerk-react'
import { User } from 'lucide-react'
import { useUserData } from '@/hooks/use-user-data'

export default function HeaderUser() {
  const { t } = useTranslation()
  const { isAgent, isSuperAdmin } = useUserData()

  function getMySpacePath() {
    if (isSuperAdmin) return '/admin'
    if (isAgent) return '/dashboard'
    return '/my-space'
  }
  
  return (
    <div className="flex items-center gap-2">
      <SignedIn>
        <Button asChild variant="ghost" size="sm">
          <Link to={getMySpacePath()}>
            <User className="w-4 h-4 mr-2" />
            {t('header.nav.mySpace')}
          </Link>
        </Button>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="ghost" size="sm">
            {t('header.nav.signIn')}
          </Button>
        </SignInButton>
      </SignedOut>
    </div>
  )
}
