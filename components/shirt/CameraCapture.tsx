'use client'

import { useEffect, useRef, useState } from 'react'

interface CameraCaptureProps {
  onCapture: (file: File) => void
  onClose: () => void
  side?: 'front' | 'back'
}

export function CameraCapture({ onCapture, onClose, side = 'front' }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const nativeRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [ready, setReady] = useState(false)
  const [capturing, setCapturing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function stopCamera() {
    streamRef.current?.getTracks().forEach(track => track.stop())
    streamRef.current = null
  }

  useEffect(() => {
    let cancelled = false

    async function startCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setError('Use a câmera do dispositivo pelo botão abaixo ou selecione uma foto.')
          return
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1440 } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach(track => track.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
      } catch (cause) {
        if (cancelled) return
        stopCamera()
        const name = cause instanceof DOMException ? cause.name : ''
        setError(name === 'NotAllowedError'
          ? 'Permita o acesso à câmera no navegador ou selecione uma foto do dispositivo.'
          : 'Não foi possível abrir a câmera. Tente a câmera do dispositivo ou selecione uma foto.')
      }
    }

    function handleVisibility() {
      if (document.hidden && streamRef.current) {
        cancelled = true
        stopCamera()
        onClose()
      }
    }

    void startCamera()
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      cancelled = true
      stopCamera()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [onClose])

  function capture() {
    const video = videoRef.current
    if (!video || !ready || capturing || !video.videoWidth || !video.videoHeight) return
    setCapturing(true)
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    if (!context) { setCapturing(false); setError('Não foi possível capturar a foto.'); return }
    context.drawImage(video, 0, 0)
    canvas.toBlob(blob => {
      if (!blob) { setCapturing(false); setError('Não foi possível capturar a foto.'); return }
      stopCamera()
      onCapture(new File([blob], 'camiseta-' + Date.now() + '.jpg', { type: 'image/jpeg' }))
    }, 'image/jpeg', 0.95)
  }

  const buttonClass = 'min-h-11 border border-[#888] px-5 py-3 font-mono text-sm tracking-widest uppercase hover:bg-[#f1f1f1] disabled:opacity-40'

  return (
    <section aria-label="Câmera" className="space-y-4 border border-[#e0e0e0] p-4">
      <p className="font-mono text-sm text-[#888]">Enquadre {side === 'front' ? 'a frente' : 'o verso'} da camiseta e toque em Tirar foto.</p>
      {!error && (
        <div className="relative overflow-hidden bg-black">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            onLoadedData={() => setReady(true)}
            aria-label="Prévia da câmera"
            className="block w-full max-h-[60vh] object-contain"
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6" aria-hidden="true">
            <svg viewBox="0 0 300 340" className="h-full max-h-full w-full max-w-full text-gray-300 opacity-70" fill="none">
              <path
                d="M105 40 65 55 15 110 58 153 82 130 82 300 218 300 218 130 242 153 285 110 235 55 195 40 C190 69 110 69 105 40Z"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray="10 7"
                strokeLinejoin="round"
                fill="currentColor"
                fillOpacity="0.06"
              />
            </svg>
          </div>
          <p className="pointer-events-none absolute bottom-3 left-0 right-0 text-center font-mono text-xs text-gray-200">{side === 'front' ? 'Frente' : 'Verso'} · Alinhe a camiseta com a silhueta</p>
        </div>
      )}
      {error && <p role="alert" className="font-mono text-sm text-red-600">{error}</p>}
      <div className="flex flex-wrap gap-3">
        {!error && <button type="button" onClick={capture} disabled={!ready || capturing} className={buttonClass}>{capturing ? 'Capturando...' : 'Tirar foto'}</button>}
        {error && <button type="button" onClick={() => nativeRef.current?.click()} className={buttonClass}>Câmera do dispositivo</button>}
        <button type="button" onClick={() => { stopCamera(); onClose() }} className={buttonClass}>Cancelar</button>
      </div>
      <input ref={nativeRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={event => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (file) { stopCamera(); onCapture(file) }
      }} />
    </section>
  )
}
