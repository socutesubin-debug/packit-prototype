import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-[background,transform,box-shadow,color] duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-100 select-none',
  {
    variants: {
      variant: {
        primary: 'bg-brand text-white shadow-[var(--shadow-brand)] hover:bg-brand-deep disabled:bg-faint disabled:shadow-none',
        dark: 'bg-ink text-white hover:bg-ink-2 disabled:bg-faint',
        secondary: 'bg-surface text-ink ring-1 ring-line hover:bg-sunken disabled:text-faint',
        soft: 'bg-sunken text-ink hover:bg-line',
        ghost: 'text-ink-2 hover:bg-sunken',
        kakao: 'bg-[#FEE500] text-[#191600] hover:brightness-95',
      },
      size: {
        lg: 'h-14 rounded-full px-6 text-[16px]',
        md: 'h-11 rounded-full px-5 text-[15px]',
        sm: 'h-9 rounded-full px-3.5 text-[13px]',
        icon: 'size-11 rounded-full',
        iconSm: 'size-9 rounded-full',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
))
Button.displayName = 'Button'
