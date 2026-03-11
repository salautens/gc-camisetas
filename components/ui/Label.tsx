import { LabelHTMLAttributes } from 'react'

export function Label({ className = '', ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={`block text-xs font-medium text-[#7A7570] uppercase tracking-wider mb-1.5 ${className}`}
      {...props}
    />
  )
}
