'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShirtCard } from './ShirtCard'
import type { Shirt } from '@/lib/types'

export function GalleryGrid({ shirts }: { shirts: Shirt[] }) {
  if (shirts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-6xl mb-4">👕</div>
        <h2 className="text-xl font-bold text-[#F2EDE8] mb-2">Galeria vazia</h2>
        <p className="text-[#7A7570] text-sm mb-6">Adicione sua primeira camiseta para começar</p>
        <Link
          href="/shirt/new"
          className="bg-[#3DFF6E] text-[#0A0908] font-medium text-sm px-5 py-2.5 rounded-lg hover:bg-[#2EDD58] transition-colors"
        >
          Adicionar camiseta
        </Link>
      </div>
    )
  }

  return (
    <div className="pb-20 sm:pb-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[#F2EDE8]">
          Minha coleção{' '}
          <span className="text-[#7A7570] font-normal text-base">({shirts.length})</span>
        </h1>
        <Link
          href="/shirt/new"
          className="hidden sm:inline text-sm text-[#3DFF6E] hover:underline"
        >
          + Adicionar
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4"
      >
        {shirts.map((shirt, i) => (
          <motion.div
            key={shirt.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <ShirtCard shirt={shirt} />
          </motion.div>
        ))}
      </motion.div>

      {/* Mobile FAB */}
      <Link
        href="/shirt/new"
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#3DFF6E] text-[#0A0908] rounded-full flex items-center justify-center shadow-lg shadow-[#3DFF6E]/20 hover:bg-[#2EDD58] transition-colors text-2xl font-bold z-50"
        aria-label="Adicionar camiseta"
      >
        +
      </Link>
    </div>
  )
}
