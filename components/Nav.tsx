'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function Nav() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] flex justify-between items-center px-10 py-6 mix-blend-difference pointer-events-none">
      <Link
        href="/gallery"
        className="font-mono text-[0.85rem] tracking-[0.3em] uppercase text-white pointer-events-auto"
      >
        GC
      </Link>

      <nav className="flex items-center gap-8 pointer-events-auto">
        <Link
          href="/gallery"
          className={`font-mono text-[0.7rem] tracking-[0.2em] uppercase transition-opacity ${
            pathname === '/gallery' ? 'text-white opacity-100' : 'text-white opacity-60 hover:opacity-100'
          }`}
        >
          Galeria
        </Link>
        <Link
          href="/shirt/new"
          className={`font-mono text-[0.7rem] tracking-[0.2em] uppercase transition-opacity ${
            pathname === '/shirt/new' ? 'text-white opacity-100' : 'text-white opacity-60 hover:opacity-100'
          }`}
        >
          Adicionar
        </Link>
        <button
          onClick={handleSignOut}
          className="font-mono text-[0.7rem] tracking-[0.2em] uppercase text-white opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
        >
          Sair
        </button>
      </nav>
    </header>
  )
}
