'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl mb-4">⚠️</p>
      <h1 className="text-xl font-bold text-[#F2EDE8] mb-2">Algo deu errado</h1>
      <p className="text-[#7A7570] text-sm mb-8 max-w-sm">{error.message || 'Erro inesperado. Tente novamente.'}</p>
      <button
        onClick={reset}
        className="bg-[#3DFF6E] text-[#0A0908] font-medium text-sm px-5 py-2.5 rounded-lg hover:bg-[#2EDD58] transition-colors"
      >
        Tentar novamente
      </button>
    </main>
  )
}
