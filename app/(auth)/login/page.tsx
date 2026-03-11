import { AuthForm } from '@/components/auth/AuthForm'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <AuthForm />
    </main>
  )
}
