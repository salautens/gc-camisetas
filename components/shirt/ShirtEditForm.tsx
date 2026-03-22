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
import { useToast } from '@/components/ui/Toast'
import type { Shirt } from '@/lib/types'
import Image from 'next/image'

interface ShirtEditFormProps {
  shirt: Shirt
  userId: string
}

export function ShirtEditForm({ shirt, userId }: ShirtEditFormProps) {
  const [clube, setClube] = useState(shirt.clube)
  const [temporada, setTemporada] = useState(shirt.temporada)
  const [liga, setLiga] = useState(shirt.liga || '')
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
  const { showToast } = useToast()

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
      liga: liga.trim() || null,
      versao,
      fabricante: fabricante.trim() || null,
      condicao: condicao || null,
      historia: historia.trim() || null,
    }).eq('id', shirt.id)

    setLoading(false)
    if (error) { setError(error.message); return }
    showToast('Kit salvo.')
    router.push('/gallery')
    router.refresh()
  }

  return (
    <div className="min-h-screen px-5 sm:px-10 pt-24 sm:pt-32 pb-20 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-2">
        <p className="font-mono text-[1rem] tracking-[0.35em] uppercase text-[#888]">Editar</p>
        <button
          onClick={() => router.back()}
          className="font-mono text-[1rem] tracking-[0.2em] uppercase text-[#888] hover:text-[#1a1a1a] transition-colors cursor-pointer"
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
                className="font-mono text-[1rem] tracking-[0.15em] uppercase text-[#888] hover:text-[#1a1a1a] transition-colors cursor-pointer"
              >
                Trocar foto
              </button>
            </div>
          </div>
        ) : !showImageEditor ? (
          <button
            onClick={() => setShowImageEditor(true)}
            className="w-full border border-dashed border-[#e0e0e0] p-8 font-mono text-[1rem] tracking-[0.2em] uppercase text-[#888] hover:border-[#1a1a1a] transition-colors cursor-pointer"
          >
            + Adicionar foto
          </button>
        ) : null}

        {showImageEditor && (
          <div className="border border-[#e0e0e0] p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[1rem] tracking-[0.2em] uppercase text-[#1a1a1a]">Nova foto</span>
              <button
                onClick={() => setShowImageEditor(false)}
                className="font-mono text-[1rem] tracking-[0.1em] uppercase text-[#888] hover:text-[#1a1a1a] transition-colors cursor-pointer"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          <div>
            <Label htmlFor="clube">Clube *</Label>
            <Input id="clube" value={clube} onChange={(e) => setClube(e.target.value)} required />
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
          <Textarea id="historia" value={historia} onChange={(e) => setHistoria(e.target.value)} rows={3} placeholder="A história por trás deste kit..." />
        </div>

        {error && (
          <p className="font-mono text-[1rem] text-red-500 border border-red-200 px-3 py-2">{error}</p>
        )}

        <Button type="submit" loading={loading}>
          Salvar alterações
        </Button>
      </form>
    </div>
  )
}
