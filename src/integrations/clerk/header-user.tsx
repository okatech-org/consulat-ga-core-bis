import { Button } from '@/components/ui/button'
import {
  SignedIn,
  SignInButton,
  SignedOut,
  UserButton,
} from '@clerk/clerk-react'

export default function HeaderUser() {
  return (
    <>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton>
          <Button variant="link">Se connecter</Button>
        </SignInButton>
      </SignedOut>
    </>
  )
}
