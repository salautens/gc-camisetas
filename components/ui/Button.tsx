'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', loading, children, disabled, className = '', ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0A0908] disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5'

    const variants = {
      primary: 'bg-[#3DFF6E] text-[#0A0908] hover:bg-[#2EDD58] focus:ring-[#3DFF6E]',
      ghost: 'border border-[#2A2520] text-[#F2EDE8] hover:bg-[#141210] focus:ring-[#2A2520]',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${base} ${variants[variant]} ${className}`}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
