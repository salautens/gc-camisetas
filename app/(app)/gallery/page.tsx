import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { GalleryGrid } from '@/components/gallery/GalleryGrid'
import type { Shirt } from '@/lib/types'

export default async function GalleryPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_done')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_done) redirect('/onboarding')

  const { data: shirts } = await supabase
    .from('shirts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  return <GalleryGrid shirts={(shirts as Shirt[]) || []} />
}
