'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

type ToastContextValue = { showToast: (message: string) => void }
const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const showToast = useCallback((text: string) => {
    if (timer.current) clearTimeout(timer.current)
    setMessage(text)
    timer.current = setTimeout(() => setMessage(''), 4000)
  }, [])

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div role="status" aria-live="polite" aria-atomic="true" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200]">
        {message && <div className="rounded-full bg-[#1a1a1a] px-6 py-3 text-sm text-white shadow-lg">{message}</div>}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
