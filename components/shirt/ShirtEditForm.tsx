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
import Image from 'next/image'

interface ShirtEditFormProps {
  shirt: Shirt
  userId: string
}

export function ShirtEditForm({ shirt, userId }: ShirtEditFormProps) {
  const [clube, setClube] = useState(shirt.clube)
  const [temporada, setTemporada] = useState(shirt.temporada)
  const [versao, setVersao] = useState<Shirt['versao']>(shirt.versao)
  const [fabricante, setFabricante] = useState(shirt.fabricante || '')
  const [condicao, setCondicao] = useState<Shirt['condicao']>(shirt.condicao)
  const [historia, setHistoria] = useState(shirt.historia || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showImageEditor, setShowImageEditor] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState(shirt.processed_url || shirt.original_url)
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

    const { error } = await supabase.from('shirts').update({
      clube: clube.trim(),
      temporada: temporada.trim(),
      versao,
      fabricante: fabricante.trim() || null,
      condicao: condicao || null,
      historia: historia.trim() || null,
    }).eq('id', shirt.id)

    setLoading(false)
    if (error) { setError(error.message); return }
    router.push('/gallery')
    router.refresh()
  }

  return (
    <div className="min-h-screen px-10 pt-32 pb-20 max-w-lg">
      <div className="flex items-center justify-between mb-2">
        <p className="font-mono text-[0.6rem] tracking-[0.35em] uppercase text-[#888]">Editar</p>
        <button
          onClick={() => router.back()}
          className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[#888] hover:text-[#1a1a1a] transition-colors cursor-pointer"
        >
          Cancelar
        </button>
      </div>
      <h1 className="font-display font-light text-[clamp(2rem,5vw,4rem)] leading-[0.9] tracking-[-0.02em] text-[#1a1a1a] mb-12">
        {shirt.clube}
      </h1>

      {/* Photo */}
      <div className="mb-10">
        <Label>Foto</Label>
        {currentImageUrl && !showImageEditor ? (
          <div className="border border-[#e0e0e0]">
            <div className="relative aspect-square bg-[#f1f1f1]">
              <Image src={currentImageUrl} alt={shirt.clube} fill className="object-contain p-6" />
            </div>
            <div className="p-3 border-t border-[#e0e0e0]">
              <button
                onClick={() => setShowImageEditor(true)}
                className="font-mono text-[0.6rem] tracking-[0.15em] uppercase text-[#888] hover:text-[#1a1a1a] transition-colors cursor-pointer"
              >
                Trocar foto
              </button>
            </div>
          </div>
        ) : !showImageEditor ? (
          <button
            onClick={() => setShowImageEditor(true)}
            className="w-full border border-dashed border-[#e0e0e0] p-8 font-mono text-[0.65rem] tracking-[0.2em] uppercase text-[#888] hover:border-[#1a1a1a] transition-colors cursor-pointer"
          >
            + Adicionar foto
          </button>
        ) : null}

        {showImageEditor && (
          <div className="border border-[#e0e0e0] p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[#1a1a1a]">Nova foto</span>
              <button
                onClick={() => setShowImageEditor(false)}
                className="font-mono text-[0.6rem] tracking-[0.1em] uppercase text-[#888] hover:text-[#1a1a1a] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
            <KitLensUploader
              shirtId={shirt.id}
              userId={userId}
              onProcessed={(url) => {
                setCurrentImageUrl(url)
                setShowImageEditor(false)
              }}
            />
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <Label htmlFor="clube">Clube *</Label>
            <Input id="clube" value={clube} onChange={(e) => setClube(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="temporada">Temporada *</Label>
            <Input id="temporada" value={temporada} onChange={(e) => setTemporada(e.target.value)} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
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
            <Label htmlFor="fabricante">Fabricante</Label>
            <Input id="fabricante" value={fabricante} onChange={(e) => setFabricante(e.target.value)} placeholder="Nike, Adidas..." />
          </div>
        </div>

        <div>
          <Label htmlFor="condicao">Condição</Label>
          <Select id="condicao" value={condicao || ''} onChange={(e) => setCondicao(e.target.value as Shirt['condicao'] || null)}>
            <option value="">—</option>
            <option value="mint">Mint</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="worn">Worn</option>
          </Select>
        </div>

        <div>
          <Label htmlFor="historia">História</Label>
          <Textarea id="historia" value={historia} onChange={(e) => setHistoria(e.target.value)} rows={3} placeholder="Como conseguiu essa camisa?" />
        </div>

        {error && (
          <p className="font-mono text-[0.65rem] text-red-500 border border-red-200 px-3 py-2">{error}</p>
        )}

        <Button type="submit" loading={loading}>
          Salvar alterações
        </Button>
      </form>
    </div>
  )
}
