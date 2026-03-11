import { TextareaHTMLAttributes, forwardRef } from 'react'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`w-full bg-transparent border-b border-[#1a1a1a] text-[#1a1a1a] placeholder-[#888] font-mono text-[0.7rem] tracking-[0.05em] py-2 px-0 focus:outline-none resize-none ${className}`}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'
