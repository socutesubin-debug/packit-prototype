import { motion } from 'motion/react'
import { Check, Star } from 'lucide-react'
import { useApp } from '@/lib/store'
import type { Product } from '@/lib/types'
import { cn, toWon, won, yen } from '@/lib/utils'
import { ProductArt } from './art/ProductArt'
import { PriorityIcon, nextPriority } from './ui/primitives'

/** tiny deterministic tilt so cutouts feel placed by hand */
export const tiltOf = (id: string) => {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0
  return ((Math.abs(h) % 9) - 4) * 1.2
}

export function ProductTile({ p, index = 0 }: { p: Product; index?: number }) {
  const { open, rate, update, setPriority } = useApp()
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
      onClick={() => open({ type: 'product', id: p.id })}
      className="group flex cursor-pointer flex-col rounded-xl border bg-card shadow-xs p-3.5 pb-3 transition hover:shadow-[0_12px_30px_-16px_rgba(20,20,19,0.25)]"
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 min-h-[2.6em] text-[14px] leading-[1.3] font-semibold">{p.name}</h3>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5 tabular">
            <span className="text-[14px] font-semibold">{yen(p.price)}</span>
            <span className="text-[11.5px] whitespace-nowrap text-muted-foreground">약 {won(toWon(p.price, rate))}</span>
          </p>
        </div>
        <button
          aria-label={p.favorite ? '즐겨찾기 해제' : '즐겨찾기'}
          onClick={(e) => {
            e.stopPropagation()
            update(p.id, { favorite: !p.favorite })
          }}
          className="-mt-1 -mr-1 grid size-8 shrink-0 place-items-center rounded-full text-faint hover:bg-accent"
        >
          <Star className={cn('size-[17px]', p.favorite && 'fill-ink text-ink')} strokeWidth={2} />
        </button>
      </div>
      <ProductArt art={p.art} tone="none" tilt={tiltOf(p.id)} className="mt-1 aspect-square w-full transition duration-300 group-hover:scale-[1.04]" />
      <div className="flex h-8 items-center gap-1.5">
        <PriorityIcon size="sm" showLabel value={p.priority} onClick={() => setPriority(p.id, nextPriority(p.priority))} />
        <span className="flex-1" />
        {p.purchased && (
          <span className="inline-flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 text-[11px] font-semibold text-white">
            <Check className="size-3" strokeWidth={3} /> 샀어요
          </span>
        )}
      </div>
    </motion.article>
  )
}

export function ProductRow({ p, index = 0, trailing }: { p: Product; index?: number; trailing?: React.ReactNode }) {
  const { open, rate, setPriority } = useApp()
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
      onClick={() => open({ type: 'product', id: p.id })}
      className="flex cursor-pointer items-center gap-3.5 rounded-xl border bg-card shadow-xs p-2.5 pr-4 transition hover:bg-white/70"
    >
      <ProductArt art={p.art} className="size-[72px] shrink-0 rounded-2xl" tilt={tiltOf(p.id)} />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold tracking-wide text-faint">{p.brand}</p>
        <h3 className="mt-0.5 line-clamp-2 text-[14.5px] leading-snug font-semibold">{p.name}</h3>
        <p className="mt-1 flex items-baseline gap-1.5">
          <span className="text-[14.5px] font-semibold tabular">{yen(p.price)}</span>
          <span className="text-[12px] text-muted-foreground tabular">약 {won(toWon(p.price, rate))}</span>
        </p>
      </div>
      {trailing ?? <PriorityIcon value={p.priority} onClick={() => setPriority(p.id, nextPriority(p.priority))} />}
    </motion.li>
  )
}
