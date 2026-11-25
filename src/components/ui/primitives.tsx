import { motion } from 'motion/react'
import { Hourglass, Plus, ShoppingBag, X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import type { Priority } from '@/lib/types'
import { cn } from '@/lib/utils'

export function Chip({
  active,
  children,
  onClick,
  className,
}: {
  active?: boolean
  children: ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      data-state={active ? 'on' : 'off'}
      className={cn(
        'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-3 text-[13px] font-medium whitespace-nowrap shadow-xs transition-[color,background-color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
        className,
      )}
    >
      {children}
    </button>
  )
}

export const PRIORITY_META: Record<Priority, { label: string; dot: string; pill: string }> = {
  must: { label: '꼭 살래', dot: 'bg-must', pill: 'border-transparent bg-primary text-primary-foreground' },
  maybe: { label: '고민', dot: 'bg-maybe', pill: 'border-border bg-secondary text-secondary-foreground' },
  skip: { label: '안 살래', dot: 'bg-skip', pill: 'border-border bg-background text-muted-foreground line-through decoration-muted-foreground/50' },
}

export function PriorityPill({ value, onClick, size = 'md' }: { value: Priority | null; onClick?: () => void; size?: 'sm' | 'md' }) {
  const meta = value ? PRIORITY_META[value] : null
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-md border font-medium whitespace-nowrap transition-[color,background-color,transform] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-95',
        size === 'sm' ? 'h-6 px-2 text-[11.5px]' : 'h-7 px-2.5 text-[12.5px]',
        meta ? meta.pill : 'border-dashed border-border bg-background text-muted-foreground hover:bg-accent',
      )}
    >
      {meta ? meta.label : '+ 정하기'}
    </button>
  )
}

/** Option A: one round icon per priority — tap cycles, label for screen readers */
export const PRIORITY_ICON: Record<Priority, { icon: typeof X; cls: string }> = {
  must: { icon: ShoppingBag, cls: 'border-primary bg-primary text-primary-foreground' },
  maybe: { icon: Hourglass, cls: 'border-foreground/70 bg-background text-foreground' },
  skip: { icon: X, cls: 'border-dashed border-muted-foreground/60 bg-background text-muted-foreground' },
}

export function PriorityIcon({ value, onClick, size = 'md', showLabel }: { value: Priority | null; onClick?: () => void; size?: 'sm' | 'md'; showLabel?: boolean }) {
  const meta = value ? PRIORITY_ICON[value] : null
  const Icon = meta ? meta.icon : Plus
  const label = value ? PRIORITY_META[value].label : '미정'
  return (
    <button
      type="button"
      title={`${label} · 눌러서 바꾸기`}
      aria-label={`우선순위 ${label}, 눌러서 바꾸기`}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      className="inline-flex shrink-0 items-center gap-1.5 outline-none focus-visible:[&>span:first-child]:ring-[3px] focus-visible:[&>span:first-child]:ring-ring/50"
    >
      <motion.span
        key={value ?? 'none'}
        initial={{ scale: 0.6, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 22 }}
        className={cn(
          'grid place-items-center rounded-full border transition-colors',
          size === 'sm' ? 'size-7' : 'size-8',
          meta ? meta.cls : 'border-dashed border-border bg-background text-muted-foreground',
        )}
      >
        <Icon className={size === 'sm' ? 'size-3.5' : 'size-4'} strokeWidth={2.2} />
      </motion.span>
      {showLabel && <span className={cn('text-[12px] font-medium', value ? 'text-foreground' : 'text-muted-foreground')}>{label}</span>}
    </button>
  )
}

export const nextPriority = (p: Priority | null): Priority | null =>
  p === null ? 'must' : p === 'must' ? 'maybe' : p === 'maybe' ? 'skip' : null

function useIsDesktop() {
  const q = '(min-width: 768px)'
  const [desktop, setDesktop] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches)
  useEffect(() => {
    const m = window.matchMedia(q)
    const on = () => setDesktop(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return desktop
}

/** shadcn responsive dialog: Dialog on desktop, vaul Drawer on mobile */
export function Sheet({
  open,
  onClose,
  children,
  title,
  className,
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  className?: string
}) {
  const desktop = useIsDesktop()
  // keep Escape from also closing the page underneath
  const onEsc = (e: KeyboardEvent) => e.stopPropagation()
  const change = (v: boolean) => !v && onClose()
  if (desktop) {
    return (
      <Dialog open={open} onOpenChange={change}>
        <DialogContent onEscapeKeyDown={onEsc} showCloseButton={!!title} className={cn('max-h-[88vh] overflow-y-auto sm:max-w-[480px]', className)}>
          <DialogHeader className={title ? '' : 'sr-only'}>
            <DialogTitle>{title ?? '상세'}</DialogTitle>
            <DialogDescription className="sr-only">{title ?? '상세 정보'}</DialogDescription>
          </DialogHeader>
          <div>{children}</div>
        </DialogContent>
      </Dialog>
    )
  }
  return (
    <Drawer open={open} onOpenChange={change}>
      <DrawerContent onEscapeKeyDown={onEsc} className={cn('max-h-[92dvh]', className)}>
        <DrawerHeader className={title ? 'px-5 pt-3 pb-2 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-left' : 'sr-only'}>
          <DrawerTitle>{title ?? '상세'}</DrawerTitle>
          <DrawerDescription className="sr-only">{title ?? '상세 정보'}</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-5 pt-2 pb-[max(20px,env(safe-area-inset-bottom))]">{children}</div>
      </DrawerContent>
    </Drawer>
  )
}

/** Full-screen page on mobile, right-side panel on desktop */
/** open panels, topmost last — only the top one answers Escape */
const PANEL_STACK: symbol[] = []

export function Panel({ children, onClose, wide, z = 50 }: { children: ReactNode; onClose: () => void; wide?: boolean; z?: number }) {
  const [me] = useState(() => Symbol('panel'))
  useEffect(() => {
    PANEL_STACK.push(me)
    return () => {
      const i = PANEL_STACK.indexOf(me)
      if (i >= 0) PANEL_STACK.splice(i, 1)
    }
  }, [me])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && PANEL_STACK[PANEL_STACK.length - 1] === me && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, me])
  return (
    <div className="fixed inset-0 flex justify-end" style={{ zIndex: z }}>
      <motion.div
        className="absolute inset-0 hidden bg-black/50 lg:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.section
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 40 }}
        className={cn(
          'relative flex h-full w-full flex-col overflow-hidden bg-background lg:border-l lg:shadow-lg',
          wide ? 'lg:w-[720px]' : 'lg:w-[480px]',
        )}
      >
        {children}
      </motion.section>
    </div>
  )
}

export function IconBtn({ label, children, onClick, className }: { label: string; children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn('grid size-9 place-items-center rounded-md border bg-background/90 text-foreground shadow-xs backdrop-blur transition-[background-color,transform] hover:bg-accent active:scale-95 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50', className)}
    >
      {children}
    </button>
  )
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: T
  options: { value: T; label: ReactNode }[]
  onChange: (v: T) => void
  className?: string
}) {
  return (
    <div className={cn('relative flex h-9 items-center rounded-lg bg-muted p-[3px] text-muted-foreground', className)} role="tablist">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn('relative z-10 h-full flex-1 rounded-md px-3 text-[13px] font-medium whitespace-nowrap transition-colors', active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}
          >
            {active && <motion.span layoutId={`seg-${options.map((x) => x.value).join('')}`} className="absolute inset-0 -z-10 rounded-md border border-transparent bg-background shadow-sm" />}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
