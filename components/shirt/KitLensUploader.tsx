'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CameraCapture } from './CameraCapture'

type Side = 'front' | 'back'
interface KitLensUploaderProps {
  shirtId: string
  userId: string
  redirectTo?: string
  onProcessed?: (url: string) => void
  initialFrontUrl?: string | null
  initialBackUrl?: string | null
  initialFrontProcessedUrl?: string | null
  initialBackProcessedUrl?: string | null
}

export function KitLensUploader({
  shirtId, userId, redirectTo, onProcessed,
  initialFrontUrl = null, initialBackUrl = null,
  initialFrontProcessedUrl = null, initialBackProcessedUrl = null,
}: KitLensUploaderProps) {
  const router = useRouter()
  const supabase = createClient()
  const [photos, setPhotos] = useState({ front: initialFrontUrl, back: initialBackUrl })
  const [processed, setProcessed] = useState({ front: initialFrontProcessedUrl, back: initialBackProcessedUrl })
  const [processing, setProcessing] = useState(false)
  const [side, setSide] = useState<Side>(initialFrontUrl ? 'back' : 'front')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const busyRef = useRef(false)
  const closeCamera = useCallback(() => setCameraOpen(false), [])
  const label = side === 'front' ? 'Frente' : 'Verso'
  const buttonClass = 'min-h-12 border border-[#888] px-5 py-3 font-mono text-sm tracking-widest uppercase hover:bg-[#f1f1f1] disabled:opacity-40'

  useEffect(() => {
    if (!file) { setPreview(null); return }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  function selectFile(selected: File) {
    if (busyRef.current) return
    setCameraOpen(false)
    setError(null)
    if (!selected.type.startsWith('image/')) { setError('Selecione uma imagem.'); return }
    if (selected.size > 12 * 1024 * 1024) { setError('A foto deve ter até 12 MB.'); return }
    setFile(selected)
  }

  function selectSide(next: Side) {
    if (busyRef.current) return
    setSide(next)
    setFile(null)
    setError(null)
    setCameraOpen(false)
  }

  async function processSide(target: Side) {
    setProcessing(true)
    try {
      const response = await fetch('/api/kit-lens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shirtId, side: target }),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok || typeof body.processed_url !== 'string') throw new Error('Processing failed')
      setProcessed(current => ({ ...current, [target]: body.processed_url }))
    } catch {
      setError('O original está salvo. A remoção de fundo não foi concluída; você pode tentar novamente ou continuar.')
    } finally {
      setProcessing(false)
    }
  }

  async function retryBackground() {
    if (!photos[side] || busyRef.current) return
    busyRef.current = true
    setSaving(true)
    setError(null)
    try { await processSide(side) }
    finally { busyRef.current = false; setSaving(false) }
  }

  async function savePhoto() {
    if (!file || busyRef.current) return
    busyRef.current = true
    setSaving(true)
    setError(null)
    try {
      const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : file.type === 'image/heic' ? 'heic' : file.type === 'image/heif' ? 'heif' : 'jpg'
      const path = userId + '/' + shirtId + '/document-' + side + '-' + crypto.randomUUID() + '.' + ext
      const { error: uploadError } = await supabase.storage.from('shirt-originals')
        .upload(path, file, { contentType: file.type, upsert: false })
      if (uploadError) throw new Error('Não foi possível enviar a foto. Tente novamente.')
      const { data: { publicUrl } } = supabase.storage.from('shirt-originals').getPublicUrl(path)
      const update = side === 'front'
        ? { original_url: publicUrl, processed_url: null, processing_status: 'none' }
        : { back_original_url: publicUrl, back_processed_url: null }
      const { data, error: saveError } = await supabase.from('shirts').update(update)
        .eq('id', shirtId).eq('user_id', userId).select('id').single()
      if (saveError || !data) throw new Error('A foto não foi vinculada à camiseta. Tente novamente.')
      setPhotos(current => ({ ...current, [side]: publicUrl }))
      setProcessed(current => ({ ...current, [side]: null }))
      await processSide(side)
      setFile(null)
      if (side === 'front' && !photos.back) setSide('back')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar a foto.')
    } finally {
      busyRef.current = false
      setSaving(false)
    }
  }

  function finish() {
    if (!photos.front || !photos.back || saving) return
    onProcessed?.(photos.front)
    if (redirectTo) router.push(redirectTo)
    else router.refresh()
  }

  return (
    <section className="space-y-5" aria-label="Registro fotográfico da camiseta">
      <div>
        <p className="font-mono text-sm uppercase tracking-widest text-[#1a1a1a]">Registro da camiseta</p>
        <p className="mt-2 font-mono text-sm leading-relaxed text-[#888]">Primeiro a frente, depois o verso. Fotografe a peça inteira, bem iluminada, com as mangas abertas. Guardamos os originais e criamos cópias sem fundo para exibição.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(['front', 'back'] as const).map((item, index) => (
          <button key={item} type="button" disabled={saving || (item === 'back' && !photos.front)} onClick={() => selectSide(item)}
            aria-pressed={side === item}
            className={'border p-3 text-left disabled:opacity-40 ' + (side === item ? 'border-[#1a1a1a]' : 'border-[#e0e0e0]')}>
            <span className="font-mono text-sm uppercase tracking-widest">{index + 1}. {item === 'front' ? 'Frente' : 'Verso'}</span>
            <span className="mt-2 block font-mono text-xs text-[#888]">{photos[item] ? 'Salva · toque para substituir' : 'Pendente'}</span>
            {photos[item] && (
              <div className="relative mt-3 aspect-[3/4] bg-[#f1f1f1]">
                <Image src={(processed[item] || photos[item])!} alt={item === 'front' ? 'Frente da camiseta' : 'Verso da camiseta'} fill sizes="(max-width: 640px) 45vw, 240px" className="object-contain p-2" unoptimized />
              </div>
            )}
          </button>
        ))}
      </div>

      <p className="font-mono text-sm uppercase tracking-widest" aria-live="polite">
        {side === 'front' ? '1 de 2 · Frente da camiseta' : '2 de 2 · Verso da camiseta'}
      </p>

      {processing && <p role="status" className="font-mono text-sm text-[#888]">Removendo o fundo de {label.toLowerCase()}...</p>}
      {!file && !cameraOpen && !saving && (
        <div className="space-y-3">
          <button type="button" className={buttonClass + ' w-full'} onClick={() => { setError(null); setCameraOpen(true) }}>
            Tirar foto · {label}
          </button>
          <button type="button" className={buttonClass + ' w-full border-dashed'} onClick={() => fileRef.current?.click()}>
            Selecionar foto · {label}
          </button>
          <p className="font-mono text-xs text-[#888]">Você também pode arrastar uma imagem para a área abaixo. Até 12 MB por lado.</p>
          <div onDragOver={event => event.preventDefault()} onDrop={event => {
            event.preventDefault()
            const selected = event.dataTransfer.files[0]
            if (selected) selectFile(selected)
          }} className="border border-dashed border-[#e0e0e0] p-5 text-center font-mono text-sm text-[#888]">
            Arraste a foto de {label.toLowerCase()} aqui
          </div>
        </div>
      )}

      {cameraOpen && <CameraCapture side={side} onClose={closeCamera} onCapture={selectFile} />}

      {file && (
        <div className="space-y-3 border border-[#e0e0e0] p-4" aria-busy={saving}>
          <p className="font-mono text-sm">Confira a foto de {label.toLowerCase()} antes de salvar.</p>
          {preview && (
            <div className="relative aspect-[3/4] bg-[#f1f1f1]">
              <Image src={preview} alt={'Conferir ' + label.toLowerCase() + ' da camiseta'} fill unoptimized className="object-contain" />
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={savePhoto} disabled={saving} className={buttonClass}>{processing ? 'Removendo fundo...' : saving ? 'Salvando...' : 'Confirmar ' + label.toLowerCase()}</button>
            <button type="button" disabled={saving} className={buttonClass} onClick={() => { setFile(null); setError(null) }}>Escolher outra foto</button>
          </div>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={event => {
        const selected = event.target.files?.[0]
        event.target.value = ''
        if (selected) selectFile(selected)
      }} />

      {photos[side] && !processed[side] && !file && !cameraOpen && (
        <button type="button" disabled={saving} className={buttonClass} onClick={retryBackground}>Tentar remover fundo · {label}</button>
      )}
      {error && <p role="alert" className="border border-red-200 p-3 font-mono text-sm text-red-600">{error}</p>}
      <p className="font-mono text-sm text-[#888]" role="status">
        {photos.front && photos.back ? 'Frente e verso salvos.' : photos.front ? 'Frente salva. Agora registre o verso.' : 'Registre a frente para começar.'}
      </p>
      {photos.front && photos.back && <button type="button" disabled={saving || !!file || cameraOpen} className={buttonClass + ' w-full'} onClick={finish}>Concluir registro →</button>}
    </section>
  )
}
