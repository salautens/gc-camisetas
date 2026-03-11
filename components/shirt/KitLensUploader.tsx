'use client'

import { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ImageCropper } from './ImageCropper'

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'cropping' | 'saving' | 'done' | 'failed'

interface KitLensUploaderProps {
  shirtId: string
  userId: string
  redirectTo?: string
  onProcessed?: (url: string) => void
}

export function KitLensUploader({ shirtId, userId, redirectTo, onProcessed }: KitLensUploaderProps) {
  const router = useRouter()
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [processedUrl, setProcessedUrl] = useState<string | null>(null)
  const [finalUrl, setFinalUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Apenas imagens são aceitas'); return }
    if (file.size > 12 * 1024 * 1024) { setError('Imagem deve ter menos de 12MB'); return }

    setError(null)
    setStatus('uploading')

    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${userId}/${shirtId}/original.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('shirt-originals')
      .upload(path, file, { upsert: true })

    if (uploadError) { setError(uploadError.message); setStatus('failed'); return }

    const { data: { publicUrl } } = supabase.storage.from('shirt-originals').getPublicUrl(path)
    await supabase.from('shirts').update({ original_url: publicUrl, processing_status: 'pending' }).eq('id', shirtId)
    setStatus('processing')

    const res = await fetch('/api/kit-lens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shirtId }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error || 'Erro ao processar imagem')
      setStatus('failed')
      return
    }

    pollRef.current = setInterval(async () => {
      const { data } = await supabase
        .from('shirts')
        .select('processed_url, processing_status')
        .eq('id', shirtId)
        .single()

      if (data?.processing_status === 'done' && data.processed_url) {
        clearInterval(pollRef.current!)
        setProcessedUrl(data.processed_url)
        setStatus('cropping')
      } else if (data?.processing_status === 'failed') {
        clearInterval(pollRef.current!)
        setError('Falha ao processar imagem')
        setStatus('failed')
      }
    }, 2000)
  }, [shirtId, userId, supabase])

  const handleCropDone = useCallback(async (blob: Blob) => {
    setStatus('saving')

    const croppedPath = `${userId}/${shirtId}/processed.png`
    const { error: uploadError } = await supabase.storage
      .from('shirt-processed')
      .upload(croppedPath, blob, { contentType: 'image/png', upsert: true })

    if (uploadError) { setError(uploadError.message); setStatus('failed'); return }

    const { data: { publicUrl } } = supabase.storage.from('shirt-processed').getPublicUrl(croppedPath)

    await supabase.from('shirts').update({
      processed_url: publicUrl,
      processing_status: 'done',
    }).eq('id', shirtId)

    setFinalUrl(publicUrl)
    setStatus('done')
    onProcessed?.(publicUrl)
    if (redirectTo) setTimeout(() => router.push(redirectTo), 1000)
  }, [shirtId, userId, supabase, onProcessed, redirectTo, router])

  const handleSkipCrop = useCallback(() => {
    if (!processedUrl) return
    setFinalUrl(processedUrl)
    setStatus('done')
    onProcessed?.(processedUrl)
    if (redirectTo) setTimeout(() => router.push(redirectTo), 1000)
  }, [processedUrl, onProcessed, redirectTo, router])

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      {status === 'idle' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border border-dashed p-10 flex flex-col items-center gap-3 cursor-crosshair transition-colors ${
            dragOver ? 'border-[#1a1a1a] bg-[#f1f1f1]' : 'border-[#e0e0e0] hover:border-[#888]'
          }`}
        >
          <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-[#1a1a1a]">
            Arraste uma foto aqui
          </p>
          <p className="font-mono text-[0.55rem] tracking-[0.15em] uppercase text-[#888]">
            ou clique para selecionar · JPG, PNG até 12MB
          </p>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />

      {/* Processing */}
      <AnimatePresence>
        {(status === 'uploading' || status === 'processing' || status === 'saving') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="border border-[#e0e0e0] p-8 flex flex-col items-center gap-4"
          >
            <div className="w-16 h-px bg-[#1a1a1a]" style={{ animation: 'loaderPulse 1.5s ease-in-out infinite alternate' }} />
            <p className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[#888]">
              {status === 'uploading' ? 'Enviando...' : status === 'saving' ? 'Salvando...' : 'Removendo fundo...'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Crop */}
      <AnimatePresence>
        {status === 'cropping' && processedUrl && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <ImageCropper
              src={processedUrl}
              onCropDone={handleCropDone}
              onSkip={handleSkipCrop}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Done */}
      <AnimatePresence>
        {status === 'done' && finalUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="border border-[#e0e0e0]"
          >
            <div className="relative aspect-square bg-[#f1f1f1]">
              <Image src={finalUrl} alt="Camiseta" fill className="object-contain p-6" />
            </div>
            <div className="p-3 border-t border-[#e0e0e0]">
              <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[#888]">Salvo</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="border border-red-200 px-4 py-3 flex items-center justify-between">
          <p className="font-mono text-[0.65rem] text-red-500">{error}</p>
          <button
            onClick={() => { setStatus('idle'); setError(null) }}
            className="font-mono text-[0.6rem] tracking-[0.1em] uppercase text-[#888] hover:text-[#1a1a1a] ml-4 cursor-pointer"
          >
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  )
}
