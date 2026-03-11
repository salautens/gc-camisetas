'use client'

import Image from 'next/image'
import type { Shirt } from '@/lib/types'

const VERSAO_LABEL: Record<string, string> = {
  home: 'Titular',
  away: 'Visitante',
  third: 'Terceiro',
  goalkeeper: 'Goleiro',
  special: 'Especial',
}

interface ShirtCardProps {
  shirt: Shirt
  onClick: () => void
}

export function ShirtCard({ shirt, onClick }: ShirtCardProps) {
  const imageUrl = shirt.processed_url || shirt.original_url

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer"
    >
      {/* Image */}
      <div className="aspect-square relative bg-[#f1f1f1] overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${shirt.clube} ${shirt.temporada}`}
            fill
            className="object-contain p-6 transition-transform duration-300 ease-in-out group-hover:scale-105 will-change-transform"
            sizes="(max-width: 640px) 50vw, 20vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="font-display text-[3rem] font-light text-black/10 tracking-[-0.04em]">GC</span>
          </div>
        )}

        {shirt.processing_status === 'pending' && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <div className="w-8 h-px bg-[#1a1a1a]" style={{ animation: 'loaderPulse 1.5s ease-in-out infinite alternate' }} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-3">
        <p className="font-mono text-[0.7rem] tracking-[0.05em] text-[#1a1a1a]">{shirt.clube}</p>
        <p className="font-mono text-[0.6rem] tracking-[0.05em] text-[#888] mt-0.5">
          {shirt.temporada} — {VERSAO_LABEL[shirt.versao] || shirt.versao}
        </p>
      </div>
    </div>
  )
}
