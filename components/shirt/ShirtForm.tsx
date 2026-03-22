'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { KitLensUploader } from './KitLensUploader'
import type { Shirt } from '@/lib/types'

interface ShirtFormProps {
  userId: string
}

export function ShirtForm({ userId }: ShirtFormProps) {
  const [clube, setClube] = useState('')
  const [temporada, setTemporada] = useState('')
  const [liga, setLiga] = useState('')
  const [versao, setVersao] = useState<Shirt['versao']>('home')
  const [fabricante, setFabricante] = useState('')
  const [condicao, setCondicao] = useState<Shirt['condicao']>(null)
  const [historia, setHistoria] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shirtId, setShirtId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!clube.trim() || !temporada.trim()) {
      setError('Clube e temporada são obrigatórios')
      return
    }

    setLoading(true)
    setError(null)

    const payload = {
      user_id: userId,
      clube: clube.trim(),
      temporada: temporada.trim(),
      liga: liga.trim() || null,
      versao,
      fabricante: fabricante.trim() || null,
      condicao: condicao || null,
      historia: historia.trim() || null,
      processing_status: 'none',
    }

    const { data, error } = await supabase.from('shirts').insert(payload).select().single()
    if (error) { setError(error.message); setLoading(false); return }
    setShirtId(data.id)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 sm:px-10 py-24 sm:py-20">
      <div className="w-full max-w-lg">
      <p className="font-mono text-[1rem] tracking-[0.35em] uppercase text-[#888] mb-2">Nova camiseta</p>
      <h1 className="font-display font-light text-[clamp(2.5rem,6vw,5rem)] leading-[0.9] tracking-[-0.02em] text-[#1a1a1a] mb-12">
        Registrar
      </h1>

      {!shirtId ? (
        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <Label htmlFor="clube">Clube *</Label>
              <Input id="clube" value={clube} onChange={(e) => setClube(e.target.value)} placeholder="Flamengo" required />
            </div>
            <div>
              <Label htmlFor="temporada">Temporada *</Label>
              <Input id="temporada" value={temporada} onChange={(e) => setTemporada(e.target.value)} placeholder="2002–03" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <Label htmlFor="versao">Versão</Label>
              <Select id="versao" value={versao} onChange={(e) => setVersao(e.target.value as Shirt['versao'])}>
                <option value="home">Titular</option>
                <option value="away">Visitante</option>
                <option value="third">Terceiro</option>
                <option value="goalkeeper">Goleiro</option>
                <option value="special">Especial</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="liga">Liga</Label>
              <Input id="liga" value={liga} onChange={(e) => setLiga(e.target.value)} placeholder="Brasileirão, Champions..." />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <Label htmlFor="fabricante">Fornecedor</Label>
              <Input id="fabricante" value={fabricante} onChange={(e) => setFabricante(e.target.value)} placeholder="Nike, Adidas..." />
            </div>
            <div>
              <Label htmlFor="condicao">Condição</Label>
              <Select id="condicao" value={condicao || ''} onChange={(e) => setCondicao(e.target.value as Shirt['condicao'] || null)}>
                <option value="">—</option>
                <option value="nova">Nova</option>
                <option value="boa">Boa condição</option>
                <option value="usada">Usada</option>
                <option value="desfeitos">Desfeitos</option>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="historia">História</Label>
            <Textarea
              id="historia"
              value={historia}
              onChange={(e) => setHistoria(e.target.value)}
              placeholder="A história por trás deste kit..."
              rows={3}
            />
          </div>

          {error && (
            <p className="font-mono text-[1rem] text-red-500 border border-red-200 px-3 py-2">{error}</p>
          )}

          <Button type="submit" loading={loading}>
            Salvar e adicionar foto →
          </Button>
        </form>
      ) : (
        <div>
          <p className="font-mono text-[1rem] tracking-[0.2em] uppercase text-[#888] mb-8">
            Kit salvo. Adicione uma foto.
          </p>

          <KitLensUploader
            shirtId={shirtId}
            userId={userId}
            redirectTo={`/gallery`}
          />

          <div className="mt-6">
            <button
              onClick={() => router.push('/gallery')}
              className="font-mono text-[1rem] tracking-[0.2em] uppercase text-[#888] hover:text-[#1a1a1a] transition-colors cursor-pointer"
            >
              Pular por agora →
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
