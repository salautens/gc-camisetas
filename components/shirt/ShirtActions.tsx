'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function ShirtActions({ shirtId, onDeleted }: { shirtId: string; onDeleted?: () => void }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    setLoading(true)
    await supabase.from('shirts').delete().eq('id', shirtId)
    if (onDeleted) {
      onDeleted()
    } else {
      router.push('/gallery')
      router.refresh()
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-4">
        <span className="font-mono text-[0.6rem] tracking-[0.1em] text-[#888]">confirmar?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="font-mono text-[0.6rem] tracking-[0.1em] uppercase text-red-500 disabled:opacity-40 cursor-pointer"
        >
          {loading ? '...' : 'Excluir'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="font-mono text-[0.6rem] tracking-[0.1em] uppercase text-[#888] hover:text-[#1a1a1a] transition-colors cursor-pointer"
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="font-mono text-[0.6rem] tracking-[0.1em] uppercase text-[#888] hover:text-red-500 transition-colors cursor-pointer"
    >
      Excluir
    </button>
  )
}
