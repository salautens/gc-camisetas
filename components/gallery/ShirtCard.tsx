'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Shirt } from '@/lib/types'

const VERSAO_LABEL: Record<string, string> = {
  home: 'Titular',
  away: 'Visitante',
  third: 'Terceiro',
  goalkeeper: 'Goleiro',
  special: 'Especial',
}

const CONDICAO_COLOR: Record<string, string> = {
  mint: 'text-[#3DFF6E]',
  excellent: 'text-blue-400',
  good: 'text-yellow-400',
  worn: 'text-[#7A7570]',
}

export function ShirtCard({ shirt }: { shirt: Shirt }) {
  const imageUrl = shirt.processed_url || shirt.original_url
  const hasImage = Boolean(imageUrl)

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={`/shirt/${shirt.id}`}
        className="block rounded-xl border border-[#2A2520] bg-[#141210] overflow-hidden hover:border-[#3DFF6E]/40 transition-colors"
      >
        {/* Image area */}
        <div className="aspect-[3/4] relative bg-[#0A0908] flex items-center justify-center">
          {hasImage ? (
            <Image
              src={imageUrl!}
              alt={`${shirt.clube} ${shirt.temporada}`}
              fill
              className="object-contain p-4"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-[#2A2520]">
              <svg width="40" height="40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 6h-2.18c.07-.44.18-.88.18-1.33C18 2.09 15.91 0 13.33 0c-1.5 0-2.82.73-3.67 1.86L12 4.67l2.34-2.81C14.79 1.32 15.5 1 16.28 1c1.47 0 2.72 1.25 2.72 2.67 0 .44-.11.88-.3 1.28l-1.07 2.05H6.37L5.3 4.95C5.11 4.55 5 4.11 5 3.67 5 2.25 6.25 1 7.72 1c.78 0 1.49.32 1.94.86L12 4.67 9.34 1.86C8.49.73 7.17 0 5.67 0 3.09 0 1 2.09 1 4.67c0 .45.11.89.18 1.33H1C.45 6 0 6.45 0 7v14c0 .55.45 1 1 1h22c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1z" />
              </svg>
              <span className="text-xs">Sem foto</span>
            </div>
          )}

          {shirt.processing_status === 'pending' && (
            <div className="absolute inset-0 bg-[#0A0908]/70 flex items-center justify-center">
              <div className="flex items-center gap-2 text-[#3DFF6E] text-xs">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processando
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-[#F2EDE8] font-medium text-sm truncate">{shirt.clube}</p>
          <p className="text-[#7A7570] text-xs mt-0.5">{shirt.temporada} · {VERSAO_LABEL[shirt.versao] || shirt.versao}</p>
          {shirt.condicao && (
            <p className={`text-xs mt-1 font-medium ${CONDICAO_COLOR[shirt.condicao] || ''}`}>
              {shirt.condicao.charAt(0).toUpperCase() + shirt.condicao.slice(1)}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
