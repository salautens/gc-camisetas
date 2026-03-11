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
    router.push(`/shirt/${shirt.id}`)
    router.refresh()
  }

  const checkerStyle = {
    backgroundImage: 'linear-gradient(45deg,#1a1a1a 25%,transparent 25%),linear-gradient(-45deg,#1a1a1a 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#1a1a1a 75%),linear-gradient(-45deg,transparent 75%,#1a1a1a 75%)',
    backgroundSize: '20px 20px',
    backgroundPosition: '0 0,0 10px,10px -10px,-10px 0px',
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#F2EDE8]">Editar camiseta</h1>
        <button
          onClick={() => router.back()}
          className="text-sm text-[#7A7570] hover:text-[#F2EDE8] transition-colors"
        >
          Cancelar
        </button>
      </div>

      {/* Current image + change option */}
      <div className="mb-8">
        <Label>Foto</Label>
        {currentImageUrl && !showImageEditor ? (
          <div className="rounded-xl overflow-hidden border border-[#2A2520]">
            <div className="relative h-48" style={shirt.processed_url ? checkerStyle : { backgroundColor: '#141210' }}>
              <Image src={currentImageUrl} alt={shirt.clube} fill className="object-contain p-3" />
            </div>
            <div className="p-3 flex gap-3 border-t border-[#2A2520]">
              <button
                onClick={() => setShowImageEditor(true)}
                className="text-xs text-[#3DFF6E] hover:underline"
              >
                Trocar foto
              </button>
            </div>
          </div>
        ) : !showImageEditor ? (
          <button
            onClick={() => setShowImageEditor(true)}
            className="w-full border-2 border-dashed border-[#2A2520] rounded-xl p-6 text-sm text-[#7A7570] hover:border-[#7A7570] transition-colors"
          >
            + Adicionar foto
          </button>
        ) : null}

        {showImageEditor && (
          <div className="border border-[#2A2520] rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-[#F2EDE8] font-medium">Nova foto</span>
              <button
                onClick={() => setShowImageEditor(false)}
                className="text-xs text-[#7A7570] hover:text-[#F2EDE8] transition-colors"
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

      {/* Fields */}
      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="clube">Clube *</Label>
            <Input id="clube" value={clube} onChange={(e) => setClube(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="temporada">Temporada *</Label>
            <Input id="temporada" value={temporada} onChange={(e) => setTemporada(e.target.value)} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
            <option value="">Não informado</option>
            <option value="mint">Mint — perfeita</option>
            <option value="excellent">Excellent — excelente</option>
            <option value="good">Good — boa</option>
            <option value="worn">Worn — usada</option>
          </Select>
        </div>

        <div>
          <Label htmlFor="historia">História</Label>
          <Textarea id="historia" value={historia} onChange={(e) => setHistoria(e.target.value)} rows={3} placeholder="Como conseguiu essa camisa?" />
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
        )}

        <Button type="submit" loading={loading} className="w-full">
          Salvar alterações
        </Button>
      </form>
    </div>
  )
}
