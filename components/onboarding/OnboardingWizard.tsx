'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'

const STEPS = [
  { label: '01', question: 'Como quer ser chamado?' },
  { label: '02', question: 'Qual é o clube do coração?' },
  { label: '03', question: 'Por que você coleciona?' },
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

    if (error) { setError(error.message); setLoading(false); return }
    router.push('/gallery')
  }

  function handleNext() {
    if (step < STEPS.length - 1) setStep(step + 1)
    else handleFinish()
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between px-10 py-16">
      {/* Step indicator */}
      <div className="flex gap-2">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-px flex-1 transition-colors duration-500 ${i <= step ? 'bg-[#1a1a1a]' : 'bg-[#e0e0e0]'}`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="max-w-sm">
        <p className="font-mono text-[0.6rem] tracking-[0.35em] uppercase text-[#888] mb-4">
          {STEPS[step].label} / 03
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
          >
            <h2 className="font-display font-light text-[clamp(2rem,5vw,3.5rem)] leading-[0.95] tracking-[-0.02em] text-[#1a1a1a] mb-8">
              {STEPS[step].question}
            </h2>

            {step === 0 && (
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Seu nome ou apelido"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && canAdvance() && handleNext()}
                />
              </div>
            )}

            {step === 1 && (
              <div>
                <Label htmlFor="club">Clube</Label>
                <Input
                  id="club"
                  value={mainClub}
                  onChange={(e) => setMainClub(e.target.value)}
                  placeholder="Flamengo, Barcelona..."
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && canAdvance() && handleNext()}
                />
              </div>
            )}

            {step === 2 && (
              <div>
                <Label htmlFor="why">Motivo (opcional)</Label>
                <Textarea
                  id="why"
                  value={whyCollect}
                  onChange={(e) => setWhyCollect(e.target.value)}
                  placeholder="Memórias, paixão pelo futebol, design das camisetas..."
                  rows={3}
                  autoFocus
                />
              </div>
            )}

            {error && (
              <p className="mt-4 font-mono text-[0.65rem] text-red-500 border border-red-200 px-3 py-2">{error}</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {step > 0 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[#888] hover:text-[#1a1a1a] transition-colors cursor-pointer"
          >
            ← Voltar
          </button>
        ) : <div />}

        <Button
          onClick={handleNext}
          disabled={!canAdvance()}
          loading={loading && step === STEPS.length - 1}
        >
          {step < STEPS.length - 1 ? 'Continuar →' : 'Entrar na galeria →'}
        </Button>
      </div>
    </div>
  )
}
