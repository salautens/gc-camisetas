'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function ShirtActions({ shirtId }: { shirtId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    setLoading(true)
    await supabase.from('shirts').delete().eq('id', shirtId)
    router.push('/gallery')
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[#7A7570] text-xs">Confirmar exclusão?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
        >
          {loading ? 'Excluindo...' : 'Excluir'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-[#7A7570] hover:text-[#F2EDE8] transition-colors"
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs text-[#7A7570] hover:text-red-400 transition-colors"
    >
      Excluir
    </button>
  )
}
