import { motion } from 'motion/react'
import { Check, Star } from 'lucide-react'
import { useApp } from '@/lib/store'
import type { Product } from '@/lib/types'
import { cn, toWon, won, yen } from '@/lib/utils'
import { ProductArt } from './art/ProductArt'
import { PRIORITY_META, PriorityPill, nextPriority } from './ui/primitives'

export function ProductTile({ p, index = 0 }: { p: Product; index?: number }) {
  const { open, rate, update } = useApp()
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
      className="group cursor-pointer"
      onClick={() => open({ type: 'product', id: p.id })}
    >
      <div className="relative overflow-hidden rounded-[var(--radius-card)] transition group-hover:shadow-[var(--shadow-card)]">
        <ProductArt art={p.art} className="aspect-[4/5] w-full transition duration-300 group-hover:scale-[1.03]" />
        <button
          aria-label={p.favorite ? '즐겨찾기 해제' : '즐겨찾기'}
          onClick={(e) => {
            e.stopPropagation()
            update(p.id, { favorite: !p.favorite })
          }}
          className="absolute top-2.5 right-2.5 grid size-9 place-items-center rounded-full bg-white/80 backdrop-blur transition active:scale-90"
        >
          <Star className={cn('size-[18px]', p.favorite ? 'fill-[#F2B63B] text-[#F2B63B]' : 'text-muted')} strokeWidth={2.2} />
        </button>
        {p.priority && (
          <span className={cn('absolute bottom-2.5 left-2.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold', PRIORITY_META[p.priority].pill)}>{PRIORITY_META[p.priority].label}</span>
        )}
        {p.purchased && (
          <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-ink px-2.5 py-1 text-[11.5px] font-bold text-white">
            <Check className="size-3" strokeWidth={3} /> 샀어요
          </span>
        )}
      </div>
      <div className="px-1 pt-2.5">
        <h3 className="line-clamp-2 text-[14px] leading-snug font-semibold">{p.name}</h3>
        <p className="mt-1 flex items-baseline gap-1.5">
          <span className="text-[16px] font-extrabold tabular">{yen(p.price)}</span>
          <span className="text-[12px] text-muted tabular">약 {won(toWon(p.price, rate))}</span>
        </p>
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
      className="flex cursor-pointer items-center gap-3.5 rounded-[20px] bg-surface p-2.5 pr-4 shadow-[var(--shadow-card)] transition hover:ring-1 hover:ring-line"
    >
      <ProductArt art={p.art} className="size-[76px] shrink-0 rounded-2xl" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold tracking-wide text-muted">{p.brand}</p>
        <h3 className="mt-0.5 line-clamp-2 text-[14.5px] leading-snug font-semibold">{p.name}</h3>
        <p className="mt-1 flex items-baseline gap-1.5">
          <span className="text-[15px] font-extrabold tabular">{yen(p.price)}</span>
          <span className="text-[12px] text-muted tabular">약 {won(toWon(p.price, rate))}</span>
        </p>
      </div>
      {trailing ?? <PriorityPill value={p.priority} onClick={() => setPriority(p.id, nextPriority(p.priority))} />}
    </motion.li>
  )
}
