'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Button } from '@/components/ui/Button'

interface ImageCropperProps {
  src: string
  onCropDone: (croppedBlob: Blob) => void
  onSkip: () => void
}

function centerAspectCrop(width: number, height: number) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 80 }, 3 / 4, width, height),
    width,
    height
  )
}

export function ImageCropper({ src, onCropDone, onSkip }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const imgRef = useRef<HTMLImageElement>(null)
  const [loading, setLoading] = useState(false)
  // Fetch image as local objectURL to avoid tainted canvas
  const [localSrc, setLocalSrc] = useState<string | null>(null)

  useEffect(() => {
    let objectUrl: string
    fetch(src)
      .then(r => r.blob())
      .then(blob => {
        objectUrl = URL.createObjectURL(blob)
        setLocalSrc(objectUrl)
      })
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [src])

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height))
  }

  const applyCrop = useCallback(async () => {
    if (!completedCrop || !imgRef.current) return
    setLoading(true)

    const image = imgRef.current
    const canvas = document.createElement('canvas')
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    canvas.width = Math.floor(completedCrop.width * scaleX)
    canvas.height = Math.floor(completedCrop.height * scaleY)

    const ctx = canvas.getContext('2d')
    if (!ctx) { setLoading(false); return }

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0, 0,
      canvas.width,
      canvas.height
    )

    canvas.toBlob((blob) => {
      if (blob) onCropDone(blob)
      setLoading(false)
    }, 'image/png', 1)
  }, [completedCrop, onCropDone])

  if (!localSrc) {
    return (
      <div className="border border-[#2A2520] rounded-xl p-8 flex items-center justify-center">
        <svg className="animate-spin w-6 h-6 text-[#3DFF6E]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#F2EDE8] font-medium text-sm">Recortar imagem</p>
          <p className="text-[#7A7570] text-xs mt-0.5">Selecione apenas a área da camiseta</p>
        </div>
        <button onClick={onSkip} className="text-xs text-[#7A7570] hover:text-[#F2EDE8] transition-colors">
          Pular corte
        </button>
      </div>

      <div
        className="rounded-xl overflow-hidden border border-[#2A2520]"
        style={{
          backgroundImage: 'linear-gradient(45deg,#1a1a1a 25%,transparent 25%),linear-gradient(-45deg,#1a1a1a 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#1a1a1a 75%),linear-gradient(-45deg,transparent 75%,#1a1a1a 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0,0 10px,10px -10px,-10px 0px',
        }}
      >
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={localSrc}
            alt="Recortar camiseta"
            onLoad={onImageLoad}
            style={{ maxHeight: '480px', display: 'block', margin: '0 auto' }}
          />
        </ReactCrop>
      </div>

      <Button
        onClick={applyCrop}
        loading={loading}
        disabled={!completedCrop?.width || !completedCrop?.height}
        className="w-full"
      >
        Aplicar recorte
      </Button>
    </div>
  )
}
