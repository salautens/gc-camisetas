import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ShirtEditForm } from '@/components/shirt/ShirtEditForm'
import type { Shirt } from '@/lib/types'

export default async function ShirtEditPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: shirt } = await supabase
    .from('shirts')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!shirt) notFound()

  return <ShirtEditForm shirt={shirt as Shirt} userId={user.id} />
}
