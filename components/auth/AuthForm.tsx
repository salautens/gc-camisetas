'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { useRouter } from 'next/navigation'

export function AuthForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/callback` },
      })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Verifique seu email para confirmar o cadastro.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push('/')
        router.refresh()
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-end pb-16 px-10">
      {/* Background GC text */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none select-none">
        <span
          className="font-display font-light text-transparent leading-[0.85] tracking-[-0.02em]"
          style={{
            fontSize: 'clamp(14rem, 30vw, 28rem)',
            WebkitTextStroke: '1px rgba(255,255,255,0.04)',
          }}
        >
          GC
        </span>
      </div>

      <div className="relative z-10 w-full max-w-xs">
        <p className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-white/40 mb-2">
          {mode === 'login' ? 'Entrar' : 'Criar conta'}
        </p>
        <h1 className="font-display font-light text-[clamp(3rem,8vw,6rem)] leading-[0.9] tracking-[-0.02em] text-white mb-10">
          GC
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email" className="text-white/40">Email</Label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoComplete="email"
              className="w-full bg-transparent border-b border-white/20 text-white placeholder-white/20 font-mono text-[0.7rem] tracking-[0.05em] py-2 px-0 focus:outline-none focus:border-white/60 transition-colors"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-white/40">Senha</Label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              minLength={6}
              className="w-full bg-transparent border-b border-white/20 text-white placeholder-white/20 font-mono text-[0.7rem] tracking-[0.05em] py-2 px-0 focus:outline-none focus:border-white/60 transition-colors"
            />
          </div>

          {error && (
            <p className="font-mono text-[0.65rem] text-red-400 border border-red-400/20 px-3 py-2">{error}</p>
          )}

          {message && (
            <p className="font-mono text-[0.65rem] text-white/60 border border-white/10 px-3 py-2">{message}</p>
          )}

          <Button
            type="submit"
            loading={loading}
            className="border-white/30 text-white hover:bg-white hover:text-[#1a1a1a]"
          >
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
          </Button>
        </form>

        <p className="mt-8 font-mono text-[0.6rem] tracking-[0.1em] text-white/30">
          {mode === 'login' ? 'Novo por aqui?' : 'Já tem conta?'}{' '}
          <button
            type="button"
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setMessage(null) }}
            className="text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            {mode === 'login' ? 'Criar conta' : 'Entrar'}
          </button>
        </p>
      </div>
    </div>
  )
}
