import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { KitLensUploader } from '@/components/shirt/KitLensUploader'
import type { Shirt } from '@/lib/types'

export default async function ShirtUploadPage({ params }: { params: { id: string } }) {
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

  const s = shirt as Shirt

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <Link href={`/shirt/${s.id}`} className="text-[#7A7570] hover:text-[#F2EDE8] text-sm transition-colors">
          ← {s.clube} {s.temporada}
        </Link>
      </div>

      <h1 className="text-xl font-bold text-[#F2EDE8] mb-8">Adicionar foto</h1>

      <KitLensUploader
        shirtId={s.id}
        userId={user.id}
        redirectTo={`/shirt/${s.id}`}
      />

      <div className="mt-6">
        <Link
          href={`/shirt/${s.id}`}
          className="text-sm text-[#7A7570] hover:text-[#F2EDE8] transition-colors"
        >
          Pular por agora
        </Link>
      </div>
    </div>
  )
}
