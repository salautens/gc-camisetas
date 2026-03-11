'use client'

import { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
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
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
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
    setOriginalUrl(publicUrl)

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

    // Poll for processed_url
    pollRef.current = setInterval(async () => {
      const { data } = await supabase
        .from('shirts')
        .select('processed_url, processing_status')
        .eq('id', shirtId)
        .single()

      if (data?.processing_status === 'done' && data.processed_url) {
        clearInterval(pollRef.current!)
        setProcessedUrl(data.processed_url)
        setStatus('cropping') // Go to crop step instead of done
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
    if (redirectTo) setTimeout(() => router.push(redirectTo), 1200)
  }, [shirtId, userId, supabase, onProcessed, redirectTo, router])

  const handleSkipCrop = useCallback(() => {
    if (!processedUrl) return
    setFinalUrl(processedUrl)
    setStatus('done')
    onProcessed?.(processedUrl)
    if (redirectTo) setTimeout(() => router.push(redirectTo), 1200)
  }, [processedUrl, onProcessed, redirectTo, router])

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const checkerStyle = {
    backgroundImage: 'linear-gradient(45deg,#1a1a1a 25%,transparent 25%),linear-gradient(-45deg,#1a1a1a 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#1a1a1a 75%),linear-gradient(-45deg,transparent 75%,#1a1a1a 75%)',
    backgroundSize: '20px 20px',
    backgroundPosition: '0 0,0 10px,10px -10px,-10px 0px',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[#3DFF6E] text-xs font-bold uppercase tracking-widest">Kit Lens</span>
        <span className="text-[#7A7570] text-xs">— remoção de fundo automática</span>
      </div>

      {/* Drop zone */}
      {status === 'idle' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors ${
            dragOver ? 'border-[#3DFF6E] bg-[#3DFF6E]/5' : 'border-[#2A2520] hover:border-[#7A7570]'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-[#141210] flex items-center justify-center">
            <svg width="20" height="20" fill="none" stroke="#7A7570" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-[#F2EDE8] text-sm font-medium">Arraste uma foto aqui</p>
            <p className="text-[#7A7570] text-xs mt-1">ou clique para selecionar · JPG, PNG até 12MB</p>
          </div>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />

      {/* Processing spinner */}
      <AnimatePresence>
        {(status === 'uploading' || status === 'processing' || status === 'saving') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="border border-[#2A2520] rounded-xl p-6 flex flex-col items-center gap-3"
          >
            <svg className="animate-spin w-10 h-10 text-[#3DFF6E]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-[#F2EDE8] text-sm font-medium">
              {status === 'uploading' ? 'Enviando imagem...' : status === 'saving' ? 'Salvando recorte...' : 'Removendo fundo...'}
            </p>
            <p className="text-[#7A7570] text-xs">Aguarde um momento</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Crop step */}
      <AnimatePresence>
        {status === 'cropping' && processedUrl && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
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
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="border border-[#3DFF6E]/30 rounded-xl overflow-hidden"
          >
            <div className="bg-[#141210] p-3 flex items-center gap-2">
              <svg width="14" height="14" fill="#3DFF6E" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
              </svg>
              <span className="text-[#3DFF6E] text-xs font-medium">Imagem salva com sucesso</span>
            </div>
            <div className="relative h-64" style={checkerStyle}>
              <Image src={finalUrl} alt="Camiseta final" fill className="object-contain p-4" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 flex items-center justify-between">
          <p className="text-red-400 text-sm">{error}</p>
          <Button variant="ghost" onClick={() => { setStatus('idle'); setError(null) }} className="text-xs h-auto py-1 px-2">
            Tentar novamente
          </Button>
        </div>
      )}
    </div>
  )
}
