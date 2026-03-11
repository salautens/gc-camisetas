import { LabelHTMLAttributes } from 'react'

export function Label({ className = '', ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={`block font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[#888] mb-2 ${className}`}
      {...props}
    />
  )
}
