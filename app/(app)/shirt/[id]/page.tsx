import { redirect, notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ShirtActions } from '@/components/shirt/ShirtActions'
import type { Shirt } from '@/lib/types'

const VERSAO_LABEL: Record<string, string> = {
  home: 'Titular',
  away: 'Visitante',
  third: 'Terceiro',
  goalkeeper: 'Goleiro',
  special: 'Especial',
}

const CONDICAO_LABEL: Record<string, string> = {
  mint: 'Mint',
  excellent: 'Excellent',
  good: 'Good',
  worn: 'Worn',
}

export default async function ShirtPage({ params }: { params: { id: string } }) {
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
  const displayImage = s.processed_url || s.original_url

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/gallery" className="text-[#7A7570] hover:text-[#F2EDE8] text-sm transition-colors">
          ← Galeria
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href={`/shirt/${s.id}/edit`}
            className="text-sm text-[#7A7570] hover:text-[#F2EDE8] transition-colors"
          >
            Editar
          </Link>
          <ShirtActions shirtId={s.id} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div
          className="aspect-[3/4] relative rounded-xl overflow-hidden border border-[#2A2520]"
          style={
            s.processed_url
              ? {
                  backgroundImage:
                    'linear-gradient(45deg, #1a1a1a 25%, transparent 25%), linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a1a 75%), linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                }
              : { backgroundColor: '#141210' }
          }
        >
          {displayImage ? (
            <Image
              src={displayImage}
              alt={`${s.clube} ${s.temporada}`}
              fill
              className="object-contain p-6"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-[#2A2520]">
              <svg width="40" height="40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 6.5h-3.5V5c0-1.1-.9-2-2-2h-7c-1.1 0-2 .9-2 2v1.5H3c-.55 0-1 .45-1 1V19c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V7.5c0-.55-.45-1-1-1zM9 5h6v1.5H9V5zm12 13H3V8.5h18V18z" />
              </svg>
              <span className="text-xs">Sem foto</span>
            </div>
          )}
          {s.processing_status === 'pending' && (
            <div className="absolute bottom-0 left-0 right-0 bg-[#0A0908]/80 py-2 text-center">
              <span className="text-[#3DFF6E] text-xs animate-pulse">Processando imagem...</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[#F2EDE8]">{s.clube}</h1>
            <p className="text-[#7A7570] mt-1">{s.temporada} · {VERSAO_LABEL[s.versao]}</p>
          </div>

          <div className="space-y-0">
            {s.fabricante && <Row label="Fabricante" value={s.fabricante} />}
            {s.condicao && <Row label="Condição" value={CONDICAO_LABEL[s.condicao] || s.condicao} />}
            <Row label="Versão" value={VERSAO_LABEL[s.versao] || s.versao} />
          </div>

          {s.historia && (
            <div>
              <p className="text-xs font-medium text-[#7A7570] uppercase tracking-wider mb-2">História</p>
              <p className="text-[#F2EDE8] text-sm leading-relaxed">{s.historia}</p>
            </div>
          )}

          {/* Kit Lens CTA when no image */}
          {!s.original_url && s.processing_status === 'none' && (
            <div className="border border-dashed border-[#2A2520] rounded-xl p-4 text-center">
              <p className="text-[#7A7570] text-sm mb-3">Sem foto ainda</p>
              <ShirtKitLensTrigger shirtId={s.id} userId={user.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-[#2A2520]">
      <span className="text-xs text-[#7A7570] uppercase tracking-wider">{label}</span>
      <span className="text-sm text-[#F2EDE8]">{value}</span>
    </div>
  )
}

// Inline import for kit lens trigger
function ShirtKitLensTrigger({ shirtId }: { shirtId: string; userId: string }) {
  // This is a server component so we just render a link to new shirt page with the id
  return (
    <Link
      href={`/shirt/${shirtId}/upload`}
      className="inline-flex items-center gap-2 text-sm bg-[#141210] border border-[#2A2520] text-[#F2EDE8] px-4 py-2 rounded-lg hover:border-[#3DFF6E] transition-colors"
    >
      <span className="text-[#3DFF6E] font-bold text-xs">Kit Lens</span>
      Adicionar foto
    </Link>
  )
}
