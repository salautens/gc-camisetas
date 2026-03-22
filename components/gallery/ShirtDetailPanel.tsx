'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
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
  nova: 'Nova',
  boa: 'Boa condição',
  usada: 'Usada',
  desfeitos: 'Desfeitos',
}

interface ShirtDetailPanelProps {
  shirt: Shirt | null
  onClose: () => void
  onDeleted: () => void
}

export function ShirtDetailPanel({ shirt, onClose, onDeleted }: ShirtDetailPanelProps) {
  const imageUrl = shirt ? (shirt.processed_url || shirt.original_url) : null

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <AnimatePresence>
      {shirt && (
        <motion.aside
          key={shirt.id}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.6, ease: [0.85, 0, 0.15, 1] }}
          className="fixed top-0 right-0 w-full sm:w-[50vw] h-full bg-[#f9f9f9] z-[101] sm:z-[6] overflow-y-auto"
          style={{ padding: 'clamp(5rem, 8vw, 4rem) clamp(1.25rem, 4vw, 5rem) 2rem' }}
        >
          {/* Close + actions */}
          <div className="flex items-center justify-between mb-8 sm:mb-12">
            <button
              onClick={onClose}
              className="font-mono text-[1rem] tracking-[0.25em] uppercase text-[#888] hover:text-[#1a1a1a] transition-colors cursor-crosshair"
            >
              ← Fechar
            </button>
            <div className="flex items-center gap-6">
              <Link
                href={`/shirt/${shirt.id}/edit`}
                className="font-mono text-[1rem] tracking-[0.2em] uppercase text-[#888] hover:text-[#1a1a1a] transition-colors"
              >
                Editar
              </Link>
              <ShirtActions shirtId={shirt.id} onDeleted={onDeleted} />
            </div>
          </div>

          {/* Title */}
          <div className="overflow-hidden mb-2">
            <h2 className="font-display font-light text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.9] tracking-[-0.02em] text-[#1a1a1a]">
              {shirt.clube}
            </h2>
          </div>
          <p className="font-mono text-[1rem] tracking-[0.25em] uppercase text-[#888] mb-10">
            {shirt.temporada} — {VERSAO_LABEL[shirt.versao]}
          </p>

          {/* Image */}
          <div className="aspect-square relative bg-white mb-10">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={shirt.clube}
                fill
                className="object-contain p-8"
                sizes="(max-width: 640px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="font-display text-[5rem] font-light text-black/10 tracking-[-0.04em]">GC</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-0 border-t border-[#e0e0e0]">
            {shirt.liga && (
              <DetailRow label="Liga" value={shirt.liga} />
            )}
            {shirt.fabricante && (
              <DetailRow label="Fornecedor" value={shirt.fabricante} />
            )}
            {shirt.condicao && (
              <DetailRow label="Condição" value={CONDICAO_LABEL[shirt.condicao] || shirt.condicao} />
            )}
            <DetailRow label="Versão" value={VERSAO_LABEL[shirt.versao] || shirt.versao} />
          </div>

          {shirt.historia && (
            <div className="mt-8">
              <p className="font-mono text-[1rem] tracking-[0.3em] uppercase text-[#888] mb-3">História</p>
              <p className="font-mono text-[1rem] leading-[1.9] text-[#1a1a1a]">{shirt.historia}</p>
            </div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline py-3 border-b border-[#e0e0e0]">
      <span className="font-mono text-[1rem] tracking-[0.25em] uppercase text-[#888]">{label}</span>
      <span className="font-mono text-[1rem] tracking-[0.05em] text-[#1a1a1a]">{value}</span>
    </div>
  )
}
