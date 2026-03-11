import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ShirtForm } from '@/components/shirt/ShirtForm'

export default async function NewShirtPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return <ShirtForm userId={user.id} />
}
