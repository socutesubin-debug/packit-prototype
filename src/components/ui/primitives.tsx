import { AnimatePresence, motion } from 'motion/react'
import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
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
      className={cn(
        'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13.5px] font-semibold transition-colors',
        active ? 'bg-ink text-white' : 'bg-surface text-ink-2 ring-1 ring-line hover:bg-sunken',
        className,
      )}
    >
      {children}
    </button>
  )
}

export const PRIORITY_META: Record<Priority, { label: string; dot: string; pill: string }> = {
  must: { label: '꼭 살래', dot: 'bg-must', pill: 'bg-ink text-white' },
  maybe: { label: '고민', dot: 'bg-maybe', pill: 'bg-[#d9d9d9] text-ink' },
  skip: { label: '안 살래', dot: 'bg-skip', pill: 'bg-sunken text-faint' },
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
        'inline-flex shrink-0 items-center justify-center rounded-full font-bold transition active:scale-95',
        size === 'sm' ? 'h-6 px-2.5 text-[11.5px]' : 'h-8 px-3 text-[12.5px]',
        meta ? meta.pill : 'bg-surface text-muted ring-1 ring-line',
      )}
    >
      {meta ? meta.label : '+ 정하기'}
    </button>
  )
}

export const nextPriority = (p: Priority | null): Priority | null =>
  p === null ? 'must' : p === 'must' ? 'maybe' : p === 'maybe' ? 'skip' : null

/** Bottom sheet on mobile, centered dialog on desktop */
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
  useEffect(() => {
    if (!open) return
    // capture phase so an Escape closes only this sheet, not the page underneath
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopImmediatePropagation()
      onClose()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open, onClose])
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div
            className="absolute inset-0 bg-ink/35 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 36 }}
            className={cn(
              'relative w-full max-w-[520px] rounded-t-[var(--radius-sheet)] bg-surface px-5 pt-3 pb-[max(20px,env(safe-area-inset-bottom))] shadow-[var(--shadow-float)] md:rounded-[var(--radius-sheet)] md:p-6',
              className,
            )}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line md:hidden" />
            {title && (
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[19px] font-bold tracking-tight">{title}</h2>
                <button onClick={onClose} aria-label="닫기" className="grid size-9 place-items-center rounded-full text-muted hover:bg-sunken">
                  <X className="size-5" />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

/** Full-screen page on mobile, right-side panel on desktop */
export function Panel({ children, onClose, wide, z = 50 }: { children: ReactNode; onClose: () => void; wide?: boolean; z?: number }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="fixed inset-0 flex justify-end" style={{ zIndex: z }}>
      <motion.div
        className="absolute inset-0 hidden bg-ink/30 backdrop-blur-[2px] lg:block"
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
          'relative flex h-full w-full flex-col overflow-hidden bg-ground lg:shadow-[var(--shadow-float)]',
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
      className={cn('grid size-10 place-items-center rounded-full bg-surface/90 text-ink shadow-[var(--shadow-card)] backdrop-blur transition active:scale-95', className)}
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
    <div className={cn('relative flex rounded-full bg-sunken p-1', className)} role="tablist">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn('relative z-10 h-9 flex-1 rounded-full px-3 text-[13.5px] font-semibold transition-colors', active ? 'text-ink' : 'text-muted')}
          >
            {active && <motion.span layoutId={`seg-${options.map((x) => x.value).join('')}`} className="absolute inset-0 -z-10 rounded-full bg-surface shadow-[var(--shadow-card)]" />}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
