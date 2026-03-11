import { SelectHTMLAttributes, forwardRef } from 'react'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full bg-transparent border-b border-[#1a1a1a] text-[#1a1a1a] font-mono text-[0.7rem] tracking-[0.05em] py-2 px-0 focus:outline-none appearance-none cursor-pointer ${className}`}
        {...props}
      >
        {children}
      </select>
    )
  }
)

Select.displayName = 'Select'
