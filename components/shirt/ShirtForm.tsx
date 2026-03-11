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
      versao,
      fabricante: fabricante.trim() || null,
      condicao: condicao || null,
      historia: historia.trim() || null,
      processing_status: 'none',
    }

    if (shirtId) {
      // Update existing
      const { error } = await supabase.from('shirts').update(payload).eq('id', shirtId)
      if (error) { setError(error.message); setLoading(false); return }
    } else {
      // Insert new
      const { data, error } = await supabase.from('shirts').insert(payload).select().single()
      if (error) { setError(error.message); setLoading(false); return }
      setShirtId(data.id)
      setLoading(false)
      return
    }

    setLoading(false)
    router.push(`/shirt/${shirtId}`)
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-[#F2EDE8] mb-8">Nova camiseta</h1>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="clube">Clube *</Label>
            <Input
              id="clube"
              value={clube}
              onChange={(e) => setClube(e.target.value)}
              placeholder="Ex: Flamengo"
              required
            />
          </div>
          <div>
            <Label htmlFor="temporada">Temporada *</Label>
            <Input
              id="temporada"
              value={temporada}
              onChange={(e) => setTemporada(e.target.value)}
              placeholder="Ex: 2023/24"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="versao">Versão</Label>
            <Select
              id="versao"
              value={versao}
              onChange={(e) => setVersao(e.target.value as Shirt['versao'])}
            >
              <option value="home">Titular</option>
              <option value="away">Visitante</option>
              <option value="third">Terceiro</option>
              <option value="goalkeeper">Goleiro</option>
              <option value="special">Especial</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="fabricante">Fabricante</Label>
            <Input
              id="fabricante"
              value={fabricante}
              onChange={(e) => setFabricante(e.target.value)}
              placeholder="Ex: Nike, Adidas..."
            />
          </div>
        </div>

        <div>
          <Label htmlFor="condicao">Condição</Label>
          <Select
            id="condicao"
            value={condicao || ''}
            onChange={(e) => setCondicao(e.target.value as Shirt['condicao'] || null)}
          >
            <option value="">Não informado</option>
            <option value="mint">Mint — perfeita</option>
            <option value="excellent">Excellent — excelente</option>
            <option value="good">Good — boa</option>
            <option value="worn">Worn — usada</option>
          </Select>
        </div>

        <div>
          <Label htmlFor="historia">História</Label>
          <Textarea
            id="historia"
            value={historia}
            onChange={(e) => setHistoria(e.target.value)}
            placeholder="Como conseguiu essa camisa? Qual memória ela guarda?"
            rows={3}
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
        )}

        {!shirtId && (
          <Button type="submit" loading={loading} className="w-full">
            Salvar e adicionar foto
          </Button>
        )}
      </form>

      {/* Kit Lens — shown after shirt is saved */}
      {shirtId && (
        <div className="mt-8 pt-8 border-t border-[#2A2520]">
          <KitLensUploader
            shirtId={shirtId}
            userId={userId}
            redirectTo={`/shirt/${shirtId}`}
          />
          <div className="mt-4 flex gap-3">
            <Button
              variant="ghost"
              onClick={() => router.push(`/shirt/${shirtId}`)}
              className="flex-1"
            >
              Pular por agora
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
