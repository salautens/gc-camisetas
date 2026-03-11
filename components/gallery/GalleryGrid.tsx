'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ShirtCard } from './ShirtCard'
import { ShirtDetailPanel } from './ShirtDetailPanel'
import type { Shirt } from '@/lib/types'

export function GalleryGrid({ shirts: initialShirts }: { shirts: Shirt[] }) {
  const [shirts, setShirts] = useState(initialShirts)
  const [selected, setSelected] = useState<Shirt | null>(null)

  const handleClose = useCallback(() => setSelected(null), [])

  const handleDeleted = useCallback(() => {
    if (selected) {
      setShirts(prev => prev.filter(s => s.id !== selected.id))
      setSelected(null)
    }
  }, [selected])

  if (shirts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8">
        <div className="font-display font-light text-[clamp(5rem,15vw,12rem)] leading-[0.85] tracking-[-0.03em] text-black/10 select-none">
          GC
        </div>
        <div className="text-center">
          <p className="font-mono text-[0.65rem] tracking-[0.3em] uppercase text-[#888] mb-6">
            Coleção vazia
          </p>
          <Link
            href="/shirt/new"
            className="font-mono text-[0.7rem] tracking-[0.1em] border border-[#1a1a1a] rounded-[2rem] px-5 py-2 text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-all duration-150"
          >
            Adicionar primeira camiseta
          </Link>
        </div>
      </div>
    )
  }

  // Build staggered columns (2 on mobile, 4+ on desktop)
  const columns: Shirt[][] = [[], [], [], []]
  shirts.forEach((shirt, i) => columns[i % 4].push(shirt))

  return (
    <>
      {/* Overlay when panel is open */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[5] sm:hidden"
            onClick={handleClose}
          />
        )}
      </AnimatePresence>

      {/* Grid container — shifts left when panel is open */}
      <motion.div
        animate={{ x: selected ? '-25vw' : 0 }}
        transition={{ duration: 0.6, ease: [0.85, 0, 0.15, 1] }}
        className="hidden sm:flex gap-[5vw] min-h-screen px-10 pt-32 pb-20"
        style={{ pointerEvents: selected ? 'none' : 'auto' }}
      >
        {columns.map((col, colIdx) => (
          <div
            key={colIdx}
            className="flex flex-col gap-[5vw] flex-1"
            style={{ marginTop: colIdx % 2 !== 0 ? '10vw' : 0 }}
          >
            {col.map((shirt) => (
              <ShirtCard
                key={shirt.id}
                shirt={shirt}
                onClick={() => setSelected(shirt)}
              />
            ))}
          </div>
        ))}
      </motion.div>

      {/* Mobile grid — simple 2-col */}
      <div className="sm:hidden grid grid-cols-2 gap-4 px-5 pt-28 pb-24">
        {shirts.map((shirt) => (
          <ShirtCard
            key={shirt.id}
            shirt={shirt}
            onClick={() => setSelected(shirt)}
          />
        ))}
      </div>

      {/* Mobile FAB */}
      <Link
        href="/shirt/new"
        className="sm:hidden fixed bottom-6 right-6 w-12 h-12 border border-[#1a1a1a] rounded-full flex items-center justify-center text-xl font-light text-[#1a1a1a] bg-white shadow-sm z-50"
        aria-label="Adicionar"
      >
        +
      </Link>

      {/* Detail panel */}
      <ShirtDetailPanel
        shirt={selected}
        onClose={handleClose}
        onDeleted={handleDeleted}
      />
    </>
  )
}
