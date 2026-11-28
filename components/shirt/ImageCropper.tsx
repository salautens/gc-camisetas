'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

interface ImageCropperProps {
  src: string
  onCropDone: (croppedBlob: Blob) => void | Promise<void>
  onSkip: () => void
}

export function ImageCropper({ src, onCropDone, onSkip }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>({ unit: '%', x: 0, y: 0, width: 100, height: 100 })
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [zoom, setZoom] = useState(1)
  const [loading, setLoading] = useState(false)
  const [localSrc, setLocalSrc] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    let cancelled = false
    let objectUrl: string | undefined
    const controller = new AbortController()
    setLocalSrc(null)
    setError(null)
    setZoom(1)
    setCrop({ unit: '%', x: 0, y: 0, width: 100, height: 100 })
    setCompletedCrop(undefined)
    fetch(src, { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error(); return response.blob() })
      .then(blob => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setLocalSrc(objectUrl)
      })
      .catch(() => { if (!cancelled) setError('Não foi possível abrir a imagem para corte. Tente novamente.') })
    return () => {
      cancelled = true
      controller.abort()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [src])

  function setApproximation(value: number) {
    const image = imgRef.current
    if (!image) return
    const size = 100 / value
    const centerX = crop.unit === '%' ? crop.x + crop.width / 2 : 50
    const centerY = crop.unit === '%' ? crop.y + crop.height / 2 : 50
    const next: Crop = {
      unit: '%', width: size, height: size,
      x: Math.max(0, Math.min(100 - size, centerX - size / 2)),
      y: Math.max(0, Math.min(100 - size, centerY - size / 2)),
    }
    setZoom(value)
    setCrop(next)
    setCompletedCrop({
      unit: 'px', x: next.x * image.width / 100, y: next.y * image.height / 100,
      width: next.width * image.width / 100, height: next.height * image.height / 100,
    })
  }

  const applyCrop = useCallback(async () => {
    const image = imgRef.current
    if (!completedCrop?.width || !completedCrop.height || !image) return
    setLoading(true)
    setError(null)
    try {
      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(completedCrop.width * scaleX))
      canvas.height = Math.max(1, Math.round(completedCrop.height * scaleY))
      const context = canvas.getContext('2d')
      if (!context) throw new Error()
      context.drawImage(image, completedCrop.x * scaleX, completedCrop.y * scaleY,
        completedCrop.width * scaleX, completedCrop.height * scaleY, 0, 0, canvas.width, canvas.height)
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(result => result ? resolve(result) : reject(new Error()), 'image/png')
      })
      await onCropDone(blob)
    } catch {
      setError('Não foi possível salvar o recorte. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }, [completedCrop, onCropDone])

  const buttonClass = 'min-h-12 border border-[#888] px-5 py-3 font-mono text-sm uppercase tracking-widest hover:bg-[#f1f1f1] disabled:opacity-40'
  return (
    <section className="space-y-4 border border-[#e0e0e0] p-4" aria-label="Cortar e aproximar camiseta" aria-busy={loading}>
      <p className="font-mono text-sm text-[#1a1a1a]">Cortar e aproximar</p>
      <p className="font-mono text-sm text-[#888]">Arraste a seleção e ajuste as bordas para enquadrar a camiseta. Uma área menor deixa a peça maior na visualização. O original permanece guardado.</p>
      {!localSrc && !error && <p role="status" className="font-mono text-sm">Abrindo imagem...</p>}
      {localSrc && (
        <>
          <div className="overflow-hidden bg-[#e8e8e8]">
            <ReactCrop crop={crop} disabled={loading} onChange={(_, percent) => setCrop(percent)} onComplete={pixel => setCompletedCrop(pixel)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img ref={imgRef} src={localSrc} alt="Selecionar área da camiseta" style={{ maxHeight: '60vh', maxWidth: '100%', display: 'block' }}
                onLoad={event => {
                  const image = event.currentTarget
                  setCompletedCrop({ unit: 'px', x: 0, y: 0, width: image.width, height: image.height })
                }} />
            </ReactCrop>
          </div>
          <label className="block space-y-2 font-mono text-sm">
            <span>Aproximar · {zoom.toFixed(1)}×</span>
            <input type="range" min="1" max="3" step="0.1" value={zoom} disabled={loading} onChange={event => setApproximation(Number(event.target.value))} className="block min-h-11 w-full" />
          </label>
        </>
      )}
      {error && <p role="alert" className="font-mono text-sm text-red-600">{error}</p>}
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={applyCrop} disabled={loading || !localSrc || !completedCrop?.width || !completedCrop.height} className={buttonClass}>{loading ? 'Salvando...' : 'Aplicar recorte'}</button>
        <button type="button" onClick={onSkip} disabled={loading} className={buttonClass}>Manter sem corte</button>
      </div>
    </section>
  )
}
