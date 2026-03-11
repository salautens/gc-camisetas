import { TextareaHTMLAttributes, forwardRef } from 'react'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`w-full rounded-lg bg-[#141210] border border-[#2A2520] text-[#F2EDE8] placeholder-[#7A7570] px-3 py-2.5 text-sm focus:outline-none focus:border-[#3DFF6E] transition-colors resize-none ${className}`}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'
