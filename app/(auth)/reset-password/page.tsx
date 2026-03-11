'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('As senhas não coincidem')
      return
    }
    if (password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setDone(true)
      setTimeout(() => router.push('/gallery'), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-end pb-16 px-10">
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none select-none">
        <span
          className="font-display font-light text-transparent leading-[0.85] tracking-[-0.02em]"
          style={{ fontSize: 'clamp(14rem, 30vw, 28rem)', WebkitTextStroke: '1px rgba(255,255,255,0.04)' }}
        >
          GC
        </span>
      </div>

      <div className="relative z-10 w-full max-w-xs">
        <p className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-white/40 mb-2">
          Nova senha
        </p>
        <h1 className="font-display font-light text-[clamp(3rem,8vw,6rem)] leading-[0.9] tracking-[-0.02em] text-white mb-10">
          GC
        </h1>

        {done ? (
          <p className="font-mono text-[0.65rem] text-white/60 border border-white/10 px-3 py-2">
            Senha alterada. Redirecionando...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="password" className="text-white/40">Nova senha</Label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoFocus
                className="w-full bg-transparent border-b border-white/20 text-white placeholder-white/20 font-mono text-[0.7rem] tracking-[0.05em] py-2 px-0 focus:outline-none focus:border-white/60 transition-colors"
              />
            </div>
            <div>
              <Label htmlFor="confirm" className="text-white/40">Confirmar senha</Label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-transparent border-b border-white/20 text-white placeholder-white/20 font-mono text-[0.7rem] tracking-[0.05em] py-2 px-0 focus:outline-none focus:border-white/60 transition-colors"
              />
            </div>

            {error && (
              <p className="font-mono text-[0.65rem] text-red-400 border border-red-400/20 px-3 py-2">{error}</p>
            )}

            <Button
              type="submit"
              loading={loading}
              className="border-white/30 text-white hover:bg-white hover:text-[#1a1a1a]"
            >
              Salvar nova senha
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
