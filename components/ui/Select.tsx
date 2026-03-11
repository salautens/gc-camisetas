import { SelectHTMLAttributes, forwardRef } from 'react'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full rounded-lg bg-[#141210] border border-[#2A2520] text-[#F2EDE8] px-3 py-2.5 text-sm focus:outline-none focus:border-[#3DFF6E] transition-colors appearance-none cursor-pointer ${className}`}
        {...props}
      >
        {children}
      </select>
    )
  }
)

Select.displayName = 'Select'
