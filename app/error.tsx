'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-10 text-center">
      <p className="font-mono text-[0.55rem] tracking-[0.35em] uppercase text-[#888] mb-4">Erro</p>
      <h1 className="font-display font-light text-[clamp(3rem,8vw,7rem)] leading-[0.9] tracking-[-0.02em] text-[#1a1a1a] mb-6">
        Algo deu<br/><em>errado</em>
      </h1>
      <p className="font-mono text-[0.65rem] text-[#888] mb-8 max-w-xs">{error.message || 'Erro inesperado. Tente novamente.'}</p>
      <button
        onClick={reset}
        className="font-mono text-[0.7rem] tracking-[0.1em] border border-[#1a1a1a] rounded-[2rem] px-5 py-2 text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-all duration-150 cursor-pointer"
      >
        Tentar novamente
      </button>
    </main>
  )
}
