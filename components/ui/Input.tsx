import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full rounded-lg bg-[#141210] border ${error ? 'border-red-500' : 'border-[#2A2520]'} text-[#F2EDE8] placeholder-[#7A7570] px-3 py-2.5 text-sm focus:outline-none focus:border-[#3DFF6E] transition-colors ${className}`}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'
