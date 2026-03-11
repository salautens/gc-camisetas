'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'

const STEPS = [
  { title: 'Bem-vindo ao GC', subtitle: 'Sua galeria de camisetas de futebol' },
  { title: 'Seu clube', subtitle: 'Qual é o time do coração?' },
  { title: 'Por que colecionar?', subtitle: 'O que te move nesse hobby?' },
]

export function OnboardingWizard({ userId }: { userId: string }) {
  const [step, setStep] = useState(0)
  const [displayName, setDisplayName] = useState('')
  const [mainClub, setMainClub] = useState('')
  const [whyCollect, setWhyCollect] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  function canAdvance() {
    if (step === 0) return displayName.trim().length > 0
    if (step === 1) return mainClub.trim().length > 0
    return true
  }

  async function handleFinish() {
    setLoading(true)
    setError(null)

    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      display_name: displayName.trim(),
      main_club: mainClub.trim(),
      why_collect: whyCollect.trim() || null,
      onboarding_done: true,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/gallery')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= step ? 'bg-[#3DFF6E]' : 'bg-[#2A2520]'}`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-[#F2EDE8] mb-1">{STEPS[step].title}</h2>
            <p className="text-[#7A7570] text-sm mb-8">{STEPS[step].subtitle}</p>

            {step === 0 && (
              <div>
                <Label htmlFor="name">Como quer ser chamado?</Label>
                <Input
                  id="name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Seu nome ou apelido"
                  autoFocus
                />
              </div>
            )}

            {step === 1 && (
              <div>
                <Label htmlFor="club">Clube principal</Label>
                <Input
                  id="club"
                  value={mainClub}
                  onChange={(e) => setMainClub(e.target.value)}
                  placeholder="Ex: Flamengo, Barcelona, Manchester City..."
                  autoFocus
                />
              </div>
            )}

            {step === 2 && (
              <div>
                <Label htmlFor="why">Por que você coleciona? (opcional)</Label>
                <Textarea
                  id="why"
                  value={whyCollect}
                  onChange={(e) => setWhyCollect(e.target.value)}
                  placeholder="Memórias, paixão pelo futebol, design das camisetas..."
                  rows={4}
                  autoFocus
                />
              </div>
            )}

            {error && (
              <p className="mt-3 text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-8">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              Voltar
            </Button>
          ) : (
            <div />
          )}

          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canAdvance()}>
              Continuar
            </Button>
          ) : (
            <Button onClick={handleFinish} loading={loading}>
              Entrar na galeria
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
