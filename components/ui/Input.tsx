import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full bg-transparent border-b ${error ? 'border-red-400' : 'border-[#1a1a1a]'} text-[#1a1a1a] placeholder-[#888] font-mono text-[0.7rem] tracking-[0.05em] py-2 px-0 focus:outline-none transition-colors ${className}`}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'
