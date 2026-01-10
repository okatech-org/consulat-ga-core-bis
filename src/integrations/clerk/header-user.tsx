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

export default function HeaderUser() {
  const { t } = useTranslation()
  
  return (
    <div className="flex items-center gap-2">
      <SignedIn>
        <Button asChild variant="ghost" size="sm">
          <Link to="/my-space">
            <User className="w-4 h-4 mr-2" />
            {t('header.mySpace', 'Mon Espace')}
          </Link>
        </Button>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="ghost" size="sm">
            {t('header.signIn', 'Se connecter')}
          </Button>
        </SignInButton>
      </SignedOut>
    </div>
  )
}
