'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', loading, children, disabled, className = '', ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 rounded-[2rem] font-mono text-[0.7rem] tracking-[0.1em] transition-all duration-150 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2 cursor-pointer'

    const variants = {
      primary: 'border border-[#1a1a1a] text-[#1a1a1a] bg-transparent hover:bg-[#1a1a1a] hover:text-white',
      ghost: 'border border-[#e0e0e0] text-[#888888] bg-transparent hover:border-[#1a1a1a] hover:text-[#1a1a1a]',
      danger: 'border border-red-400 text-red-600 bg-transparent hover:bg-red-600 hover:text-white',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${base} ${variants[variant]} ${className}`}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
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
