import { AnimatePresence, motion } from 'motion/react'
import { Check } from 'lucide-react'
import { ProductArt } from '@/components/art/ProductArt'
import type { Art } from '@/lib/types'
import { cn } from '@/lib/utils'

const W = 196
const H = 118
export const PACK_CYCLE = 1600
const CYCLE = PACK_CYCLE

/**
 * Loading illustration for AI analysis: a hard-shell suitcase lying flat opens,
 * the item it just "found" drops in, and the lid closes — once per found item.
 * When `done`, the lid stays shut and a check pops on top.
 */
export function PackingLoader({ items, step, done, className }: { items: Art[]; step: number; done: boolean; className?: string }) {
  // one open → drop → close cycle per item being read (`step`)
  const cycle = step
  const packed = done ? items.length : Math.min(step, items.length)
  const dropping = done || !items.length ? null : items[Math.min(step, items.length - 1)]

  return (
    <div className={cn('relative mx-auto h-[300px] w-[280px] select-none', className)} aria-hidden>
      {/* floor shadow */}
      <motion.div
        className="absolute bottom-6 left-1/2 h-5 w-[230px] -translate-x-1/2 rounded-[50%] bg-foreground/10 blur-md"
        animate={done ? { scaleX: [1, 0.92, 1] } : { scaleX: 1 }}
        transition={{ duration: 0.5 }}
      />
      {/* the suitcase, lying on a table, seen from the front */}
      <motion.div
        className="absolute bottom-16 left-1/2 -ml-[98px]"
        style={{ width: W, height: H, perspective: 1100 }}
        animate={done ? { y: [0, -10, 0] } : { y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <div className="relative h-full w-full" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(56deg)' }}>
          {/* base shell: lining + packed items */}
          <div className="absolute inset-0 overflow-hidden rounded-[22px] border-[7px] border-[#2a2a2a] bg-[#ececec]">
            <div className="absolute inset-x-6 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#d6d6d6]" />
            <div className="absolute inset-y-4 left-1/2 w-[3px] -translate-x-1/2 rounded-full bg-[#d6d6d6]" />
            {items.slice(0, Math.min(packed, 4)).map((a, i) => (
              <ProductArt key={i} art={a} tone="none" tilt={(i % 2 ? 1 : -1) * 8} className={cn('absolute size-[92px]', SLOTS[i])} />
            ))}
          </div>
          {/* front wall (thickness) */}
          <div className="absolute inset-x-[6px] bottom-0 h-[30px] origin-bottom rounded-b-[16px] bg-[#1e1e1e]" style={{ transform: 'rotateX(-90deg)' }}>
            <div className="absolute top-1/2 left-1/2 h-[9px] w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#4a4a4a]" />
          </div>
          {/* lid, hinged on the back edge */}
          <motion.div
            key={done ? 'shut' : cycle}
            className="absolute inset-0 origin-top"
            style={{ transformStyle: 'preserve-3d' }}
            initial={{ rotateX: 0 }}
            animate={done ? { rotateX: 0 } : { rotateX: [0, 96, 96, 0, 0] }}
            transition={done ? { duration: 0.3 } : { duration: CYCLE / 1000, times: [0, 0.2, 0.62, 0.86, 1], ease: 'easeInOut' }}
          >
            {/* outside */}
            <div className="absolute inset-0 rounded-[22px] bg-[#262626]" style={{ backfaceVisibility: 'hidden' }}>
              {["top-0 left-0 rounded-tl-[22px]", "top-0 right-0 rounded-tr-[22px]", "bottom-0 left-0 rounded-bl-[22px]", "bottom-0 right-0 rounded-br-[22px]"].map((c) => (
                <span key={c} className={cn('absolute size-6 bg-[#4d4d4d]', c)} />
              ))}
              {[0.2, 0.35, 0.5, 0.65, 0.8].map((x) => (
                <span key={x} className="absolute inset-y-3 w-[3px] rounded-full bg-white/10" style={{ left: `${x * 100}%` }} />
              ))}
              <span className="absolute bottom-2 left-6 h-2.5 w-5 rounded-sm bg-[#8a8a8a]" />
              <span className="absolute right-6 bottom-2 h-2.5 w-5 rounded-sm bg-[#8a8a8a]" />
            </div>
            {/* inside of the lid (mesh pocket) */}
            <div className="absolute inset-0 rounded-[22px] border-[7px] border-[#2a2a2a] bg-[#f4f4f4]" style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}>
              <div className="absolute inset-x-4 bottom-4 h-[42%] rounded-lg border border-dashed border-[#c9c9c9]" />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* the found item drops in while the lid is up */}
      <AnimatePresence>
        {dropping && (
          <motion.div
            key={cycle}
            className="absolute top-2 left-1/2 -ml-[60px] size-[120px]"
            initial={{ y: -30, opacity: 0, scale: 1, rotate: -8 }}
            animate={{ y: [-30, 0, 0, 150], opacity: [0, 1, 1, 1, 0], scale: [0.9, 1, 1, 0.7], rotate: [-8, 0, 0, 12] }}
            transition={{ duration: CYCLE / 1000, times: [0.12, 0.26, 0.36, 0.56, 0.6], ease: 'easeIn' }}
          >
            <ProductArt art={dropping} tone="none" className="size-[120px] drop-shadow-lg" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* finished */}
      <AnimatePresence>
        {done && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18, delay: 0.25 }}
            className="absolute top-20 left-1/2 -ml-6 grid size-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg"
          >
            <Check className="size-6" strokeWidth={3} />
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}

const SLOTS = ['-top-3 left-2', '-top-3 right-2', '-bottom-4 left-10', '-bottom-4 right-10']
