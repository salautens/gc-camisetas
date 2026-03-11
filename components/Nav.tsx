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
    <header className="border-b border-[#2A2520] bg-[#0A0908]/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/gallery"
          className="text-[#F2EDE8] font-bold tracking-tight hover:text-[#3DFF6E] transition-colors text-lg"
        >
          GC
        </Link>

        <nav className="flex items-center gap-1 sm:gap-4">
          <Link
            href="/gallery"
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              pathname === '/gallery'
                ? 'text-[#3DFF6E] bg-[#3DFF6E]/10'
                : 'text-[#7A7570] hover:text-[#F2EDE8] hover:bg-[#141210]'
            }`}
          >
            Galeria
          </Link>
          <Link
            href="/shirt/new"
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              pathname === '/shirt/new'
                ? 'text-[#3DFF6E] bg-[#3DFF6E]/10'
                : 'text-[#7A7570] hover:text-[#F2EDE8] hover:bg-[#141210]'
            }`}
          >
            <span className="hidden sm:inline">Adicionar</span>
            <span className="sm:hidden">+</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="px-3 py-1.5 rounded-lg text-sm text-[#7A7570] hover:text-[#F2EDE8] hover:bg-[#141210] transition-colors"
          >
            Sair
          </button>
        </nav>
      </div>
    </header>
  )
}
